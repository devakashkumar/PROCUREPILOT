import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:procurepilot/features/cart/models/cart_item.dart';
import 'package:procurepilot/features/cart/presentation/cart_screen.dart';
import 'package:procurepilot/features/cart/providers/cart_provider.dart';
import 'package:procurepilot/features/products/models/product.dart';

void main() {
  test('ProcurementCartItem line calculation and CartNotifier grouping', () {
    const prod1 = Product(
      id: 'p1',
      name: 'Basmati Rice',
      brand: 'India Gate',
      category: 'Grocery',
      unit: '50 kg Bag',
      description: 'Rice',
    );

    final item1 = ProcurementCartItem(
      product: prod1,
      quantity: 3,
      unitPrice: 2000.0,
      deliveryFee: 100.0,
    );

    expect(item1.lineSubtotal, 6000.0);
    expect(item1.totalLineCost, 6100.0);

    final container = ProviderContainer();
    addTearDown(container.dispose);

    final notifier = container.read(cartProvider.notifier);
    notifier.clearCart();
    expect(container.read(cartProvider).totalItemCount, 0);

    notifier.addOrUpdateItem(prod1, 4, unitPrice: 2000.0, deliveryFee: 100.0);
    expect(container.read(cartProvider).totalItemCount, 4);
    expect(container.read(cartProvider).isOptimizationValid, isFalse);
  });

  testWidgets('CartScreen renders procurement cart UI', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      const ProviderScope(child: MaterialApp(home: CartScreen())),
    );
    await tester.pump(const Duration(seconds: 1));
    expect(find.byType(CartScreen), findsOneWidget);
  });
}
