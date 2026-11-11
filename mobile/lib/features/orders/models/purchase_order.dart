import '../../cart/models/cart_item.dart';
import '../../products/models/product.dart';
import '../../suppliers/models/supplier.dart';

/// Purchase Order domain model for backend order workflow
class PurchaseOrder {
  final String id;
  final String orderNumber;
  final String storeName;
  final String
  status; // 'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PAID', 'REJECTED', 'CANCELLED'
  final List<ProcurementCartItem> items;
  final double subtotal;
  final double deliveryFees;
  final double totalAmount;
  final String currency;
  final String? notes;
  final DateTime? createdAt;
  final String? paymentId;
  final String? paymentStatus;
  final List<Map<String, dynamic>> trackingEvents;

  const PurchaseOrder({
    required this.id,
    required this.orderNumber,
    required this.storeName,
    required this.status,
    required this.items,
    required this.subtotal,
    required this.deliveryFees,
    required this.totalAmount,
    this.currency = 'INR',
    this.notes,
    this.createdAt,
    this.paymentId,
    this.paymentStatus,
    this.trackingEvents = const [],
  });

  factory PurchaseOrder.fromJson(Map<String, dynamic> json) {
    final rawItems =
        json['items'] ?? json['lineItems'] ?? json['products'] ?? [];
    final List<ProcurementCartItem> itemsList = rawItems is List
        ? rawItems.map((e) {
            final itemMap = Map<String, dynamic>.from(e as Map);
            final prodMap = itemMap['product'] is Map<String, dynamic>
                ? itemMap['product'] as Map<String, dynamic>
                : itemMap;
            final supMap = itemMap['supplier'] is Map<String, dynamic>
                ? itemMap['supplier'] as Map<String, dynamic>
                : <String, dynamic>{
                    'name': itemMap['supplierName'] ?? 'Wholesale Distributor',
                  };

            return ProcurementCartItem(
              product: Product.fromJson(prodMap),
              quantity: (itemMap['quantity'] ?? itemMap['qty'] ?? 1) as int,
              supplier: Supplier.fromJson(supMap),
              unitPrice:
                  ((itemMap['unitPrice'] ?? itemMap['price'] ?? 0.0) as num)
                      .toDouble(),
              deliveryFee: ((itemMap['deliveryFee'] ?? 0.0) as num).toDouble(),
            );
          }).toList()
        : [];

    final rawEvents = json['trackingEvents'] ?? json['timeline'] ?? [];
    final List<Map<String, dynamic>> eventsList = rawEvents is List
        ? rawEvents.map((e) => Map<String, dynamic>.from(e as Map)).toList()
        : [];

    final idVal = (json['id'] ?? json['_id'] ?? 'po_draft').toString();
    final orderNumVal =
        (json['orderNumber'] ??
                json['poNumber'] ??
                'PO-${idVal.substring(0, idVal.length > 6 ? 6 : idVal.length)}')
            .toString();

    return PurchaseOrder(
      id: idVal,
      orderNumber: orderNumVal,
      storeName:
          (json['storeName'] ?? json['businessName'] ?? 'Sharma Kirana Store')
              .toString(),
      status: (json['status'] ?? 'PENDING_APPROVAL').toString().toUpperCase(),
      items: itemsList,
      subtotal: ((json['subtotal'] ?? 0.0) as num).toDouble(),
      deliveryFees: ((json['deliveryFees'] ?? json['shipping'] ?? 0.0) as num)
          .toDouble(),
      totalAmount: ((json['totalAmount'] ?? json['total'] ?? 0.0) as num)
          .toDouble(),
      currency: (json['currency'] ?? 'INR').toString(),
      notes: json['notes'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : DateTime.now(),
      paymentId:
          json['paymentId'] as String? ?? json['paymentReference'] as String?,
      paymentStatus: json['paymentStatus'] as String?,
      trackingEvents: eventsList,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'orderNumber': orderNumber,
      'storeName': storeName,
      'status': status,
      'subtotal': subtotal,
      'deliveryFees': deliveryFees,
      'totalAmount': totalAmount,
      'currency': currency,
      'notes': notes,
      'createdAt': createdAt?.toIso8601String(),
      'paymentId': paymentId,
      'paymentStatus': paymentStatus,
      'trackingEvents': trackingEvents,
    };
  }
}
