import 'package:flutter/material.dart';

import '../../app/di.dart';
import '../../app/theme.dart';
import '../../core/log/event_log.dart';
import '../../core/util/format.dart';

Color levelColor(LogLevel level) => switch (level) {
      LogLevel.info => const Color(0xFF9AA4B2),
      LogLevel.success => const Color(0xFF5DCAA5),
      LogLevel.warning => const Color(0xFFE8B04B),
      LogLevel.error => const Color(0xFFF2836B),
    };

/// One-line live console above the tab bar: the latest thing the app did.
class ConsoleStrip extends StatelessWidget {
  const ConsoleStrip({super.key, required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final log = sl<EventLog>();
    return Material(
      color: RelayColors.console,
      child: InkWell(
        onTap: onTap,
        child: SizedBox(
          height: 34,
          child: StreamBuilder<List<LogEntry>>(
            stream: log.changes,
            initialData: log.entries,
            builder: (context, snapshot) {
              final entries = snapshot.data ?? const [];
              final last = entries.isEmpty ? null : entries.last;
              return Semantics(
                button: true,
                label: 'Event console. ${last == null ? 'No events yet' : '${last.tag}: ${last.message}'}. Opens the developer menu.',
                excludeSemantics: true,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  child: Row(
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: last == null ? const Color(0xFF5A5650) : levelColor(last.level),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: AnimatedSwitcher(
                          duration: const Duration(milliseconds: 220),
                          transitionBuilder: (child, a) => FadeTransition(
                            opacity: a,
                            child: SlideTransition(
                              position: Tween(begin: const Offset(0, 0.4), end: Offset.zero).animate(a),
                              child: child,
                            ),
                          ),
                          child: Text.rich(
                            key: ValueKey(entries.length),
                            last == null
                                ? const TextSpan(text: 'console · events appear here')
                                : TextSpan(children: [
                                    TextSpan(text: '${clockTime(last.time)}  ', style: const TextStyle(color: Color(0xFF8A847B))),
                                    TextSpan(text: '${last.tag}  ', style: TextStyle(color: levelColor(last.level), fontWeight: FontWeight.w500)),
                                    TextSpan(text: last.message),
                                  ]),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Color(0xFFE9E5DC),
                              fontSize: 11.5,
                              fontFeatures: [FontFeature.tabularFigures()],
                            ),
                          ),
                        ),
                      ),
                      const Icon(Icons.keyboard_arrow_up_rounded, size: 18, color: Color(0xFF8A847B)),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
