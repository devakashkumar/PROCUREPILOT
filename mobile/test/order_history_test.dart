import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:procurepilot/features/orders/presentation/order_details_screen.dart';
import 'package:procurepilot/features/orders/presentation/order_history_screen.dart';

void main() {
  testWidgets('OrderHistoryScreen renders history UI', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      const ProviderScope(child: MaterialApp(home: OrderHistoryScreen())),
    );
    await tester.pump(const Duration(seconds: 1));
    expect(find.byType(OrderHistoryScreen), findsOneWidget);
  });

  testWidgets('OrderDetailsScreen renders order details and tracking UI', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(home: OrderDetailsScreen(orderId: 'po_89420')),
      ),
    );
    await tester.pump(const Duration(seconds: 1));
    expect(find.byType(OrderDetailsScreen), findsOneWidget);
  });
}
