import '../domain/payment.dart';
import 'fake_payment_api.dart';

class PaymentRepositoryImpl implements PaymentRepository {
  PaymentRepositoryImpl(this._api);

  final FakePaymentApi _api;

  @override
  Future<Payment> pay({required int amount, required String idempotencyKey}) =>
      _api.charge(amount: amount, key: idempotencyKey);

  @override
  Future<Payment?> verify(String idempotencyKey) => _api.verify(idempotencyKey);
}
