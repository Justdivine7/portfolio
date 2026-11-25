import 'package:flutter_test/flutter_test.dart';
import 'package:relay/core/log/event_log.dart';
import 'package:relay/core/network/network_simulator.dart';
import 'package:relay/core/sync/outbox.dart';

import 'helpers.dart';

void main() {
  group('Outbox', () {
    test('holds writes while offline and delivers them in order once back online', () async {
      final h = Harness();
      final delivered = <String>[];
      h.outbox.register('x', (item) => h.network.request('POST /x', () => delivered.add(item.id)));

      h.goOffline();
      await h.outbox.enqueue(const OutboxItem(id: 'a', kind: 'x'));
      await h.outbox.enqueue(const OutboxItem(id: 'b', kind: 'x'));
      expect(h.outbox.pending.map((i) => i.id), ['a', 'b']);
      expect(delivered, isEmpty);

      h.goOnline();
      await pumpEventQueue();
      expect(delivered, ['a', 'b']);
      expect(h.outbox.pending, isEmpty);
    });

    test('keeps a failed item at the head of the queue and counts the attempt', () async {
      final h = Harness(random: 0.0); // every flaky request fails
      h.outbox.register('x', (item) => h.network.request('POST /x', () {}));
      h.goFlaky();

      await h.outbox.enqueue(const OutboxItem(id: 'a', kind: 'x'));
      expect(h.outbox.pending.single.attempts, 1);
      expect(h.log.entries.any((e) => e.level == LogLevel.warning && e.message.startsWith('Retry #1')), isTrue);

      h.goOnline();
      await pumpEventQueue();
      expect(h.outbox.pending, isEmpty);
    });

    test('pauses instead of retrying when the connection drops', () async {
      final h = Harness();
      h.outbox.register('x', (item) => h.network.request('POST /x', () {}));
      h.goOffline();
      await h.outbox.enqueue(const OutboxItem(id: 'a', kind: 'x'));
      expect(h.outbox.pending.single.attempts, 0, reason: 'offline never burns a retry');
    });

    test('backs off exponentially up to a cap', () {
      final h = Harness();
      final outbox = Outbox(network: h.network, log: h.log);
      expect(
        [1, 2, 3, 4, 5].map((a) => outbox.backoffFor(a).inSeconds),
        [1, 2, 4, 8, 8],
      );
    });
  });

  test('NetworkException marks offline failures as unambiguous', () {
    expect(const NetworkException(NetworkFailure.offline).isAmbiguous, isFalse);
    expect(const NetworkException(NetworkFailure.timeout).isAmbiguous, isTrue);
  });
}
