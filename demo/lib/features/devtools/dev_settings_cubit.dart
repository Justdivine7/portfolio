import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../core/network/network_simulator.dart';
import '../../core/sync/outbox.dart';
import '../payments/data/fake_payment_api.dart';

final class DevSettings extends Equatable {
  const DevSettings({
    this.network = const NetworkConfig(),
    this.paymentOutcome = PaymentOutcome.success,
  });

  final NetworkConfig network;
  final PaymentOutcome paymentOutcome;

  @override
  List<Object?> get props => [network, paymentOutcome];
}

/// Backs the developer menu: every change is pushed to the simulated
/// network or payment sandbox the moment it's made.
class DevSettingsCubit extends Cubit<DevSettings> {
  DevSettingsCubit(this._network, this._sandbox)
      : super(DevSettings(network: _network.config, paymentOutcome: _sandbox.outcome));

  final NetworkSimulator _network;
  final PaymentSandbox _sandbox;

  void setMode(NetworkMode mode) => _apply(state.network.copyWith(mode: mode));
  void setLatency(Duration latency) => _apply(state.network.copyWith(latency: latency));
  void setFailureRate(double rate) => _apply(state.network.copyWith(failureRate: rate));

  void setPaymentOutcome(PaymentOutcome outcome) {
    _sandbox.outcome = outcome;
    emit(DevSettings(network: state.network, paymentOutcome: outcome));
  }

  void _apply(NetworkConfig config) {
    _network.configure(config);
    emit(DevSettings(network: config, paymentOutcome: state.paymentOutcome));
  }
}

final class SyncStatus extends Equatable {
  const SyncStatus({this.mode = NetworkMode.online, this.pending = 0});

  final NetworkMode mode;
  final int pending;

  @override
  List<Object?> get props => [mode, pending];
}

/// Connection + outbox size, for the status chip in the app bar.
class SyncStatusCubit extends Cubit<SyncStatus> {
  SyncStatusCubit(NetworkSimulator network, Outbox outbox)
      : super(SyncStatus(mode: network.config.mode, pending: outbox.pending.length)) {
    _subs = [
      network.changes.listen((c) => emit(SyncStatus(mode: c.mode, pending: state.pending))),
      outbox.changes.listen((q) => emit(SyncStatus(mode: state.mode, pending: q.length))),
    ];
  }

  late final List<StreamSubscription<Object?>> _subs;

  @override
  Future<void> close() async {
    for (final s in _subs) {
      await s.cancel();
    }
    return super.close();
  }
}
