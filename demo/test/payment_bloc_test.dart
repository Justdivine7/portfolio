import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:relay/core/network/network_simulator.dart';
import 'package:relay/features/payments/data/fake_payment_api.dart';
import 'package:relay/features/payments/data/payment_repository_impl.dart';
import 'package:relay/features/payments/presentation/payment_bloc.dart';

import 'helpers.dart';

void main() {
  late Harness h;
  late PaymentSandbox sandbox;
  late FakePaymentApi api;

  setUp(() {
    h = Harness();
    sandbox = PaymentSandbox();
    api = FakePaymentApi(h.network, h.log, sandbox);
  });

  PaymentBloc build() => PaymentBloc(PaymentRepositoryImpl(api), h.log);
  Matcher phase(PaymentPhase p) => isA<PaymentState>().having((s) => s.phase, 'phase', p);

  blocTest<PaymentBloc, PaymentState>(
    'succeeds and returns a receipt',
    build: build,
    act: (b) => b.add(const PayPressed()),
    expect: () => [phase(PaymentPhase.processing), phase(PaymentPhase.success)],
    verify: (_) => expect(api.chargeCount, 1),
  );

  blocTest<PaymentBloc, PaymentState>(
    'tapping again after success never charges again',
    build: build,
    act: (b) async {
      b.add(const PayPressed());
      await pumpEventQueue();
      b.add(const PayPressed());
    },
    expect: () => [phase(PaymentPhase.processing), phase(PaymentPhase.success)],
    verify: (_) => expect(api.chargeCount, 1),
  );

  blocTest<PaymentBloc, PaymentState>(
    'a double tap only charges once',
    // Real (short) latency, so the second tap lands while the first is in flight.
    setUp: () {
      final net = NetworkSimulator(log: h.log, random: FixedRandom(0.99));
      net.configure(const NetworkConfig(latency: Duration(milliseconds: 40)));
      api = FakePaymentApi(net, h.log, sandbox);
    },
    build: build,
    wait: const Duration(milliseconds: 150),
    act: (b) => b
      ..add(const PayPressed())
      ..add(const PayPressed()),
    expect: () => [phase(PaymentPhase.processing), phase(PaymentPhase.success)],
    verify: (_) {
      expect(api.chargeCount, 1);
      expect(h.log.entries.any((e) => e.message.startsWith('Duplicate tap ignored')), isTrue);
    },
  );

  blocTest<PaymentBloc, PaymentState>(
    'a lost response is verified with the same key instead of retried blindly',
    setUp: () => sandbox.outcome = PaymentOutcome.timeout,
    build: build,
    act: (b) => b.add(const PayPressed()),
    expect: () => [phase(PaymentPhase.processing), phase(PaymentPhase.verifying), phase(PaymentPhase.success)],
    verify: (b) {
      expect(api.chargeCount, 1);
      expect(b.state.payment?.idempotencyKey, isNotNull);
    },
  );

  blocTest<PaymentBloc, PaymentState>(
    'a declined card ends declined with nothing charged',
    setUp: () => sandbox.outcome = PaymentOutcome.declined,
    build: build,
    act: (b) => b.add(const PayPressed()),
    expect: () => [phase(PaymentPhase.processing), phase(PaymentPhase.declined)],
    verify: (_) => expect(api.chargeCount, 0),
  );

  blocTest<PaymentBloc, PaymentState>(
    'a cancelled checkout ends cancelled with nothing charged',
    setUp: () => sandbox.outcome = PaymentOutcome.cancelled,
    build: build,
    act: (b) => b.add(const PayPressed()),
    wait: const Duration(milliseconds: 600),
    expect: () => [phase(PaymentPhase.processing), phase(PaymentPhase.cancelled)],
    verify: (_) => expect(api.chargeCount, 0),
  );

  blocTest<PaymentBloc, PaymentState>(
    'offline fails fast and never reaches the provider',
    setUp: () => h.goOffline(),
    build: build,
    act: (b) => b.add(const PayPressed()),
    expect: () => [phase(PaymentPhase.processing), phase(PaymentPhase.failed)],
    verify: (_) => expect(api.chargeCount, 0),
  );

  test('retrying after an unconfirmed failure reuses the idempotency key', () async {
    // Every flaky request fails: the charge and the follow-up verify both fail.
    final failing = Harness(random: 0.0);
    final failingApi = FakePaymentApi(failing.network, failing.log, PaymentSandbox());
    final b2 = PaymentBloc(PaymentRepositoryImpl(failingApi), failing.log);
    failing.goFlaky();
    b2.add(const PayPressed());
    await pumpEventQueue();
    expect(b2.state.phase, PaymentPhase.failed);
    final key = b2.state.idempotencyKey;
    expect(key, isNotNull);

    failing.goOnline();
    b2.add(const PayPressed());
    await pumpEventQueue();
    expect(b2.state.phase, PaymentPhase.success);
    expect(b2.state.payment?.idempotencyKey, key);
    expect(failingApi.chargeCount, 1);
    await b2.close();
  });
}
