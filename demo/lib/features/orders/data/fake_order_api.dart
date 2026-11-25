import '../../../core/log/event_log.dart';
import '../../../core/network/network_simulator.dart';
import '../domain/order.dart';

/// The "server" for orders. Writes are keyed by id, so a retried create is
/// idempotent: sending the same order twice never duplicates it.
class FakeOrderApi {
  FakeOrderApi(this._network, this._log, {DateTime? now}) {
    final t = now ?? DateTime.now();
    for (final order in seedOrders(t)) {
      _server[order.id] = order;
    }
    // Placed "on another device" — appears after the first refresh.
    _server['ord-remote1'] = Order(
      id: 'ord-remote1',
      title: 'Courier: Lekki to Ikeja',
      amount: 6500,
      createdAt: t.subtract(const Duration(minutes: 2)),
      status: OrderStatus.synced,
    );
  }

  final NetworkSimulator _network;
  final EventLog _log;
  final _server = <String, Order>{};

  Future<List<Order>> list() => _network.request('GET /orders', () {
        _log.success('api', 'GET /orders 200 · ${_server.length} orders');
        return _server.values.toList();
      });

  Future<void> create(Order order) =>
      _network.request('POST /orders', () {
        final existed = _server.containsKey(order.id);
        _server[order.id] = order.copyWith(status: OrderStatus.synced);
        _log.success(
          'api',
          'POST /orders ${existed ? '200 (already saved)' : '201'} · ${order.id}',
        );
      });

  /// What the device had cached from its last session.
  static List<Order> seedOrders(DateTime now) => [
        Order(
          id: 'ord-seed3',
          title: 'Restock: 40kg rice',
          amount: 72000,
          createdAt: now.subtract(const Duration(minutes: 18)),
          status: OrderStatus.synced,
        ),
        Order(
          id: 'ord-seed2',
          title: '200 canvas tote bags',
          amount: 45000,
          createdAt: now.subtract(const Duration(hours: 2)),
          status: OrderStatus.synced,
        ),
        Order(
          id: 'ord-seed1',
          title: 'Supplier deposit',
          amount: 150000,
          createdAt: now.subtract(const Duration(hours: 5)),
          status: OrderStatus.synced,
        ),
      ];
}
