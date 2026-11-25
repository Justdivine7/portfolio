import 'dart:async';
import 'dart:math';

import 'package:equatable/equatable.dart';

import '../log/event_log.dart';
import '../network/network_simulator.dart';

final class OutboxItem extends Equatable {
  const OutboxItem({required this.id, required this.kind, this.attempts = 0});

  /// Id of the entity this write belongs to (an order, a message…).
  final String id;

  /// Which handler delivers it, e.g. `order.create`.
  final String kind;
  final int attempts;

  OutboxItem retried() => OutboxItem(id: id, kind: kind, attempts: attempts + 1);

  @override
  List<Object?> get props => [id, kind, attempts];
}

typedef OutboxHandler = Future<void> Function(OutboxItem item);

/// A queue of writes made offline or that failed in flight.
///
/// Items are delivered strictly in order. When the connection returns the
/// queue flushes on its own; transient failures retry with exponential
/// backoff, and going offline pauses the queue instead of burning retries.
class Outbox {
  Outbox({
    required NetworkSimulator network,
    required EventLog log,
    this.retryBase = const Duration(seconds: 1),
    this.maxBackoff = const Duration(seconds: 8),
  })  : _network = network,
        _log = log {
    _subscription = network.changes.listen((config) {
      if (!config.isOffline) unawaited(flush());
    });
  }

  final NetworkSimulator _network;
  final EventLog _log;
  final Duration retryBase;
  final Duration maxBackoff;

  final _handlers = <String, OutboxHandler>{};
  final _queue = <OutboxItem>[];
  final _controller = StreamController<List<OutboxItem>>.broadcast();
  late final StreamSubscription<NetworkConfig> _subscription;
  Timer? _retryTimer;
  bool _flushing = false;

  List<OutboxItem> get pending => List.unmodifiable(_queue);
  Stream<List<OutboxItem>> get changes => _controller.stream;

  void register(String kind, OutboxHandler handler) => _handlers[kind] = handler;

  /// Queues [item] and kicks off a flush. The returned future completes when
  /// that flush attempt finishes; callers on the UI path don't await it.
  Future<void> enqueue(OutboxItem item) {
    _queue.add(item);
    _emit();
    _log.info('outbox', 'Queued ${item.kind} · ${_queue.length} pending');
    return flush();
  }

  Future<void> flush() async {
    if (_flushing || _queue.isEmpty || _network.config.isOffline) return;
    _flushing = true;
    _retryTimer?.cancel();
    try {
      while (_queue.isNotEmpty && !_network.config.isOffline) {
        final item = _queue.first;
        final handler = _handlers[item.kind];
        if (handler == null) {
          _queue.removeAt(0);
          _log.error('outbox', 'No handler for ${item.kind} — dropped');
          _emit();
          continue;
        }
        try {
          await handler(item);
          if (_queue.isNotEmpty && _queue.first.id == item.id) {
            _queue.removeAt(0);
          }
          _log.success('outbox', 'Synced ${item.kind} · ${_queue.length} left');
          _emit();
        } on NetworkException catch (e) {
          if (_queue.isEmpty || _queue.first.id != item.id) break;
          final retried = item.retried();
          _queue[0] = retried;
          _emit();
          if (e.failure == NetworkFailure.offline) {
            _log.warn('outbox', 'Paused — offline · ${_queue.length} pending');
            break;
          }
          final wait = backoffFor(retried.attempts);
          _log.warn(
            'outbox',
            'Retry #${retried.attempts} in ${(wait.inMilliseconds / 1000).toStringAsFixed(1)}s',
          );
          _retryTimer = Timer(wait, () => unawaited(flush()));
          break;
        }
      }
    } finally {
      _flushing = false;
    }
  }

  /// 1s, 2s, 4s, 8s… capped at [maxBackoff].
  Duration backoffFor(int attempts) {
    final ms = retryBase.inMilliseconds * pow(2, max(0, attempts - 1));
    return Duration(milliseconds: min(ms.toInt(), maxBackoff.inMilliseconds));
  }

  void _emit() => _controller.add(pending);

  Future<void> dispose() async {
    _retryTimer?.cancel();
    await _subscription.cancel();
    await _controller.close();
  }
}
