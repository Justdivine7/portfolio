import 'package:equatable/equatable.dart';

enum OrderStatus {
  /// Saved locally; waiting for a connection.
  queued,

  /// Being sent to the server right now.
  syncing,

  /// A send failed transiently; the outbox will retry with backoff.
  retrying,

  /// Confirmed by the server.
  synced,
}

final class Order extends Equatable {
  const Order({
    required this.id,
    required this.title,
    required this.amount,
    required this.createdAt,
    required this.status,
  });

  final String id;
  final String title;
  final int amount;
  final DateTime createdAt;
  final OrderStatus status;

  Order copyWith({OrderStatus? status}) => Order(
        id: id,
        title: title,
        amount: amount,
        createdAt: createdAt,
        status: status ?? this.status,
      );

  @override
  List<Object?> get props => [id, title, amount, createdAt, status];
}

abstract interface class OrderRepository {
  /// Emits the current orders immediately, then every change.
  Stream<List<Order>> watch();

  List<Order> get current;

  /// Pulls the latest orders from the server and merges them with local,
  /// not-yet-synced orders. Returns the sync time.
  /// Throws a `NetworkException` — callers keep showing the cache.
  Future<DateTime> refresh();

  /// Saves the order locally right away (optimistic) and queues it for sync.
  Order create({required String title, required int amount});
}
