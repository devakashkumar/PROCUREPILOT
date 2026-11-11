import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:procurepilot/features/procurement/services/speech_service.dart';
import 'package:procurepilot/features/procurement/widgets/language_selector.dart';

void main() {
  test('SpeechService initial state', () {
    final speechService = SpeechService();
    expect(speechService.state, SpeechState.uninitialized);
    expect(speechService.isListening, isFalse);
  });

  testWidgets('LanguageSelector displays English and Hindi options', (
    WidgetTester tester,
  ) async {
    String selectedLocale = 'en_IN';

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: LanguageSelector(
            selectedLocaleId: selectedLocale,
            onLanguageChanged: (newLocale) {
              selectedLocale = newLocale;
            },
          ),
        ),
      ),
    );

    expect(find.text('English (IN)'), findsOneWidget);
    expect(find.text('Hindi (हिन्दी)'), findsOneWidget);

    await tester.tap(find.text('Hindi (हिन्दी)'));
    await tester.pump();

    expect(selectedLocale, 'hi_IN');
  });
}
