import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';

import 'app/di.dart';
import 'app/relay_app.dart';
import 'core/log/event_log.dart';

/// Keeps Flutter's semantics tree on, so on the web the app is exposed to
/// screen readers (and to keyboard users) as real accessible elements.
SemanticsHandle? semanticsHandle;

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  semanticsHandle = SemanticsBinding.instance.ensureSemantics();
  configureDependencies();
  sl<EventLog>().info('app', 'Relay started · cache loaded');
  runApp(const RelayApp());
}
