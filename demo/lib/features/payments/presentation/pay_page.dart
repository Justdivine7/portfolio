import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../app/theme.dart';
import '../../../core/util/format.dart';
import '../../devtools/dev_settings_cubit.dart';
import '../data/fake_payment_api.dart';
import 'payment_bloc.dart';

class PayPage extends StatelessWidget {
  const PayPage({super.key, required this.onOpenDevMenu});

  final VoidCallback onOpenDevMenu;

  @override
  Widget build(BuildContext context) {
    final outcome = context.select((DevSettingsCubit c) => c.state.paymentOutcome);
    return BlocBuilder<PaymentBloc, PaymentState>(
      builder: (context, state) {
        final bloc = context.read<PaymentBloc>();
        return ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
          children: [
            Padding(
              padding: const EdgeInsets.only(left: 2, bottom: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Checkout', style: Theme.of(context).textTheme.headlineSmall),
                  const SizedBox(height: 2),
                  Text('Supplier payment · RL-2041', style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ),
            RelayCard(
              child: Column(
                children: [
                  _Line('Subtotal', naira(state.amount - 250)),
                  _Line('Processing fee', naira(250)),
                  const Divider(height: 22),
                  _Line('Total', naira(state.amount), bold: true),
                ],
              ),
            ),
            const SizedBox(height: 10),
            Material(
              color: Colors.transparent,
              child: InkWell(
                borderRadius: BorderRadius.circular(12),
                onTap: onOpenDevMenu,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
                  child: Row(
                    children: [
                      const Icon(Icons.science_outlined, size: 16, color: RelayColors.ink3),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text.rich(
                          TextSpan(children: [
                            const TextSpan(text: 'Provider sandbox: '),
                            TextSpan(text: _outcomeLabel(outcome), style: const TextStyle(fontWeight: FontWeight.w700, color: RelayColors.ink)),
                            const TextSpan(text: ' · change it'),
                          ]),
                          style: const TextStyle(fontSize: 12.5, color: RelayColors.ink3),
                        ),
                      ),
                      const Icon(Icons.tune_rounded, size: 16, color: RelayColors.ink3),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 10),
            FilledButton(
              // Deliberately still tappable while busy: the BLoC ignores
              // duplicate taps, and the console shows it doing so.
              onPressed: state.phase == PaymentPhase.success ? null : () => bloc.add(const PayPressed()),
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 180),
                child: switch (state.phase) {
                  PaymentPhase.processing => const _Busy(key: ValueKey('p'), label: 'Processing…'),
                  PaymentPhase.verifying => const _Busy(key: ValueKey('v'), label: 'Confirming with provider…'),
                  PaymentPhase.success => const Text('Paid', key: ValueKey('ok')),
                  PaymentPhase.idle => Text('Pay ${naira(state.amount)}', key: const ValueKey('i')),
                  _ => Text('Try again · ${naira(state.amount)}', key: const ValueKey('r')),
                },
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Tap Pay twice quickly — only one charge goes through.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: RelayColors.ink3),
            ),
            const SizedBox(height: 14),
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 240),
              child: _Result(key: ValueKey(state.phase), state: state, onReset: () => bloc.add(const PaymentReset())),
            ),
          ],
        );
      },
    );
  }

  static String _outcomeLabel(PaymentOutcome o) => switch (o) {
        PaymentOutcome.success => 'succeeds',
        PaymentOutcome.declined => 'declines',
        PaymentOutcome.cancelled => 'user cancels',
        PaymentOutcome.timeout => 'times out',
      };
}

class _Line extends StatelessWidget {
  const _Line(this.label, this.value, {this.bold = false});
  final String label;
  final String value;
  final bool bold;

  @override
  Widget build(BuildContext context) {
    final style = TextStyle(
      fontSize: bold ? 16 : 14,
      fontWeight: bold ? FontWeight.w700 : FontWeight.w400,
      color: bold ? RelayColors.ink : RelayColors.ink2,
      fontFeatures: const [FontFeature.tabularFigures()],
    );
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(children: [Expanded(child: Text(label, style: style)), Text(value, style: style)]),
    );
  }
}

class _Busy extends StatelessWidget {
  const _Busy({super.key, required this.label});
  final String label;

  @override
  Widget build(BuildContext context) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox.square(dimension: 16, child: CircularProgressIndicator(strokeWidth: 2, color: RelayColors.paper)),
          const SizedBox(width: 10),
          Text(label),
        ],
      );
}

class _Result extends StatelessWidget {
  const _Result({super.key, required this.state, required this.onReset});
  final PaymentState state;
  final VoidCallback onReset;

  @override
  Widget build(BuildContext context) {
    final (IconData icon, Color color, String title, String? body)? spec = switch (state.phase) {
      PaymentPhase.success => (
          Icons.check_circle_rounded,
          RelayColors.success,
          'Payment confirmed',
          'Ref ${state.payment?.reference}\nKey ${state.payment?.idempotencyKey}',
        ),
      PaymentPhase.verifying => (
          Icons.manage_search_rounded,
          RelayColors.warning,
          'Response lost — checking',
          'The request may have reached the provider. Asking it about key ${state.idempotencyKey} before allowing any retry.',
        ),
      PaymentPhase.declined => (Icons.credit_card_off_rounded, RelayColors.danger, 'Declined', state.message),
      PaymentPhase.cancelled => (Icons.close_rounded, RelayColors.ink2, 'Cancelled', state.message),
      PaymentPhase.failed => (
          Icons.error_outline_rounded,
          RelayColors.danger,
          'Not completed',
          '${state.message}${state.idempotencyKey != null ? '\nRetry reuses key ${state.idempotencyKey}.' : ''}',
        ),
      _ => null,
    };
    if (spec == null) return const SizedBox.shrink();
    final (icon, color, title, body) = spec;
    return RelayCard(
      color: color.withValues(alpha: 0.06),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(fontWeight: FontWeight.w700, color: color)),
                if (body != null) ...[
                  const SizedBox(height: 4),
                  Text(body, style: const TextStyle(fontSize: 13, height: 1.45, color: RelayColors.ink2)),
                ],
                if (state.phase == PaymentPhase.success)
                  TextButton(
                    style: TextButton.styleFrom(padding: EdgeInsets.zero, visualDensity: VisualDensity.compact),
                    onPressed: onReset,
                    child: const Text('Start a new payment'),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
