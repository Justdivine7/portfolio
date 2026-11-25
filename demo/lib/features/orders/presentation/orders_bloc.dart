import 'dart:math';

import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/network/network_simulator.dart';
import '../domain/order.dart';

sealed class OrdersEvent {
  const OrdersEvent();
}

final class OrdersStarted extends OrdersEvent {
  const OrdersStarted();
}

final class OrdersRefreshRequested extends OrdersEvent {
  const OrdersRefreshRequested();
}

final class OrderCreateRequested extends OrdersEvent {
  const OrderCreateRequested();
}

final class OrdersState extends Equatable {
  const OrdersState({
    this.orders = const [],
    this.refreshing = false,
    this.lastSyncedAt,
    this.notice,
  });

  final List<Order> orders;
  final bool refreshing;
  final DateTime? lastSyncedAt;

  /// Shown above the list when the latest refresh failed.
  final String? notice;

  int get unsynced => orders.where((o) => o.status != OrderStatus.synced).length;

  OrdersState copyWith({
    List<Order>? orders,
    bool? refreshing,
    DateTime? lastSyncedAt,
    String? Function()? notice,
  }) =>
      OrdersState(
        orders: orders ?? this.orders,
        refreshing: refreshing ?? this.refreshing,
        lastSyncedAt: lastSyncedAt ?? this.lastSyncedAt,
        notice: notice != null ? notice() : this.notice,
      );

  @override
  List<Object?> get props => [orders, refreshing, lastSyncedAt, notice];
}

class OrdersBloc extends Bloc<OrdersEvent, OrdersState> {
  OrdersBloc(this._repository, {Random? random})
      : _random = random ?? Random(),
        super(const OrdersState()) {
    on<OrdersStarted>(_onStarted);
    on<OrdersRefreshRequested>(_onRefresh);
    on<OrderCreateRequested>(_onCreate);
  }

  final OrderRepository _repository;
  final Random _random;

  static const _catalogue = [
    ('Phone cases ×120', 38000),
    ('Packaging sleeves', 12500),
    ('Courier: Yaba to VI', 4800),
    ('Restock: palm oil 25L', 41000),
    ('Fabric rolls ×6', 96000),
    ('Printer ink, 4 colours', 27500),
  ];

  Future<void> _onStarted(OrdersStarted event, Emitter<OrdersState> emit) async {
    add(const OrdersRefreshRequested());
    await emit.forEach<List<Order>>(
      _repository.watch(),
      onData: (orders) => state.copyWith(orders: orders),
    );
  }

  Future<void> _onRefresh(
    OrdersRefreshRequested event,
    Emitter<OrdersState> emit,
  ) async {
    if (state.refreshing) return;
    emit(state.copyWith(refreshing: true));
    try {
      final at = await _repository.refresh();
      emit(state.copyWith(refreshing: false, lastSyncedAt: at, notice: () => null));
    } on NetworkException catch (e) {
      emit(state.copyWith(
        refreshing: false,
        notice: () => e.failure == NetworkFailure.offline
            ? 'You’re offline — showing saved orders.'
            : '${e.message} — showing saved orders.',
      ));
    }
  }

  void _onCreate(OrderCreateRequested event, Emitter<OrdersState> emit) {
    final (title, amount) = _catalogue[_random.nextInt(_catalogue.length)];
    _repository.create(title: title, amount: amount);
  }
}
