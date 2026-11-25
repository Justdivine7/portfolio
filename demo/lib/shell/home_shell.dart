import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../app/theme.dart';
import '../core/network/network_simulator.dart';
import '../features/chat/presentation/chat_page.dart';
import '../features/devtools/console_strip.dart';
import '../features/devtools/dev_menu.dart';
import '../features/devtools/dev_settings_cubit.dart';
import '../features/orders/presentation/orders_page.dart';
import '../features/payments/presentation/pay_page.dart';

class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _tab = 0;
  bool _devMenuSeen = false;

  Future<void> _openDevMenu() async {
    setState(() => _devMenuSeen = true);
    await showDevMenu(context);
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        body: SafeArea(
          bottom: false,
          child: Column(
            children: [
              _TopBar(onOpenDevMenu: _openDevMenu, highlight: !_devMenuSeen),
              Expanded(
                child: IndexedStack(
                  index: _tab,
                  children: [
                    OrdersPage(onOpenDevMenu: _openDevMenu),
                    const ChatPage(),
                    PayPage(onOpenDevMenu: _openDevMenu),
                  ],
                ),
              ),
              ConsoleStrip(onTap: _openDevMenu),
            ],
          ),
        ),
        bottomNavigationBar: NavigationBar(
          selectedIndex: _tab,
          onDestinationSelected: (i) => setState(() => _tab = i),
          destinations: const [
            NavigationDestination(icon: Icon(Icons.receipt_long_outlined), label: 'Orders'),
            NavigationDestination(icon: Icon(Icons.chat_bubble_outline_rounded), label: 'Chat'),
            NavigationDestination(icon: Icon(Icons.payments_outlined), label: 'Pay'),
          ],
        ),
      );
}

class _TopBar extends StatelessWidget {
  const _TopBar({required this.onOpenDevMenu, required this.highlight});
  final VoidCallback onOpenDevMenu;
  final bool highlight;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(18, 10, 8, 6),
        child: Row(
          children: [
            const Text('RELAY', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700, letterSpacing: 2.2)),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(border: Border.all(color: RelayColors.line), borderRadius: BorderRadius.circular(6)),
              child: const Text('DEMO', style: TextStyle(fontSize: 9.5, letterSpacing: 1, fontWeight: FontWeight.w500, color: RelayColors.ink3)),
            ),
            const Spacer(),
            const _StatusChip(),
            const SizedBox(width: 2),
            _DevButton(onPressed: onOpenDevMenu, highlight: highlight),
          ],
        ),
      );
}

class _StatusChip extends StatelessWidget {
  const _StatusChip();

  @override
  Widget build(BuildContext context) => BlocBuilder<SyncStatusCubit, SyncStatus>(
        builder: (context, s) {
          final (label, color) = switch (s.mode) {
            NetworkMode.online => ('Online', RelayColors.success),
            NetworkMode.flaky => ('Flaky', RelayColors.warning),
            NetworkMode.offline => ('Offline', RelayColors.danger),
          };
          return Semantics(
            label: 'Connection $label${s.pending > 0 ? ', ${s.pending} queued' : ''}',
            excludeSemantics: true,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 220),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(999)),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(width: 7, height: 7, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
                  const SizedBox(width: 6),
                  Text(
                    s.pending > 0 ? '$label · ${s.pending} queued' : label,
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: color),
                  ),
                ],
              ),
            ),
          );
        },
      );
}

/// The developer-menu button pulses until it has been opened once.
class _DevButton extends StatefulWidget {
  const _DevButton({required this.onPressed, required this.highlight});
  final VoidCallback onPressed;
  final bool highlight;

  @override
  State<_DevButton> createState() => _DevButtonState();
}

class _DevButtonState extends State<_DevButton> with SingleTickerProviderStateMixin {
  late final _pulse = AnimationController(vsync: this, duration: const Duration(milliseconds: 1600));

  @override
  void initState() {
    super.initState();
    _sync();
  }

  @override
  void didUpdateWidget(_DevButton oldWidget) {
    super.didUpdateWidget(oldWidget);
    _sync();
  }

  void _sync() {
    final reduceMotion = WidgetsBinding.instance.platformDispatcher.accessibilityFeatures.disableAnimations;
    if (widget.highlight && !reduceMotion) {
      if (!_pulse.isAnimating) _pulse.repeat();
    } else {
      _pulse.stop();
      _pulse.value = 0;
    }
  }

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Stack(
        alignment: Alignment.center,
        children: [
          if (widget.highlight)
            AnimatedBuilder(
              animation: _pulse,
              builder: (_, _) => Container(
                width: 30 + 14 * _pulse.value,
                height: 30 + 14 * _pulse.value,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: RelayColors.accent.withValues(alpha: 0.28 * (1 - _pulse.value)),
                ),
              ),
            ),
          IconButton(
            tooltip: 'Developer menu',
            onPressed: widget.onPressed,
            icon: const Icon(Icons.tune_rounded),
          ),
        ],
      );
}
