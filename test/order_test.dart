import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:procurepilot/features/orders/models/purchase_order.dart';
import 'package:procurepilot/features/orders/presentation/purchase_order_screen.dart';
import 'package:procurepilot/features/orders/providers/order_provider.dart';

void main() {
  test('PurchaseOrder model parsing and OrderNotifier state', () {
    final orderJson = {
      'id': 'po_89420',
      'orderNumber': 'PO-89420',
      'storeName': 'Global Retail Mart',
      'status': 'PENDING_APPROVAL',
      'subtotal': 6150.0,
      'deliveryFees': 250.0,
      'totalAmount': 6400.0,
      'notes': 'Please deliver before 11 AM.',
    };

    final po = PurchaseOrder.fromJson(orderJson);
    expect(po.id, 'po_89420');
    expect(po.orderNumber, 'PO-89420');
    expect(po.status, 'PENDING_APPROVAL');
    expect(po.totalAmount, 6400.0);

    final container = ProviderContainer();
    addTearDown(container.dispose);

    final notifier = container.read(orderProvider.notifier);
    expect(container.read(orderProvider).isConfirmed, isFalse);

    notifier.setConfirmed(true);
    expect(container.read(orderProvider).isConfirmed, isTrue);

    notifier.setNotes('Deliver at back entrance');
    expect(container.read(orderProvider).notes, 'Deliver at back entrance');
  });

  testWidgets('PurchaseOrderScreen renders review & generation UI', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      const ProviderScope(child: MaterialApp(home: PurchaseOrderScreen())),
    );
    await tester.pump(const Duration(seconds: 1));
    expect(find.byType(PurchaseOrderScreen), findsOneWidget);
  });
}
