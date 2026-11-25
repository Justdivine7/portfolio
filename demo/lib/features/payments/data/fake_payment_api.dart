import '../../../core/log/event_log.dart';
import '../../../core/network/network_simulator.dart';
import '../../../core/util/format.dart';
import '../domain/payment.dart';

/// What the payment provider will do next — chosen in the developer menu.
enum PaymentOutcome { success, declined, cancelled, timeout }

/// Holds the sandbox setting shared by the developer menu and the fake API.
class PaymentSandbox {
  PaymentOutcome outcome = PaymentOutcome.success;
}

/// The payment provider. Charges are recorded in a ledger keyed by
/// idempotency key, like Paystack/Flutterwave references.
class FakePaymentApi {
  FakePaymentApi(this._network, this._log, this._sandbox);

  final NetworkSimulator _network;
  final EventLog _log;
  final PaymentSandbox _sandbox;
  final _ledger = <String, Payment>{};

  int get chargeCount => _ledger.length;

  Future<Payment> charge({required int amount, required String key}) async {
    final existing = _ledger[key];
    if (existing != null) {
      return _network.request('POST /payments', () {
        _log.success('api', 'POST /payments 200 · replayed $key (no second charge)');
        return existing;
      });
    }
    switch (_sandbox.outcome) {
      case PaymentOutcome.cancelled:
        await Future<void>.delayed(const Duration(milliseconds: 500));
        _log.warn('pay', 'Checkout closed by user · nothing charged');
        throw const PaymentCancelled();
      case PaymentOutcome.declined:
        await _network.request('POST /payments', () {
          _log.error('api', 'POST /payments 402 · card declined');
        });
        throw const PaymentDeclined('Card declined — insufficient funds.');
      case PaymentOutcome.timeout:
        // The charge succeeds on the server, but the response never arrives.
        await _network.request('POST /payments', () => _record(amount, key));
        _log.error('net', 'POST /payments × timeout after the server charged');
        throw const NetworkException(NetworkFailure.timeout);
      case PaymentOutcome.success:
        return _network.request('POST /payments', () => _record(amount, key));
    }
  }

  Future<Payment?> verify(String key) =>
      _network.request('GET /payments/$key', () {
        final payment = _ledger[key];
        _log.info(
          'api',
          'GET /payments/$key ${payment == null ? '404 · no charge' : '200 · charged'}',
        );
        return payment;
      });

  Payment _record(int amount, String key) {
    final payment = Payment(
      reference: newId('pay').toUpperCase(),
      amount: amount,
      idempotencyKey: key,
    );
    _ledger[key] = payment;
    _log.success('api', 'POST /payments 201 · ${payment.reference}');
    return payment;
  }
}
