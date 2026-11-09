import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:procurepilot/features/procurement/models/chat_message.dart';
import 'package:procurepilot/features/procurement/presentation/procurement_chat_screen.dart';

void main() {
  test('ChatMessage creation and parsing', () {
    final userMsg = ChatMessage.user('20 kg atta and 10 kg rice');
    expect(userMsg.isUser, isTrue);
    expect(userMsg.text, '20 kg atta and 10 kg rice');

    final jsonAnalysis = {
      'requestId': 'req_123',
      'message': 'Analysis complete',
      'detectedItems': [
        {'name': 'Atta', 'quantity': 20, 'unit': 'kg'},
        {'name': 'Rice', 'quantity': 10, 'unit': 'kg'},
      ],
      'estimatedBudget': 5000,
      'confidence': 'HIGH',
    };

    final analysisData = ProcurementAnalysisData.fromJson(jsonAnalysis);
    expect(analysisData.detectedItems.length, 2);
    expect(analysisData.detectedItems.first.name, 'Atta');
    expect(analysisData.estimatedBudget, 5000);
  });

  testWidgets('ProcurementChatScreen renders welcome state', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      const ProviderScope(child: MaterialApp(home: ProcurementChatScreen())),
    );
    await tester.pump(const Duration(seconds: 1));
    expect(find.byType(ProcurementChatScreen), findsOneWidget);
  });
}
