import 'dart:async';

import '../../../core/log/event_log.dart';
import '../../../core/network/network_simulator.dart';
import '../../../core/sync/outbox.dart';
import '../../../core/util/format.dart';
import '../domain/order.dart';
import 'fake_order_api.dart';

/// Offline-first: the local cache is the source of truth for the UI.
/// Writes land in the cache immediately and reach the server through the
/// [Outbox]; reads refresh the cache when the network allows.
class OrderRepositoryImpl implements OrderRepository {
  OrderRepositoryImpl({
    required FakeOrderApi api,
    required Outbox outbox,
    required EventLog log,
    DateTime? now,
  })  : _api = api,
        _outbox = outbox,
        _log = log,
        _cache = FakeOrderApi.seedOrders(now ?? DateTime.now()) {
    _outbox.register(_kind, _sync);
  }

  static const _kind = 'order.create';

  final FakeOrderApi _api;
  final Outbox _outbox;
  final EventLog _log;
  final _controller = StreamController<List<Order>>.broadcast();
  List<Order> _cache;

  @override
  List<Order> get current => List.unmodifiable(_cache);

  @override
  Stream<List<Order>> watch() async* {
    yield current;
    yield* _controller.stream;
  }

  @override
  Future<DateTime> refresh() async {
    final remote = await _api.list();
    final remoteIds = remote.map((o) => o.id).toSet();
    final localOnly = _cache.where(
      (o) => o.status != OrderStatus.synced && !remoteIds.contains(o.id),
    );
    _set([...localOnly, ...remote]);
    return DateTime.now();
  }

  @override
  Order create({required String title, required int amount}) {
    final order = Order(
      id: newId('ord'),
      title: title,
      amount: amount,
      createdAt: DateTime.now(),
      status: OrderStatus.queued,
    );
    _set([order, ..._cache]);
    _log.info('orders', 'Saved ${order.id} locally (optimistic)');
    unawaited(_outbox.enqueue(OutboxItem(id: order.id, kind: _kind)));
    return order;
  }

  Future<void> _sync(OutboxItem item) async {
    final order = _find(item.id);
    if (order == null) return;
    _update(item.id, OrderStatus.syncing);
    try {
      await _api.create(order);
      _update(item.id, OrderStatus.synced);
    } on NetworkException catch (e) {
      _update(
        item.id,
        e.failure == NetworkFailure.offline
            ? OrderStatus.queued
            : OrderStatus.retrying,
      );
      rethrow;
    }
  }

  Order? _find(String id) {
    for (final o in _cache) {
      if (o.id == id) return o;
    }
    return null;
  }

  void _update(String id, OrderStatus status) => _set([
        for (final o in _cache) o.id == id ? o.copyWith(status: status) : o,
      ]);

  void _set(List<Order> orders) {
    orders.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    _cache = orders;
    _controller.add(current);
  }

  Future<void> dispose() => _controller.close();
}
