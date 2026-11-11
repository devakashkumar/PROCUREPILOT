import '../../suppliers/models/supplier.dart';

/// Single item within a supplier fulfillment group
class SupplierGroupItem {
  final String productId;
  final String productName;
  final double quantity;
  final String unit;
  final double unitPrice;

  const SupplierGroupItem({
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.unit,
    required this.unitPrice,
  });

  double get lineTotal => quantity * unitPrice;

  factory SupplierGroupItem.fromJson(Map<String, dynamic> json) {
    return SupplierGroupItem(
      productId: (json['productId'] ?? json['id'] ?? '').toString(),
      productName: (json['productName'] ?? json['name'] ?? 'Item').toString(),
      quantity: ((json['quantity'] ?? json['qty'] ?? 1.0) as num).toDouble(),
      unit: (json['unit'] ?? 'units').toString(),
      unitPrice: ((json['unitPrice'] ?? json['price'] ?? 0.0) as num)
          .toDouble(),
    );
  }
}

/// Fulfillment group aggregating products supplied by a specific distributor
class SupplierGroup {
  final Supplier supplier;
  final List<SupplierGroupItem> items;
  final double subtotal;
  final double deliveryFee;
  final int deliveryDays;

  const SupplierGroup({
    required this.supplier,
    required this.items,
    required this.subtotal,
    required this.deliveryFee,
    required this.deliveryDays,
  });

  double get groupTotal => subtotal + deliveryFee;

  factory SupplierGroup.fromJson(Map<String, dynamic> json) {
    final supplierJson = json['supplier'] is Map<String, dynamic>
        ? json['supplier'] as Map<String, dynamic>
        : <String, dynamic>{
            'name': json['supplierName'] ?? 'Wholesale Supplier',
          };

    final rawItems = json['items'] ?? json['products'] ?? [];
    final List<SupplierGroupItem> itemsList = rawItems is List
        ? rawItems
              .map(
                (e) => SupplierGroupItem.fromJson(
                  Map<String, dynamic>.from(e as Map),
                ),
              )
              .toList()
        : [];

    final subtotalVal = ((json['subtotal'] ?? 0.0) as num).toDouble();
    final calculatedSubtotal = subtotalVal > 0
        ? subtotalVal
        : itemsList.fold<double>(0.0, (sum, i) => sum + i.lineTotal);

    return SupplierGroup(
      supplier: Supplier.fromJson(supplierJson),
      items: itemsList,
      subtotal: calculatedSubtotal,
      deliveryFee: ((json['deliveryFee'] ?? json['shipping'] ?? 0.0) as num)
          .toDouble(),
      deliveryDays: (json['deliveryDays'] ?? json['etaDays'] ?? 2) as int,
    );
  }
}

/// Product-wise optimization item
class ProductOptimizationItem {
  final String productId;
  final String productName;
  final double quantity;
  final String unit;
  final String supplierName;
  final double unitPrice;
  final double totalPrice;

  const ProductOptimizationItem({
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.unit,
    required this.supplierName,
    required this.unitPrice,
    required this.totalPrice,
  });

  factory ProductOptimizationItem.fromJson(Map<String, dynamic> json) {
    final qty = ((json['quantity'] ?? json['qty'] ?? 1.0) as num).toDouble();
    final price = ((json['unitPrice'] ?? json['price'] ?? 0.0) as num)
        .toDouble();
    final total = ((json['totalPrice'] ?? (qty * price)) as num).toDouble();

    return ProductOptimizationItem(
      productId: (json['productId'] ?? json['id'] ?? '').toString(),
      productName: (json['productName'] ?? json['name'] ?? 'Product')
          .toString(),
      quantity: qty,
      unit: (json['unit'] ?? 'units').toString(),
      supplierName: (json['supplierName'] ?? 'Verified Supplier').toString(),
      unitPrice: price,
      totalPrice: total,
    );
  }
}

/// Complete AI Purchase Optimization Result Payload
class OptimizationResult {
  final String requestId;
  final String strategy;
  final double totalCost;
  final double totalBudget;
  final int estimatedDeliveryDays;
  final String aiExplanation;
  final List<SupplierGroup> supplierGroups;
  final List<ProductOptimizationItem> productBreakdown;
  final double? savingsAmount;

  const OptimizationResult({
    required this.requestId,
    required this.strategy,
    required this.totalCost,
    required this.totalBudget,
    required this.estimatedDeliveryDays,
    required this.aiExplanation,
    required this.supplierGroups,
    required this.productBreakdown,
    this.savingsAmount,
  });

  double get budgetUtilization =>
      totalBudget > 0 ? (totalCost / totalBudget).clamp(0.0, 1.0) : 0.0;
  double get remainingBudget => totalBudget - totalCost;

  factory OptimizationResult.fromJson(Map<String, dynamic> json) {
    final rawGroups =
        json['supplierGroups'] ?? json['groups'] ?? json['suppliers'] ?? [];
    final List<SupplierGroup> groupsList = rawGroups is List
        ? rawGroups
              .map(
                (e) =>
                    SupplierGroup.fromJson(Map<String, dynamic>.from(e as Map)),
              )
              .toList()
        : [];

    final rawProducts =
        json['productBreakdown'] ?? json['items'] ?? json['products'] ?? [];
    final List<ProductOptimizationItem> productsList = rawProducts is List
        ? rawProducts
              .map(
                (e) => ProductOptimizationItem.fromJson(
                  Map<String, dynamic>.from(e as Map),
                ),
              )
              .toList()
        : [];

    return OptimizationResult(
      requestId: (json['requestId'] ?? json['id'] ?? 'opt_req_1').toString(),
      strategy: (json['strategy'] ?? 'balanced').toString(),
      totalCost:
          ((json['totalCost'] ?? json['totalPrice'] ?? json['total'] ?? 8450.0)
                  as num)
              .toDouble(),
      totalBudget: ((json['totalBudget'] ?? json['budget'] ?? 10000.0) as num)
          .toDouble(),
      estimatedDeliveryDays:
          (json['estimatedDeliveryDays'] ?? json['deliveryDays'] ?? 2) as int,
      aiExplanation:
          (json['aiExplanation'] ??
                  json['explanation'] ??
                  'We selected these suppliers to provide an optimal balance between low price, high reliability, and rapid delivery.')
              .toString(),
      supplierGroups: groupsList,
      productBreakdown: productsList,
      savingsAmount: json['savingsAmount'] != null
          ? ((json['savingsAmount']) as num).toDouble()
          : null,
    );
  }
}
