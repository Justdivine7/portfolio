// Renders the still image shown in the portfolio hero before the live build
// loads. Run via scripts/build-demo.sh (flutter test tool/poster_test.dart --update-goldens).
import 'dart:io';

import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:relay/app/di.dart';
import 'package:relay/app/relay_app.dart';

Future<void> _loadFont(String family, List<Future<ByteData>> files) async {
  final loader = FontLoader(family);
  for (final f in files) {
    loader.addFont(f);
  }
  await loader.load();
}

Future<ByteData> _file(String path) async =>
    ByteData.view((await File(path).readAsBytes()).buffer);

void main() {
  testWidgets('hero poster', (tester) async {
    final sdkFonts = '${Platform.environment['FLUTTER_ROOT']}/bin/cache/artifacts/material_fonts';
    await tester.runAsync(() async {
      await _loadFont('Roboto', [
        _file('fonts/Roboto-Regular.ttf'),
        _file('fonts/Roboto-Medium.ttf'),
        _file('fonts/Roboto-Bold.ttf'),
      ]);
      await _loadFont('MaterialIcons', [_file('$sdkFonts/MaterialIcons-Regular.otf')]);
    });

    tester.view.physicalSize = const Size(780, 1688);
    tester.view.devicePixelRatio = 2;
    addTearDown(tester.view.reset);

    configureDependencies();
    await tester.pumpWidget(const RelayApp());
    await tester.pump(const Duration(seconds: 2)); // first sync completes
    await tester.pump(const Duration(milliseconds: 400));

    await expectLater(find.byType(RelayApp), matchesGoldenFile('poster.png'));
  });
}
