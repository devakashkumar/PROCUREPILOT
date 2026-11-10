/// Domain Product Model for Retail & Wholesale Procurement Catalogue
class Product {
  final String id;
  final String name;
  final String brand;
  final String category;
  final String unit;
  final String description;
  final String? imageUrl;
  final int stock;
  final bool inStock;
  final int minOrderQty;

  const Product({
    required this.id,
    required this.name,
    required this.brand,
    required this.category,
    required this.unit,
    required this.description,
    this.imageUrl,
    this.stock = 100,
    this.inStock = true,
    this.minOrderQty = 1,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    final stockVal = (json['stock'] ?? json['stockQuantity'] ?? 100) as num;
    return Product(
      id: (json['id'] ?? json['_id'] ?? '').toString(),
      name: (json['name'] ?? json['title'] ?? 'Wholesale Product').toString(),
      brand: (json['brand'] ?? json['manufacturer'] ?? 'Generic').toString(),
      category: (json['category'] ?? 'Grocery').toString(),
      unit: (json['unit'] ?? json['packaging'] ?? '1 Unit').toString(),
      description:
          (json['description'] ??
                  json['details'] ??
                  'Wholesale procurement item.')
              .toString(),
      imageUrl: json['imageUrl'] as String? ?? json['image'] as String?,
      stock: stockVal.toInt(),
      inStock: json['inStock'] as bool? ?? (stockVal > 0),
      minOrderQty: (json['minOrderQty'] ?? json['moq'] ?? 1) as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'brand': brand,
      'category': category,
      'unit': unit,
      'description': description,
      'imageUrl': imageUrl,
      'stock': stock,
      'inStock': inStock,
      'minOrderQty': minOrderQty,
    };
  }
}

/// Cart Item model storing selected product and quantity
class CartItem {
  final Product product;
  final int quantity;

  const CartItem({required this.product, required this.quantity});

  CartItem copyWith({Product? product, int? quantity}) {
    return CartItem(
      product: product ?? this.product,
      quantity: quantity ?? this.quantity,
    );
  }
}
