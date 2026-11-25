import 'package:flutter_test/flutter_test.dart';
import 'package:relay/core/network/network_simulator.dart';
import 'package:relay/features/orders/data/fake_order_api.dart';
import 'package:relay/features/orders/data/order_repository_impl.dart';
import 'package:relay/features/orders/domain/order.dart';

import 'helpers.dart';

void main() {
  late Harness h;
  late FakeOrderApi api;
  late OrderRepositoryImpl repo;

  setUp(() {
    h = Harness();
    api = FakeOrderApi(h.network, h.log);
    repo = OrderRepositoryImpl(api: api, outbox: h.outbox, log: h.log);
  });

  test('an order placed offline appears instantly as queued, then syncs', () async {
    h.goOffline();
    final order = repo.create(title: 'Test', amount: 1000);
    expect(repo.current.first.id, order.id);
    expect(repo.current.first.status, OrderStatus.queued);

    h.goOnline();
    await pumpEventQueue();
    expect(repo.current.firstWhere((o) => o.id == order.id).status, OrderStatus.synced);
    expect((await api.list()).any((o) => o.id == order.id), isTrue);
  });

  test('refresh merges remote orders without losing unsynced local ones', () async {
    h.goOffline();
    final local = repo.create(title: 'Local only', amount: 500);
    h.network.configure(h.network.config.copyWith(mode: NetworkMode.online));
    await repo.refresh();
    final ids = repo.current.map((o) => o.id).toSet();
    expect(ids, contains('ord-remote1'));
    expect(ids, contains(local.id));
  });

  test('a failed refresh leaves the cache untouched', () async {
    final before = repo.current;
    h.goOffline();
    await expectLater(repo.refresh(), throwsA(isA<NetworkException>()));
    expect(repo.current, before);
  });

  test('retrying the same create never duplicates the order', () async {
    final order = repo.create(title: 'Once', amount: 100);
    await pumpEventQueue();
    await api.create(order);
    final matches = (await api.list()).where((o) => o.id == order.id);
    expect(matches, hasLength(1));
  });
}
