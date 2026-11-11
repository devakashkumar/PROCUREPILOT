import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:procurepilot/features/procurement/models/optimization_result.dart';
import 'package:procurepilot/features/procurement/presentation/optimization_result_screen.dart';

void main() {
  test('OptimizationResult model parsing', () {
    final json = {
      'requestId': 'req_opt_123',
      'strategy': 'balanced',
      'totalCost': 8450.0,
      'totalBudget': 10000.0,
      'estimatedDeliveryDays': 2,
      'aiExplanation':
          'Balanced price and high reliability suppliers selected.',
      'savingsAmount': 1550.0,
      'productBreakdown': [
        {
          'productId': 'prod_1',
          'productName': 'Basmati Rice 50kg',
          'quantity': 2,
          'unit': 'bags',
          'supplierName': 'Apex Traders',
          'unitPrice': 2250.0,
          'totalPrice': 4500.0,
        },
      ],
    };

    final result = OptimizationResult.fromJson(json);
    expect(result.requestId, 'req_opt_123');
    expect(result.strategy, 'balanced');
    expect(result.totalCost, 8450.0);
    expect(result.budgetUtilization, 0.845);
    expect(result.remainingBudget, 1550.0);
    expect(result.productBreakdown.length, 1);
  });

  testWidgets('OptimizationResultScreen renders screen', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      const ProviderScope(child: MaterialApp(home: OptimizationResultScreen())),
    );
    await tester.pump(const Duration(seconds: 1));
    expect(find.byType(OptimizationResultScreen), findsOneWidget);
  });
}
