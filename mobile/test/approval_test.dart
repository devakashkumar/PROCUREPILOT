import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:procurepilot/features/orders/presentation/order_approval_screen.dart';
import 'package:procurepilot/features/orders/providers/order_provider.dart';

void main() {
  test('OrderNotifier approval checklist state management', () {
    final container = ProviderContainer();
    addTearDown(container.dispose);

    final notifier = container.read(orderProvider.notifier);
    expect(container.read(orderProvider).isAllChecklistApproved, isFalse);

    notifier.setCheckItem(1, true);
    notifier.setCheckItem(2, true);
    notifier.setCheckItem(3, true);
    notifier.setCheckItem(4, true);

    expect(container.read(orderProvider).isAllChecklistApproved, isTrue);
  });

  testWidgets('OrderApprovalScreen renders review & approval UI', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(home: OrderApprovalScreen(orderId: 'po_89420')),
      ),
    );
    await tester.pump(const Duration(seconds: 1));
    expect(find.byType(OrderApprovalScreen), findsOneWidget);
  });
}
