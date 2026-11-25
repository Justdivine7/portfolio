import 'dart:async';

import '../../../core/log/event_log.dart';
import '../../../core/network/network_simulator.dart';
import '../../../core/sync/outbox.dart';
import '../../../core/util/format.dart';
import '../domain/message.dart';
import 'fake_chat_api.dart';

/// Two delivery strategies, chosen by connectivity:
/// * online — send now; if it fails, mark it failed and let the user retry
///   (a chat message is time-sensitive, so silent retries could surprise them);
/// * offline — queue it in the [Outbox], which sends it when the connection
///   returns.
class ChatRepositoryImpl implements ChatRepository {
  ChatRepositoryImpl({
    required FakeChatApi api,
    required Outbox outbox,
    required NetworkSimulator network,
    required EventLog log,
  })  : _api = api,
        _outbox = outbox,
        _network = network,
        _log = log {
    _outbox.register(_kind, _deliverQueued);
    _incoming = _api.incoming.listen((m) => _set([..._messages, m]));
    final now = DateTime.now();
    _messages = [
      Message(
        id: 'msg-seed1',
        text: 'Hi! I’m your Relay agent. Send me anything.',
        fromMe: false,
        sentAt: now.subtract(const Duration(minutes: 3)),
      ),
      Message(
        id: 'msg-seed2',
        text: 'Then open the developer menu and make the network flaky or go offline — messages still show instantly.',
        fromMe: false,
        sentAt: now.subtract(const Duration(minutes: 3)),
      ),
    ];
  }

  static const _kind = 'message.send';

  final FakeChatApi _api;
  final Outbox _outbox;
  final NetworkSimulator _network;
  final EventLog _log;
  final _controller = StreamController<List<Message>>.broadcast();
  late final StreamSubscription<Message> _incoming;
  late List<Message> _messages;

  @override
  Stream<List<Message>> watch() async* {
    yield List.unmodifiable(_messages);
    yield* _controller.stream;
  }

  @override
  void send(String text) {
    final trimmed = text.trim();
    if (trimmed.isEmpty) return;
    final message = Message(
      id: newId('msg'),
      text: trimmed,
      fromMe: true,
      sentAt: DateTime.now(),
      status: MessageStatus.sending,
    );
    _set([..._messages, message]);
    _dispatch(message.id);
  }

  @override
  void retry(String id) {
    _log.info('chat', 'Retrying $id');
    _dispatch(id);
  }

  void _dispatch(String id) {
    if (_network.config.isOffline) {
      _update(id, MessageStatus.queued);
      unawaited(_outbox.enqueue(OutboxItem(id: id, kind: _kind)));
      return;
    }
    _update(id, MessageStatus.sending);
    unawaited(_deliverNow(id));
  }

  Future<void> _deliverNow(String id) async {
    final message = _find(id);
    if (message == null) return;
    try {
      await _api.send(message);
      _update(id, MessageStatus.sent);
    } on NetworkException catch (e) {
      if (e.failure == NetworkFailure.offline) {
        _update(id, MessageStatus.queued);
        unawaited(_outbox.enqueue(OutboxItem(id: id, kind: _kind)));
      } else {
        _update(id, MessageStatus.failed);
        _log.warn('chat', 'Not delivered — tap to retry');
      }
    }
  }

  Future<void> _deliverQueued(OutboxItem item) async {
    final message = _find(item.id);
    if (message == null) return;
    _update(item.id, MessageStatus.sending);
    try {
      await _api.send(message);
      _update(item.id, MessageStatus.sent);
    } on NetworkException {
      _update(item.id, MessageStatus.queued);
      rethrow;
    }
  }

  Message? _find(String id) {
    for (final m in _messages) {
      if (m.id == id) return m;
    }
    return null;
  }

  void _update(String id, MessageStatus status) => _set([
        for (final m in _messages) m.id == id ? m.copyWith(status: status) : m,
      ]);

  void _set(List<Message> messages) {
    _messages = messages;
    _controller.add(List.unmodifiable(_messages));
  }

  Future<void> dispose() async {
    await _incoming.cancel();
    await _controller.close();
  }
}
