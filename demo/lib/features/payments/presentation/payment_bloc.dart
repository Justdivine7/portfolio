import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/log/event_log.dart';
import '../../../core/network/network_simulator.dart';
import '../../../core/util/format.dart';
import '../domain/payment.dart';

enum PaymentPhase { idle, processing, verifying, success, declined, cancelled, failed }

sealed class PaymentEvent {
  const PaymentEvent();
}

final class PayPressed extends PaymentEvent {
  const PayPressed();
}

final class PaymentReset extends PaymentEvent {
  const PaymentReset();
}

final class PaymentState extends Equatable {
  const PaymentState({
    this.phase = PaymentPhase.idle,
    this.amount = 45250,
    this.idempotencyKey,
    this.payment,
    this.message,
  });

  final PaymentPhase phase;
  final int amount;

  /// Kept across retries of the same intent, cleared once the outcome is
  /// known — so a retry after a timeout can never double-charge.
  final String? idempotencyKey;
  final Payment? payment;
  final String? message;

  bool get busy =>
      phase == PaymentPhase.processing || phase == PaymentPhase.verifying;

  @override
  List<Object?> get props => [phase, amount, idempotencyKey, payment, message];
}

class PaymentBloc extends Bloc<PaymentEvent, PaymentState> {
  PaymentBloc(this._repository, this._log) : super(const PaymentState()) {
    on<PayPressed>(_onPay);
    on<PaymentReset>((event, emit) => emit(PaymentState(amount: state.amount)));
  }

  final PaymentRepository _repository;
  final EventLog _log;

  Future<void> _onPay(PayPressed event, Emitter<PaymentState> emit) async {
    if (state.busy) {
      _log.warn('pay', 'Duplicate tap ignored — payment in progress');
      return;
    }
    if (state.phase == PaymentPhase.success) {
      _log.warn('pay', 'Duplicate tap ignored — already paid');
      return;
    }
    final key = state.idempotencyKey ?? newId('idem');
    emit(PaymentState(
      phase: PaymentPhase.processing,
      amount: state.amount,
      idempotencyKey: key,
    ));
    _log.info('pay', 'Charging ${naira(state.amount)} · key $key');

    try {
      final payment = await _repository.pay(amount: state.amount, idempotencyKey: key);
      emit(PaymentState(phase: PaymentPhase.success, amount: state.amount, payment: payment));
    } on PaymentDeclined catch (e) {
      emit(PaymentState(
        phase: PaymentPhase.declined,
        amount: state.amount,
        message: '${e.reason} You weren’t charged.',
      ));
    } on PaymentCancelled {
      emit(PaymentState(
        phase: PaymentPhase.cancelled,
        amount: state.amount,
        message: 'Checkout closed — you weren’t charged.',
      ));
    } on NetworkException catch (e) {
      if (!e.isAmbiguous) {
        emit(PaymentState(
          phase: PaymentPhase.failed,
          amount: state.amount,
          message: 'You’re offline — nothing was sent, so you weren’t charged.',
        ));
        return;
      }
      // The request may have reached the provider. Never retry blindly:
      // ask the server what happened to this key first.
      emit(PaymentState(phase: PaymentPhase.verifying, amount: state.amount, idempotencyKey: key));
      _log.warn('pay', '${e.message} — verifying $key before any retry');
      try {
        final payment = await _repository.verify(key);
        if (payment != null) {
          emit(PaymentState(phase: PaymentPhase.success, amount: state.amount, payment: payment));
        } else {
          emit(PaymentState(
            phase: PaymentPhase.failed,
            amount: state.amount,
            idempotencyKey: key,
            message: 'The payment didn’t go through. Trying again is safe.',
          ));
        }
      } on NetworkException {
        emit(PaymentState(
          phase: PaymentPhase.failed,
          amount: state.amount,
          idempotencyKey: key,
          message: 'We couldn’t confirm it yet. Retrying is safe — the same key can’t charge twice.',
        ));
      }
    }
  }
}
