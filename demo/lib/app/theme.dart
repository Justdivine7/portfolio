import 'package:flutter/material.dart';

/// Palette shared with divine-ajayi.vercel.app.
abstract final class RelayColors {
  static const paper = Color(0xFFF3F0E8);
  static const card = Color(0xFFFBFAF6);
  static const ink = Color(0xFF151412);
  static const ink2 = Color(0xFF45423C);
  static const ink3 = Color(0xFF6B675F);
  static const line = Color(0xFFE2DDD2);
  static const accent = Color(0xFFC2410C);
  static const success = Color(0xFF2E8B57);
  static const warning = Color(0xFFB7791F);
  static const danger = Color(0xFFB42318);
  static const console = Color(0xFF151412);
}

ThemeData buildRelayTheme() {
  final scheme = ColorScheme.fromSeed(
    seedColor: RelayColors.ink,
    brightness: Brightness.light,
  ).copyWith(
    primary: RelayColors.ink,
    onPrimary: RelayColors.paper,
    secondary: RelayColors.accent,
    surface: RelayColors.paper,
    onSurface: RelayColors.ink,
    error: RelayColors.danger,
    outline: RelayColors.line,
  );

  const text = TextTheme(
    headlineSmall: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, letterSpacing: -0.3),
    titleMedium: TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
    bodyMedium: TextStyle(fontSize: 14, height: 1.4),
    bodySmall: TextStyle(fontSize: 12, color: RelayColors.ink3),
    labelSmall: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, letterSpacing: 0.4),
  );

  return ThemeData(
    useMaterial3: true,
    fontFamily: 'Roboto',
    colorScheme: scheme,
    scaffoldBackgroundColor: RelayColors.paper,
    textTheme: text.apply(bodyColor: RelayColors.ink, displayColor: RelayColors.ink),
    dividerColor: RelayColors.line,
    splashFactory: InkSparkle.splashFactory,
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        minimumSize: const Size.fromHeight(48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        textStyle: const TextStyle(fontFamily: 'Roboto', fontSize: 15, fontWeight: FontWeight.w500),
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: RelayColors.card,
      indicatorColor: RelayColors.ink,
      height: 64,
      iconTheme: WidgetStateProperty.resolveWith(
        (s) => IconThemeData(
          color: s.contains(WidgetState.selected) ? RelayColors.paper : RelayColors.ink2,
        ),
      ),
      labelTextStyle: const WidgetStatePropertyAll(
        TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: RelayColors.ink),
      ),
    ),
    sliderTheme: const SliderThemeData(
      activeTrackColor: RelayColors.ink,
      thumbColor: RelayColors.ink,
      inactiveTrackColor: RelayColors.line,
    ),
    chipTheme: ChipThemeData(
      backgroundColor: RelayColors.card,
      selectedColor: RelayColors.ink,
      side: const BorderSide(color: RelayColors.line),
      labelStyle: const TextStyle(fontSize: 13, color: RelayColors.ink),
      secondaryLabelStyle: const TextStyle(fontSize: 13, color: RelayColors.paper),
      checkmarkColor: RelayColors.paper,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    ),
  );
}

/// A small rounded card used across the screens.
class RelayCard extends StatelessWidget {
  const RelayCard({super.key, required this.child, this.padding = const EdgeInsets.all(14), this.color});

  final Widget child;
  final EdgeInsetsGeometry padding;
  final Color? color;

  @override
  Widget build(BuildContext context) => DecoratedBox(
        decoration: BoxDecoration(
          color: color ?? RelayColors.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: RelayColors.line),
        ),
        child: Padding(padding: padding, child: child),
      );
}
