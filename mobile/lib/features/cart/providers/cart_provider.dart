import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../products/models/product.dart';
import '../../suppliers/models/supplier.dart';
import '../models/cart_item.dart';

class CartState {
  final List<ProcurementCartItem> items;
  final bool isOptimizationValid;
  final double totalBudget;

  const CartState({
    this.items = const [],
    this.isOptimizationValid = true,
    this.totalBudget = 10000.0,
  });

  int get totalItemCount {
    int total = 0;
    for (final item in items) {
      total += item.quantity;
    }
    return total;
  }

  int get uniqueItemsCount => items.length;

  int getItemQuantity(String productId) {
    final index = items.indexWhere((item) => item.product.id == productId);
    if (index != -1) {
      return items[index].quantity;
    }
    return 0;
  }

  bool isSelected(String productId) => getItemQuantity(productId) > 0;

  /// Group cart items by supplier
  Map<String, List<ProcurementCartItem>> get groupedBySupplier {
    final Map<String, List<ProcurementCartItem>> map = {};
    for (final item in items) {
      final supplierName = item.supplier?.name ?? 'Wholesale Distributors';
      if (!map.containsKey(supplierName)) {
        map[supplierName] = [];
      }
      map[supplierName]!.add(item);
    }
    return map;
  }

  double get totalProductSubtotal {
    double total = 0.0;
    for (final item in items) {
      total += item.lineSubtotal;
    }
    return total;
  }

  double get totalDeliveryFees {
    final Set<String> processedSuppliers = {};
    double deliveryTotal = 0.0;
    for (final item in items) {
      final supplierId = item.supplier?.id ?? 'default_sup';
      if (!processedSuppliers.contains(supplierId)) {
        processedSuppliers.add(supplierId);
        deliveryTotal += (item.deliveryFee ?? 0.0);
      }
    }
    return deliveryTotal;
  }

  double get estimatedTotalCost => totalProductSubtotal + totalDeliveryFees;
  double get remainingBudget => totalBudget - estimatedTotalCost;
  bool get isOverBudget => estimatedTotalCost > totalBudget;

  CartState copyWith({
    List<ProcurementCartItem>? items,
    bool? isOptimizationValid,
    double? totalBudget,
  }) {
    return CartState(
      items: items ?? this.items,
      isOptimizationValid: isOptimizationValid ?? this.isOptimizationValid,
      totalBudget: totalBudget ?? this.totalBudget,
    );
  }
}

class CartNotifier extends StateNotifier<CartState> {
  CartNotifier() : super(const CartState()) {
    _populateInitialDemoCart();
  }

  void _populateInitialDemoCart() {
    // Initial demo procurement cart items
    final demoItem1 = ProcurementCartItem(
      product: const Product(
        id: 'prod_1',
        name: 'Basmati Rice 50kg',
        brand: 'India Gate',
        category: 'Rice & Atta',
        unit: '50 kg Bag',
        description: 'Premium long grain basmati rice.',
      ),
      quantity: 2,
      supplier: const Supplier(
        id: 'sup_10',
        name: 'Apex Wholesale Traders',
        location: 'Mumbai, MH',
        reliabilityScore: 4.9,
        rating: 4.8,
      ),
      unitPrice: 2250.0,
      deliveryFee: 100.0,
    );

    final demoItem2 = ProcurementCartItem(
      product: const Product(
        id: 'prod_2',
        name: 'Sunflower Oil 15L',
        brand: 'Fortune',
        category: 'Edible Oils',
        unit: '15 Litre Can',
        description: 'Refined sunflower cooking oil.',
      ),
      quantity: 1,
      supplier: const Supplier(
        id: 'sup_11',
        name: 'Metro Wholesale',
        location: 'Thane, MH',
        reliabilityScore: 4.7,
        rating: 4.6,
      ),
      unitPrice: 1650.0,
      deliveryFee: 150.0,
    );

    state = CartState(items: [demoItem1, demoItem2]);
  }

  void addOrUpdateItem(
    Product product,
    int quantity, {
    Supplier? supplier,
    double? unitPrice,
    double? deliveryFee,
  }) {
    if (quantity <= 0) {
      removeItem(product.id);
      return;
    }

    final index = state.items.indexWhere(
      (item) => item.product.id == product.id,
    );
    final updatedList = List<ProcurementCartItem>.from(state.items);

    if (index != -1) {
      final existing = updatedList[index];
      updatedList[index] = existing.copyWith(
        quantity: quantity,
        supplier: supplier ?? existing.supplier,
        unitPrice: unitPrice ?? existing.unitPrice,
        deliveryFee: deliveryFee ?? existing.deliveryFee,
      );
    } else {
      updatedList.add(
        ProcurementCartItem(
          product: product,
          quantity: quantity,
          supplier: supplier,
          unitPrice: unitPrice ?? 1500.0,
          deliveryFee: deliveryFee ?? 100.0,
        ),
      );
    }

    state = state.copyWith(
      items: updatedList,
      isOptimizationValid:
          false, // Mark optimization as needing updating when quantity changes
    );
  }

  void incrementItem(Product product) {
    final currentQty = state.getItemQuantity(product.id);
    addOrUpdateItem(product, currentQty + 1);
  }

  void decrementItem(Product product) {
    final currentQty = state.getItemQuantity(product.id);
    if (currentQty > 1) {
      addOrUpdateItem(product, currentQty - 1);
    } else {
      removeItem(product.id);
    }
  }

  void updateQuantity(String productId, int quantity) {
    final index = state.items.indexWhere(
      (item) => item.product.id == productId,
    );
    if (index != -1) {
      addOrUpdateItem(state.items[index].product, quantity);
    }
  }

  void removeItem(String productId) {
    final updatedList = state.items
        .where((item) => item.product.id != productId)
        .toList();
    state = state.copyWith(
      items: updatedList,
      isOptimizationValid:
          false, // Mark optimization as needing updating when item removed
    );
  }

  void markOptimizationValid(bool valid) {
    state = state.copyWith(isOptimizationValid: valid);
  }

  void clearCart() {
    state = const CartState(items: []);
  }
}

final cartProvider = StateNotifierProvider<CartNotifier, CartState>((ref) {
  return CartNotifier();
});
