import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:procurepilot/features/suppliers/models/supplier.dart';
import 'package:procurepilot/features/suppliers/presentation/supplier_comparison_screen.dart';

void main() {
  test('Supplier and SupplierOffer model parsing', () {
    final supplierJson = {
      'id': 'sup_10',
      'name': 'Apex Wholesale Traders',
      'location': 'Mumbai, MH',
      'reliabilityScore': 4.9,
      'rating': 4.8,
      'isVerified': true,
      'minOrderValue': 2000.0,
    };

    final supplier = Supplier.fromJson(supplierJson);
    expect(supplier.id, 'sup_10');
    expect(supplier.name, 'Apex Wholesale Traders');
    expect(supplier.reliabilityScore, 4.9);

    final offerJson = {
      'id': 'offer_100',
      'supplier': supplierJson,
      'productId': 'prod_1',
      'productName': 'Basmati Rice 50kg',
      'unitPrice': 45.0,
      'quantity': 50.0,
      'unit': 'kg',
      'deliveryFee': 100.0,
      'deliveryDays': 2,
      'stockAvailable': true,
      'isCheapest': true,
    };

    final offer = SupplierOffer.fromJson(offerJson);
    expect(offer.subtotal, 2250.0);
    expect(offer.totalOfferCost, 2350.0);
    expect(offer.isCheapest, isTrue);
  });

  testWidgets('SupplierComparisonScreen renders screen', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      const ProviderScope(child: MaterialApp(home: SupplierComparisonScreen())),
    );
    await tester.pump(const Duration(seconds: 1));
    expect(find.byType(SupplierComparisonScreen), findsOneWidget);
  });
}
