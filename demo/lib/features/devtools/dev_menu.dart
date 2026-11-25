import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../app/di.dart';
import '../../app/theme.dart';
import '../../core/log/event_log.dart';
import '../../core/network/network_simulator.dart';
import '../../core/sync/outbox.dart';
import '../../core/util/format.dart';
import '../payments/data/fake_payment_api.dart';
import 'console_strip.dart';
import 'dev_settings_cubit.dart';

Future<void> showDevMenu(BuildContext context) => showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: RelayColors.paper,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(22))),
      builder: (_) => BlocProvider.value(
        value: context.read<DevSettingsCubit>(),
        child: const FractionallySizedBox(heightFactor: 0.88, child: _DevMenu()),
      ),
    );

class _DevMenu extends StatelessWidget {
  const _DevMenu();

  @override
  Widget build(BuildContext context) {
    final cubit = context.read<DevSettingsCubit>();
    return BlocBuilder<DevSettingsCubit, DevSettings>(
      builder: (context, s) {
        final net = s.network;
        return ListView(
          padding: const EdgeInsets.fromLTRB(18, 10, 18, 24),
          children: [
            Center(
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(color: RelayColors.line, borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                const Icon(Icons.tune_rounded, size: 20),
                const SizedBox(width: 8),
                Text('Developer menu', style: Theme.of(context).textTheme.headlineSmall),
                const Spacer(),
                IconButton(
                  tooltip: 'Close',
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.close_rounded),
                ),
              ],
            ),
            const Text(
              'The network and the payment provider are simulated. Everything else — caching, the outbox, retries, state — is the app’s real code.',
              style: TextStyle(fontSize: 13, color: RelayColors.ink2, height: 1.45),
            ),
            const _Section('Connection'),
            SegmentedButton<NetworkMode>(
              showSelectedIcon: false,
              style: SegmentedButton.styleFrom(
                selectedBackgroundColor: RelayColors.ink,
                selectedForegroundColor: RelayColors.paper,
                side: const BorderSide(color: RelayColors.line),
              ),
              segments: const [
                ButtonSegment(value: NetworkMode.online, icon: Icon(Icons.wifi_rounded, size: 18), label: Text('Online')),
                ButtonSegment(value: NetworkMode.flaky, icon: Icon(Icons.network_check_rounded, size: 18), label: Text('Flaky')),
                ButtonSegment(value: NetworkMode.offline, icon: Icon(Icons.wifi_off_rounded, size: 18), label: Text('Offline')),
              ],
              selected: {net.mode},
              onSelectionChanged: (v) => cubit.setMode(v.first),
            ),
            const SizedBox(height: 14),
            _SliderRow(
              label: 'Latency',
              value: '${net.latency.inMilliseconds} ms',
              child: Slider(
                min: 100,
                max: 3000,
                divisions: 29,
                value: net.latency.inMilliseconds.toDouble(),
                semanticFormatterCallback: (v) => '${v.round()} milliseconds',
                onChanged: (v) => cubit.setLatency(Duration(milliseconds: v.round())),
              ),
            ),
            _SliderRow(
              label: 'Failure rate on a flaky network',
              value: '${(net.failureRate * 100).round()}%',
              child: Slider(
                min: 0.1,
                max: 0.9,
                divisions: 8,
                value: net.failureRate,
                onChanged: net.mode == NetworkMode.flaky ? cubit.setFailureRate : null,
              ),
            ),
            const _Section('Payment provider'),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final (outcome, label) in const [
                  (PaymentOutcome.success, 'Succeeds'),
                  (PaymentOutcome.declined, 'Declines'),
                  (PaymentOutcome.cancelled, 'User cancels'),
                  (PaymentOutcome.timeout, 'Times out'),
                ])
                  ChoiceChip(
                    label: Text(label),
                    selected: s.paymentOutcome == outcome,
                    onSelected: (_) => cubit.setPaymentOutcome(outcome),
                    labelStyle: TextStyle(
                      color: s.paymentOutcome == outcome ? RelayColors.paper : RelayColors.ink,
                      fontSize: 13,
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            const Text(
              '“Times out” is the tricky one: the charge succeeds but the response is lost. The app verifies with the same idempotency key before ever retrying.',
              style: TextStyle(fontSize: 12, color: RelayColors.ink3, height: 1.4),
            ),
            const _Section('Outbox'),
            StreamBuilder<List<OutboxItem>>(
              stream: sl<Outbox>().changes,
              initialData: sl<Outbox>().pending,
              builder: (context, snap) {
                final pending = snap.data ?? const [];
                return Row(
                  children: [
                    Expanded(
                      child: Text(
                        pending.isEmpty
                            ? 'Empty — everything is synced.'
                            : '${pending.length} pending: ${pending.map((p) => p.kind).join(', ')}',
                        style: const TextStyle(fontSize: 13, color: RelayColors.ink2),
                      ),
                    ),
                    TextButton(
                      onPressed: pending.isEmpty ? null : () => sl<Outbox>().flush(),
                      child: const Text('Flush now'),
                    ),
                  ],
                );
              },
            ),
            Row(
              children: [
                const Expanded(child: _Section('Event log')),
                TextButton(onPressed: sl<EventLog>().clear, child: const Text('Clear')),
              ],
            ),
            const _LogList(),
          ],
        );
      },
    );
  }
}

class _Section extends StatelessWidget {
  const _Section(this.title);
  final String title;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(top: 22, bottom: 10),
        child: Text(
          title.toUpperCase(),
          style: const TextStyle(fontSize: 11, letterSpacing: 1.2, fontWeight: FontWeight.w500, color: RelayColors.ink3),
        ),
      );
}

class _SliderRow extends StatelessWidget {
  const _SliderRow({required this.label, required this.value, required this.child});
  final String label;
  final String value;
  final Widget child;

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(child: Text(label, style: const TextStyle(fontSize: 13, color: RelayColors.ink2))),
              Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, fontFeatures: [FontFeature.tabularFigures()])),
            ],
          ),
          child,
        ],
      );
}

class _LogList extends StatelessWidget {
  const _LogList();

  @override
  Widget build(BuildContext context) {
    final log = sl<EventLog>();
    return StreamBuilder<List<LogEntry>>(
      stream: log.changes,
      initialData: log.entries,
      builder: (context, snap) {
        final entries = (snap.data ?? const <LogEntry>[]).reversed.take(40).toList();
        return DecoratedBox(
          decoration: BoxDecoration(color: RelayColors.console, borderRadius: BorderRadius.circular(14)),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: entries.isEmpty
                ? const Text('No events yet.', style: TextStyle(color: Color(0xFF8A847B), fontSize: 12))
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      for (final e in entries)
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 3),
                          child: Text.rich(
                            TextSpan(children: [
                              TextSpan(text: '${clockTime(e.time)}  ', style: const TextStyle(color: Color(0xFF8A847B))),
                              TextSpan(text: '${e.tag.padRight(6)} ', style: TextStyle(color: levelColor(e.level), fontWeight: FontWeight.w500)),
                              TextSpan(text: e.message),
                            ]),
                            style: const TextStyle(
                              color: Color(0xFFE9E5DC),
                              fontSize: 11.5,
                              height: 1.35,
                              fontFeatures: [FontFeature.tabularFigures()],
                            ),
                          ),
                        ),
                    ],
                  ),
          ),
        );
      },
    );
  }
}
