import 'package:equatable/equatable.dart';

final class Payment extends Equatable {
  const Payment({
    required this.reference,
    required this.amount,
    required this.idempotencyKey,
  });

  final String reference;
  final int amount;

  /// One key per payment intent. Retrying with the same key can never charge
  /// twice — the server returns the original result instead.
  final String idempotencyKey;

  @override
  List<Object?> get props => [reference, amount, idempotencyKey];
}

/// The provider rejected the charge. Safe to retry with a new intent.
final class PaymentDeclined implements Exception {
  const PaymentDeclined(this.reason);
  final String reason;
}

/// The user closed the checkout before paying. Nothing was charged.
final class PaymentCancelled implements Exception {
  const PaymentCancelled();
}

abstract interface class PaymentRepository {
  /// Throws [PaymentDeclined], [PaymentCancelled] or a `NetworkException`.
  Future<Payment> pay({required int amount, required String idempotencyKey});

  /// Asks the server whether a payment with this key exists.
  /// Used after an ambiguous failure (timeout, 5xx) before allowing a retry.
  Future<Payment?> verify(String idempotencyKey);
}
