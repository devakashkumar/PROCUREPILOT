/// Domain Supplier Model representing a wholesale distributor/vendor
class Supplier {
  final String id;
  final String name;
  final String? logoUrl;
  final String location;
  final double reliabilityScore; // Scale 0.0 - 5.0 or 0-100%
  final double rating;
  final bool isVerified;
  final double minOrderValue;

  const Supplier({
    required this.id,
    required this.name,
    this.logoUrl,
    required this.location,
    required this.reliabilityScore,
    required this.rating,
    this.isVerified = true,
    this.minOrderValue = 1000.0,
  });

  factory Supplier.fromJson(Map<String, dynamic> json) {
    return Supplier(
      id: (json['id'] ?? json['_id'] ?? 'sup_1').toString(),
      name: (json['name'] ?? json['supplierName'] ?? 'Wholesale Distributor')
          .toString(),
      logoUrl: json['logoUrl'] as String? ?? json['logo'] as String?,
      location: (json['location'] ?? json['city'] ?? 'Mumbai, MH').toString(),
      reliabilityScore:
          ((json['reliabilityScore'] ?? json['reliability'] ?? 4.8) as num)
              .toDouble(),
      rating: ((json['rating'] ?? json['score'] ?? 4.7) as num).toDouble(),
      isVerified: json['isVerified'] as bool? ?? true,
      minOrderValue: ((json['minOrderValue'] ?? 1000.0) as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'logoUrl': logoUrl,
      'location': location,
      'reliabilityScore': reliabilityScore,
      'rating': rating,
      'isVerified': isVerified,
      'minOrderValue': minOrderValue,
    };
  }
}

/// Line-item supplier offer contract for a specific requested product
class SupplierOffer {
  final String id;
  final Supplier supplier;
  final String productId;
  final String productName;
  final double unitPrice;
  final double quantity;
  final String unit;
  final double deliveryFee;
  final int deliveryDays;
  final bool stockAvailable;
  final bool isCheapest;
  final bool isFastest;
  final bool isMostReliable;

  const SupplierOffer({
    required this.id,
    required this.supplier,
    required this.productId,
    required this.productName,
    required this.unitPrice,
    required this.quantity,
    required this.unit,
    required this.deliveryFee,
    required this.deliveryDays,
    this.stockAvailable = true,
    this.isCheapest = false,
    this.isFastest = false,
    this.isMostReliable = false,
  });

  double get subtotal => unitPrice * quantity;
  double get totalOfferCost => subtotal + deliveryFee;

  factory SupplierOffer.fromJson(Map<String, dynamic> json) {
    final supplierJson = json['supplier'] is Map<String, dynamic>
        ? json['supplier'] as Map<String, dynamic>
        : <String, dynamic>{'name': json['supplierName'] ?? 'Distributor'};

    return SupplierOffer(
      id: (json['id'] ?? json['_id'] ?? 'offer_1').toString(),
      supplier: Supplier.fromJson(supplierJson),
      productId: (json['productId'] ?? json['item'] ?? 'prod_1').toString(),
      productName: (json['productName'] ?? json['item'] ?? 'Product')
          .toString(),
      unitPrice: ((json['unitPrice'] ?? json['price'] ?? 0.0) as num)
          .toDouble(),
      quantity: ((json['quantity'] ?? json['qty'] ?? 1.0) as num).toDouble(),
      unit: (json['unit'] ?? 'units').toString(),
      deliveryFee: ((json['deliveryFee'] ?? json['shipping'] ?? 0.0) as num)
          .toDouble(),
      deliveryDays: (json['deliveryDays'] ?? json['etaDays'] ?? 2) as int,
      stockAvailable:
          json['stockAvailable'] as bool? ?? (json['inStock'] as bool? ?? true),
      isCheapest: json['isCheapest'] as bool? ?? false,
      isFastest: json['isFastest'] as bool? ?? false,
      isMostReliable: json['isMostReliable'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'supplier': supplier.toJson(),
      'productId': productId,
      'productName': productName,
      'unitPrice': unitPrice,
      'quantity': quantity,
      'unit': unit,
      'deliveryFee': deliveryFee,
      'deliveryDays': deliveryDays,
      'stockAvailable': stockAvailable,
      'isCheapest': isCheapest,
      'isFastest': isFastest,
      'isMostReliable': isMostReliable,
    };
  }
}
