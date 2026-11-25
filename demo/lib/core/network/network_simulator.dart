import 'dart:async';
import 'dart:math';

import 'package:equatable/equatable.dart';

import '../log/event_log.dart';

enum NetworkMode { online, flaky, offline }

final class NetworkConfig extends Equatable {
  const NetworkConfig({
    this.mode = NetworkMode.online,
    this.latency = const Duration(milliseconds: 700),
    this.failureRate = 0.4,
  });

  final NetworkMode mode;
  final Duration latency;

  /// Probability (0–1) that a request fails while [mode] is [NetworkMode.flaky].
  final double failureRate;

  bool get isOffline => mode == NetworkMode.offline;

  NetworkConfig copyWith({
    NetworkMode? mode,
    Duration? latency,
    double? failureRate,
  }) =>
      NetworkConfig(
        mode: mode ?? this.mode,
        latency: latency ?? this.latency,
        failureRate: failureRate ?? this.failureRate,
      );

  @override
  List<Object?> get props => [mode, latency, failureRate];
}

enum NetworkFailure { offline, timeout, server }

final class NetworkException implements Exception {
  const NetworkException(this.failure);

  final NetworkFailure failure;

  /// True when the request may have reached the server before failing,
  /// so the outcome is unknown and must be verified before retrying.
  bool get isAmbiguous => failure != NetworkFailure.offline;

  String get message => switch (failure) {
        NetworkFailure.offline => 'No connection',
        NetworkFailure.timeout => 'Request timed out',
        NetworkFailure.server => 'Server error (503)',
      };

  @override
  String toString() => 'NetworkException(${failure.name})';
}

typedef Delay = Future<void> Function(Duration duration);

/// Stands in for the real network.
///
/// Every request pays latency, can fail on a flaky connection and fails fast
/// when offline — all controlled live from the developer menu. Everything
/// above this class is ordinary production-style app code.
class NetworkSimulator {
  NetworkSimulator({required EventLog log, Random? random, Delay? delay})
      : _log = log,
        _random = random ?? Random(),
        _delay = delay ?? Future<void>.delayed;

  final EventLog _log;
  final Random _random;
  final Delay _delay;
  final _controller = StreamController<NetworkConfig>.broadcast();
  NetworkConfig _config = const NetworkConfig();

  NetworkConfig get config => _config;
  Stream<NetworkConfig> get changes => _controller.stream;

  void configure(NetworkConfig config) {
    if (config == _config) return;
    final modeChanged = config.mode != _config.mode;
    _config = config;
    if (modeChanged) {
      _log.add(
        config.isOffline ? LogLevel.warning : LogLevel.info,
        'net',
        'Connection: ${config.mode.name}',
      );
    }
    _controller.add(config);
  }

  Future<T> request<T>(String label, FutureOr<T> Function() respond) async {
    if (_config.isOffline) {
      _log.error('net', '$label × offline');
      throw const NetworkException(NetworkFailure.offline);
    }
    final jitter = 0.75 + _random.nextDouble() * 0.5;
    await _delay(_config.latency * jitter);
    if (_config.isOffline) {
      _log.error('net', '$label × connection lost');
      throw const NetworkException(NetworkFailure.offline);
    }
    if (_config.mode == NetworkMode.flaky &&
        _random.nextDouble() < _config.failureRate) {
      final failure =
          _random.nextBool() ? NetworkFailure.timeout : NetworkFailure.server;
      _log.error(
        'net',
        '$label × ${failure == NetworkFailure.timeout ? 'timeout' : '503'}',
      );
      throw NetworkException(failure);
    }
    return respond();
  }

  Future<void> dispose() => _controller.close();
}
