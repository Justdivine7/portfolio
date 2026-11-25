import 'dart:math';

import 'package:relay/core/log/event_log.dart';
import 'package:relay/core/network/network_simulator.dart';
import 'package:relay/core/sync/outbox.dart';

/// Deterministic randomness: `nextDouble` always returns [value].
/// 0.0 makes every flaky request fail; 0.99 makes every one succeed.
class FixedRandom implements Random {
  FixedRandom(this.value);
  final double value;
  @override
  double nextDouble() => value;
  @override
  bool nextBool() => true;
  @override
  int nextInt(int max) => 0;
}

class Harness {
  Harness({double random = 0.99}) {
    log = EventLog();
    network = NetworkSimulator(log: log, random: FixedRandom(random), delay: (_) async {});
    outbox = Outbox(network: network, log: log, retryBase: Duration.zero);
  }

  late final EventLog log;
  late final NetworkSimulator network;
  late final Outbox outbox;

  void goOffline() => network.configure(network.config.copyWith(mode: NetworkMode.offline));
  void goOnline() => network.configure(network.config.copyWith(mode: NetworkMode.online));
  void goFlaky() => network.configure(network.config.copyWith(mode: NetworkMode.flaky, failureRate: 0.5));
}
