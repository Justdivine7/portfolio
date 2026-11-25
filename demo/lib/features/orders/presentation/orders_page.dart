import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../app/theme.dart';
import '../../../core/network/network_simulator.dart';
import '../../../core/util/format.dart';
import '../../devtools/dev_settings_cubit.dart';
import '../domain/order.dart';
import 'orders_bloc.dart';

class OrdersPage extends StatefulWidget {
  const OrdersPage({super.key, required this.onOpenDevMenu});

  final VoidCallback onOpenDevMenu;

  @override
  State<OrdersPage> createState() => _OrdersPageState();
}

class _OrdersPageState extends State<OrdersPage> {
  bool _showTip = true;

  @override
  Widget build(BuildContext context) {
    final bloc = context.read<OrdersBloc>();
    return BlocBuilder<OrdersBloc, OrdersState>(
      builder: (context, state) {
        final sync = context.watch<SyncStatusCubit>().state;
        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(18, 8, 8, 6),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Orders', style: Theme.of(context).textTheme.headlineSmall),
                        const SizedBox(height: 2),
                        Text(
                          state.lastSyncedAt == null
                              ? 'Showing saved orders'
                              : 'Last synced ${clockTime(state.lastSyncedAt!)}',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    tooltip: 'Refresh',
                    onPressed: () => bloc.add(const OrdersRefreshRequested()),
                    icon: state.refreshing
                        ? const SizedBox.square(dimension: 18, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.refresh_rounded),
                  ),
                ],
              ),
            ),
            if (sync.mode == NetworkMode.offline || state.notice != null)
              _Banner(
                text: sync.mode == NetworkMode.offline
                    ? state.unsynced > 0
                        ? 'You’re offline · ${state.unsynced} ${state.unsynced == 1 ? 'order' : 'orders'} will sync when you’re back.'
                        : 'You’re offline · new orders are saved on the device.'
                    : state.notice!,
              ),
            if (_showTip)
              _TryItCard(
                onOpenDevMenu: widget.onOpenDevMenu,
                onDismiss: () => setState(() => _showTip = false),
              ),
            Expanded(
              child: RefreshIndicator(
                color: RelayColors.ink,
                onRefresh: () async {
                  bloc.add(const OrdersRefreshRequested());
                  await bloc.stream.firstWhere((s) => !s.refreshing);
                },
                child: ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
                  itemCount: state.orders.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 8),
                  itemBuilder: (_, i) => _OrderTile(key: ValueKey(state.orders[i].id), order: state.orders[i]),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
              child: FilledButton.icon(
                onPressed: () => bloc.add(const OrderCreateRequested()),
                icon: const Icon(Icons.add_rounded),
                label: const Text('New order'),
              ),
            ),
          ],
        );
      },
    );
  }
}

class _Banner extends StatelessWidget {
  const _Banner({required this.text});
  final String text;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(16, 2, 16, 6),
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: const Color(0xFFFBEFD7),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFEBD3A0)),
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            child: Row(
              children: [
                const Icon(Icons.cloud_off_rounded, size: 18, color: RelayColors.warning),
                const SizedBox(width: 10),
                Expanded(child: Text(text, style: const TextStyle(fontSize: 13, color: Color(0xFF6B4A12)))),
              ],
            ),
          ),
        ),
      );
}

class _TryItCard extends StatelessWidget {
  const _TryItCard({required this.onOpenDevMenu, required this.onDismiss});
  final VoidCallback onOpenDevMenu;
  final VoidCallback onDismiss;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(16, 2, 16, 4),
        child: RelayCard(
          padding: const EdgeInsets.fromLTRB(14, 10, 4, 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.bolt_rounded, size: 18, color: RelayColors.accent),
                  const SizedBox(width: 6),
                  const Expanded(child: Text('Try to break it', style: TextStyle(fontWeight: FontWeight.w700))),
                  IconButton(
                    tooltip: 'Dismiss',
                    visualDensity: VisualDensity.compact,
                    onPressed: onDismiss,
                    icon: const Icon(Icons.close_rounded, size: 18),
                  ),
                ],
              ),
              const Text(
                '1. Open the developer menu and go Offline.\n2. Add orders — they save instantly.\n3. Go back online and watch them sync.',
                style: TextStyle(fontSize: 13, height: 1.5, color: RelayColors.ink2),
              ),
              const SizedBox(height: 6),
              TextButton.icon(
                style: TextButton.styleFrom(padding: EdgeInsets.zero, visualDensity: VisualDensity.compact),
                onPressed: onOpenDevMenu,
                icon: const Icon(Icons.tune_rounded, size: 16),
                label: const Text('Open developer menu'),
              ),
            ],
          ),
        ),
      );
}

class _OrderTile extends StatelessWidget {
  const _OrderTile({super.key, required this.order});
  final Order order;

  @override
  Widget build(BuildContext context) => TweenAnimationBuilder<double>(
        tween: Tween(begin: 0, end: 1),
        duration: const Duration(milliseconds: 320),
        curve: Curves.easeOutCubic,
        builder: (context, t, child) => Opacity(
          opacity: t,
          child: Transform.translate(offset: Offset(0, (1 - t) * 10), child: child),
        ),
        child: RelayCard(
          padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
          child: Row(
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(color: RelayColors.paper, borderRadius: BorderRadius.circular(11)),
                child: const Icon(Icons.inventory_2_outlined, size: 19, color: RelayColors.ink2),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(order.title, style: Theme.of(context).textTheme.titleMedium, maxLines: 1, overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 2),
                    Text('${naira(order.amount)} · ${shortTime(order.createdAt)}', style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              StatusPill(status: order.status),
            ],
          ),
        ),
      );
}

class StatusPill extends StatelessWidget {
  const StatusPill({super.key, required this.status});
  final OrderStatus status;

  @override
  Widget build(BuildContext context) {
    final (label, color, icon) = switch (status) {
      OrderStatus.queued => ('Queued', RelayColors.warning, Icons.schedule_rounded),
      OrderStatus.syncing => ('Syncing', RelayColors.ink2, null),
      OrderStatus.retrying => ('Retrying', RelayColors.danger, Icons.replay_rounded),
      OrderStatus.synced => ('Synced', RelayColors.success, Icons.check_rounded),
    };
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 200),
      child: Container(
        key: ValueKey(status),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(999)),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon == null)
              SizedBox.square(dimension: 11, child: CircularProgressIndicator(strokeWidth: 1.6, color: color))
            else
              Icon(icon, size: 13, color: color),
            const SizedBox(width: 4),
            Text(label, style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w500, color: color)),
          ],
        ),
      ),
    );
  }
}
