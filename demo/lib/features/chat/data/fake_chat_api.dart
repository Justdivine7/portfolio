import 'dart:async';

import '../../../core/log/event_log.dart';
import '../../../core/network/network_simulator.dart';
import '../../../core/util/format.dart';
import '../domain/message.dart';

/// The chat "server": accepts messages over HTTP and pushes the agent's
/// replies back over a simulated WebSocket ([incoming]).
class FakeChatApi {
  FakeChatApi(this._network, this._log, {this.replyDelay = const Duration(milliseconds: 1400)});

  final NetworkSimulator _network;
  final EventLog _log;
  final Duration replyDelay;
  final _incoming = StreamController<Message>.broadcast();
  final _delivered = <String>{};
  int _replyIndex = 0;

  static const _replies = [
    'Got it — sending a quote shortly.',
    'Noted. I’ll confirm with the supplier.',
    'On it. Delivery window is 2–3 days.',
    'Received — thanks.',
  ];

  Stream<Message> get incoming => _incoming.stream;

  Future<void> send(Message message) =>
      _network.request('POST /messages', () {
        // Keyed by id: a retried message is acknowledged, never duplicated.
        if (!_delivered.add(message.id)) {
          _log.success('api', 'POST /messages 200 (already delivered)');
          return;
        }
        _log.success('api', 'POST /messages 201 · ${message.id}');
        Timer(replyDelay, _pushReply);
      });

  void _pushReply() {
    if (_incoming.isClosed || _network.config.isOffline) return;
    final reply = Message(
      id: newId('msg'),
      text: _replies[_replyIndex++ % _replies.length],
      fromMe: false,
      sentAt: DateTime.now(),
    );
    _log.info('ws', 'push · new message from agent');
    _incoming.add(reply);
  }

  Future<void> dispose() => _incoming.close();
}
