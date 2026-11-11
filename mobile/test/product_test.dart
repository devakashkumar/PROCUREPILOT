import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:procurepilot/features/cart/providers/cart_provider.dart';
import 'package:procurepilot/features/products/models/product.dart';
import 'package:procurepilot/features/products/presentation/product_list_screen.dart';

void main() {
  test('Product model parsing and CartNotifier behavior', () {
    final json = {
      'id': 'prod_99',
      'name': 'Basmati Rice',
      'brand': 'India Gate',
      'category': 'Rice & Atta',
      'unit': '50 kg Bag',
      'description': 'Premium long grain basmati rice for Kirana sales.',
      'stock': 250,
      'inStock': true,
      'minOrderQty': 1,
    };

    final product = Product.fromJson(json);
    expect(product.id, 'prod_99');
    expect(product.name, 'Basmati Rice');
    expect(product.stock, 250);

    final container = ProviderContainer();
    addTearDown(container.dispose);

    final cartNotifier = container.read(cartProvider.notifier);
    cartNotifier.clearCart();
    expect(container.read(cartProvider).totalItemCount, 0);

    cartNotifier.addOrUpdateItem(product, 5);
    expect(container.read(cartProvider).totalItemCount, 5);
    expect(container.read(cartProvider).getItemQuantity('prod_99'), 5);

    cartNotifier.decrementItem(product);
    expect(container.read(cartProvider).getItemQuantity('prod_99'), 4);

    cartNotifier.removeItem('prod_99');
    expect(container.read(cartProvider).totalItemCount, 0);
  });

  testWidgets('ProductListScreen renders discovery screen', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      const ProviderScope(child: MaterialApp(home: ProductListScreen())),
    );
    await tester.pump(const Duration(seconds: 1));
    expect(find.byType(ProductListScreen), findsOneWidget);
  });
}
