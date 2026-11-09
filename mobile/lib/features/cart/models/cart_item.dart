import '../../products/models/product.dart';
import '../../suppliers/models/supplier.dart';

/// Procurement Cart Item data model combining Product, Quantity, and optional Supplier Offer
class ProcurementCartItem {
  final Product product;
  final int quantity;
  final Supplier? supplier;
  final double? unitPrice;
  final double? deliveryFee;

  const ProcurementCartItem({
    required this.product,
    required this.quantity,
    this.supplier,
    this.unitPrice,
    this.deliveryFee,
  });

  double get lineSubtotal => (unitPrice ?? 0.0) * quantity;
  double get totalLineCost => lineSubtotal + (deliveryFee ?? 0.0);

  ProcurementCartItem copyWith({
    Product? product,
    int? quantity,
    Supplier? supplier,
    double? unitPrice,
    double? deliveryFee,
  }) {
    return ProcurementCartItem(
      product: product ?? this.product,
      quantity: quantity ?? this.quantity,
      supplier: supplier ?? this.supplier,
      unitPrice: unitPrice ?? this.unitPrice,
      deliveryFee: deliveryFee ?? this.deliveryFee,
    );
  }
}
