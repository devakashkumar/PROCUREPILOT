import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:procurepilot/features/analytics/models/analytics_data.dart';
import 'package:procurepilot/features/analytics/presentation/analytics_screen.dart';

void main() {
  test('AnalyticsData metrics derived accurately from order records', () {
    final analytics = AnalyticsData.fromOrders([]);
    expect(analytics.totalSpendInr, 0.0);
    expect(analytics.totalOrdersCount, 0);
    expect(analytics.averageOrderValueInr, 0.0);
  });

  testWidgets('AnalyticsScreen renders business insights dashboard', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      const ProviderScope(child: MaterialApp(home: AnalyticsScreen())),
    );
    await tester.pump(const Duration(seconds: 1));
    expect(find.byType(AnalyticsScreen), findsOneWidget);
  });
}
