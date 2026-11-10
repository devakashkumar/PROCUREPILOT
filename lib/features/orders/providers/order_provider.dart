import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_exception.dart';
import '../../../providers/network_provider.dart';
import '../../cart/providers/cart_provider.dart';
import '../models/purchase_order.dart';

class OrderState {
  final bool isLoadingOrders;
  final bool isLoadingDetail;
  final bool isSubmitting;
  final bool isApproving;
  final bool isRejecting;
  final bool isConfirmed;
  final String? errorMessage;
  final String notes;
  final PurchaseOrder? createdOrder;
  final PurchaseOrder? selectedOrderDetails;

  final List<PurchaseOrder> orders;
  final List<PurchaseOrder> filteredOrders;
  final String
  selectedStatusFilter; // 'All', 'Pending', 'Approved', 'Paid', 'Rejected', 'Cancelled'
  final String searchQuery;

  final bool checkItem1;
  final bool checkItem2;
  final bool checkItem3;
  final bool checkItem4;

  const OrderState({
    this.isLoadingOrders = false,
    this.isLoadingDetail = false,
    this.isSubmitting = false,
    this.isApproving = false,
    this.isRejecting = false,
    this.isConfirmed = false,
    this.errorMessage,
    this.notes = '',
    this.createdOrder,
    this.selectedOrderDetails,
    this.orders = const [],
    this.filteredOrders = const [],
    this.selectedStatusFilter = 'All',
    this.searchQuery = '',
    this.checkItem1 = false,
    this.checkItem2 = false,
    this.checkItem3 = false,
    this.checkItem4 = false,
  });

  bool get isAllChecklistApproved =>
      checkItem1 && checkItem2 && checkItem3 && checkItem4;

  OrderState copyWith({
    bool? isLoadingOrders,
    bool? isLoadingDetail,
    bool? isSubmitting,
    bool? isApproving,
    bool? isRejecting,
    bool? isConfirmed,
    String? errorMessage,
    String? notes,
    PurchaseOrder? createdOrder,
    PurchaseOrder? selectedOrderDetails,
    List<PurchaseOrder>? orders,
    List<PurchaseOrder>? filteredOrders,
    String? selectedStatusFilter,
    String? searchQuery,
    bool? checkItem1,
    bool? checkItem2,
    bool? checkItem3,
    bool? checkItem4,
  }) {
    return OrderState(
      isLoadingOrders: isLoadingOrders ?? this.isLoadingOrders,
      isLoadingDetail: isLoadingDetail ?? this.isLoadingDetail,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      isApproving: isApproving ?? this.isApproving,
      isRejecting: isRejecting ?? this.isRejecting,
      isConfirmed: isConfirmed ?? this.isConfirmed,
      errorMessage: errorMessage,
      notes: notes ?? this.notes,
      createdOrder: createdOrder ?? this.createdOrder,
      selectedOrderDetails: selectedOrderDetails ?? this.selectedOrderDetails,
      orders: orders ?? this.orders,
      filteredOrders: filteredOrders ?? this.filteredOrders,
      selectedStatusFilter: selectedStatusFilter ?? this.selectedStatusFilter,
      searchQuery: searchQuery ?? this.searchQuery,
      checkItem1: checkItem1 ?? this.checkItem1,
      checkItem2: checkItem2 ?? this.checkItem2,
      checkItem3: checkItem3 ?? this.checkItem3,
      checkItem4: checkItem4 ?? this.checkItem4,
    );
  }
}

class OrderNotifier extends StateNotifier<OrderState> {
  final ApiClient _apiClient;
  final Ref _ref;

  OrderNotifier(this._apiClient, this._ref) : super(const OrderState()) {
    loadOrderHistory();
  }

  /// Load authenticated user's order history from GET /api/orders
  Future<void> loadOrderHistory({bool isRefresh = false}) async {
    state = state.copyWith(isLoadingOrders: !isRefresh, errorMessage: null);

    try {
      dynamic responseData;
      try {
        responseData = await _apiClient.get(
          '/api/orders',
          queryParameters: {
            if (state.selectedStatusFilter != 'All')
              'status': state.selectedStatusFilter.toUpperCase(),
            if (state.searchQuery.isNotEmpty) 'search': state.searchQuery,
          },
        );
      } on ApiException catch (_) {
        responseData = await _apiClient.get(
          ApiConstants.orders,
          queryParameters: {
            if (state.selectedStatusFilter != 'All')
              'status': state.selectedStatusFilter.toUpperCase(),
            if (state.searchQuery.isNotEmpty) 'search': state.searchQuery,
          },
        );
      }

      List<PurchaseOrder> fetchedOrders = [];
      if (responseData != null) {
        final dynamic data = responseData is Map<String, dynamic>
            ? (responseData['data'] ?? responseData['orders'] ?? responseData)
            : responseData;

        if (data is List) {
          fetchedOrders = data
              .map(
                (e) =>
                    PurchaseOrder.fromJson(Map<String, dynamic>.from(e as Map)),
              )
              .toList();
        }
      }

      // If state.createdOrder exists, prepended to state if not in list
      if (state.createdOrder != null &&
          !fetchedOrders.any((o) => o.id == state.createdOrder!.id)) {
        fetchedOrders.insert(0, state.createdOrder!);
      }

      if (!mounted) return;
      state = state.copyWith(isLoadingOrders: false, orders: fetchedOrders);

      _applyOrderFilters();
    } on ApiException catch (e) {
      if (!mounted) return;
      state = state.copyWith(isLoadingOrders: false, errorMessage: e.message);
    } catch (_) {
      if (!mounted) return;
      state = state.copyWith(
        isLoadingOrders: false,
        errorMessage: 'Failed to load order history.',
      );
    }
  }

  /// Fetch detailed purchase order info by ID via GET /api/orders/:id
  Future<void> fetchOrderDetails(String orderId) async {
    // If order details already matched in memory createdOrder or orders list
    final existingInMemory = state.orders.firstWhere(
      (o) => o.id == orderId || o.orderNumber == orderId,
      orElse: () =>
          state.createdOrder != null &&
              (state.createdOrder!.id == orderId ||
                  state.createdOrder!.orderNumber == orderId)
          ? state.createdOrder!
          : const PurchaseOrder(
              id: '',
              orderNumber: '',
              storeName: '',
              status: 'DRAFT',
              items: [],
              subtotal: 0,
              deliveryFees: 0,
              totalAmount: 0,
            ),
    );

    if (existingInMemory.id.isNotEmpty) {
      state = state.copyWith(selectedOrderDetails: existingInMemory);
    }

    state = state.copyWith(isLoadingDetail: true);

    try {
      dynamic responseData;
      try {
        responseData = await _apiClient.get('/api/orders/$orderId');
      } on ApiException catch (_) {
        responseData = await _apiClient.get(ApiConstants.orderDetail(orderId));
      }

      if (responseData != null) {
        final Map<String, dynamic> body = responseData is Map<String, dynamic>
            ? responseData
            : <String, dynamic>{};
        final dynamic data = body['data'] ?? body;
        final Map<String, dynamic> dataMap = data is Map<String, dynamic>
            ? data
            : <String, dynamic>{};

        final po = PurchaseOrder.fromJson(dataMap);
        state = state.copyWith(
          isLoadingDetail: false,
          selectedOrderDetails: po,
        );
      } else {
        state = state.copyWith(isLoadingDetail: false);
      }
    } catch (_) {
      state = state.copyWith(isLoadingDetail: false);
    }
  }

  void filterByStatus(String statusFilter) {
    state = state.copyWith(selectedStatusFilter: statusFilter);
    _applyOrderFilters();
  }

  void searchOrders(String query) {
    state = state.copyWith(searchQuery: query.trim());
    _applyOrderFilters();
  }

  void _applyOrderFilters() {
    final query = state.searchQuery.toLowerCase();
    final filter = state.selectedStatusFilter.toUpperCase();

    final filtered = state.orders.where((po) {
      final matchesQuery =
          query.isEmpty ||
          po.orderNumber.toLowerCase().contains(query) ||
          po.storeName.toLowerCase().contains(query) ||
          po.items.any(
            (item) => item.product.name.toLowerCase().contains(query),
          );

      bool matchesStatus = true;
      if (filter != 'ALL') {
        if (filter == 'PENDING') {
          matchesStatus =
              po.status == 'PENDING' ||
              po.status == 'PENDING_APPROVAL' ||
              po.status == 'DRAFT';
        } else {
          matchesStatus = po.status == filter;
        }
      }

      return matchesQuery && matchesStatus;
    }).toList();

    state = state.copyWith(filteredOrders: filtered);
  }

  void setConfirmed(bool value) {
    state = state.copyWith(isConfirmed: value);
  }

  void setNotes(String text) {
    state = state.copyWith(notes: text);
  }

  void setCheckItem(int itemIndex, bool value) {
    switch (itemIndex) {
      case 1:
        state = state.copyWith(checkItem1: value);
        break;
      case 2:
        state = state.copyWith(checkItem2: value);
        break;
      case 3:
        state = state.copyWith(checkItem3: value);
        break;
      case 4:
        state = state.copyWith(checkItem4: value);
        break;
    }
  }

  /// Create backend purchase order via POST /api/orders
  Future<String?> createPurchaseOrder({
    required CartState cartState,
    required String storeName,
  }) async {
    if (!state.isConfirmed || state.isSubmitting) return null;

    state = state.copyWith(isSubmitting: true, errorMessage: null);

    try {
      final itemsPayload = cartState.items.map((item) {
        return {
          'productId': item.product.id,
          'productName': item.product.name,
          'quantity': item.quantity,
          'unitPrice': item.unitPrice ?? 0.0,
          'supplierId': item.supplier?.id ?? 'sup_1',
          'supplierName': item.supplier?.name ?? 'Distributor',
        };
      }).toList();

      final payload = <String, dynamic>{
        'storeName': storeName.isNotEmpty ? storeName : 'Global Retail Mart',
        'items': itemsPayload,
        'subtotal': cartState.totalProductSubtotal,
        'deliveryFees': cartState.totalDeliveryFees,
        'totalAmount': cartState.estimatedTotalCost,
        if (state.notes.isNotEmpty) 'notes': state.notes.trim(),
      };

      dynamic responseData;
      try {
        responseData = await _apiClient.post('/api/orders', data: payload);
      } on ApiException catch (_) {
        responseData = await _apiClient.post(
          ApiConstants.orders,
          data: payload,
        );
      }

      PurchaseOrder order;
      if (responseData != null) {
        final Map<String, dynamic> body = responseData is Map<String, dynamic>
            ? responseData
            : <String, dynamic>{};
        final dynamic data = body['data'] ?? body;
        final Map<String, dynamic> dataMap = data is Map<String, dynamic>
            ? data
            : <String, dynamic>{};

        order = PurchaseOrder.fromJson({
          'storeName': storeName,
          'totalAmount': cartState.estimatedTotalCost,
          'subtotal': cartState.totalProductSubtotal,
          'deliveryFees': cartState.totalDeliveryFees,
          'notes': state.notes,
          ...dataMap,
        });
      } else {
        order = _buildFallbackOrder(cartState, storeName);
      }

      final updatedOrdersList = List<PurchaseOrder>.from(state.orders)
        ..insert(0, order);

      state = state.copyWith(
        isSubmitting: false,
        createdOrder: order,
        orders: updatedOrdersList,
      );

      _applyOrderFilters();

      // Clear cart after successful purchase order creation
      _ref.read(cartProvider.notifier).clearCart();

      return order.id;
    } on ApiException catch (e) {
      state = state.copyWith(isSubmitting: false, errorMessage: e.message);
      return null;
    } catch (_) {
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: 'Failed to create purchase order. Please try again.',
      );
      return null;
    }
  }

  /// Approve Purchase Order via POST /api/orders/:id/approve
  Future<bool> approveOrder(String orderId) async {
    if (!state.isAllChecklistApproved || state.isApproving) return false;

    state = state.copyWith(isApproving: true, errorMessage: null);

    try {
      dynamic responseData;
      try {
        responseData = await _apiClient.post(
          ApiConstants.orderApprove(orderId),
        );
      } on ApiException catch (_) {
        responseData = await _apiClient.post(
          ApiConstants.orderApproval(orderId),
        );
      }

      PurchaseOrder updatedOrder;
      if (responseData != null) {
        final Map<String, dynamic> body = responseData is Map<String, dynamic>
            ? responseData
            : <String, dynamic>{};
        final dynamic data = body['data'] ?? body;
        final Map<String, dynamic> dataMap = data is Map<String, dynamic>
            ? data
            : <String, dynamic>{};

        updatedOrder = PurchaseOrder.fromJson({
          ...?state.createdOrder?.toJson(),
          'status': 'APPROVED',
          ...dataMap,
        });
      } else {
        final current =
            state.createdOrder ??
            _buildFallbackOrder(const CartState(), 'Global Retail Mart');
        updatedOrder = PurchaseOrder(
          id: current.id,
          orderNumber: current.orderNumber,
          storeName: current.storeName,
          status: 'APPROVED',
          items: current.items,
          subtotal: current.subtotal,
          deliveryFees: current.deliveryFees,
          totalAmount: current.totalAmount,
          notes: current.notes,
          createdAt: current.createdAt,
        );
      }

      state = state.copyWith(isApproving: false, createdOrder: updatedOrder);

      loadOrderHistory(isRefresh: true);
      return true;
    } on ApiException catch (e) {
      state = state.copyWith(isApproving: false, errorMessage: e.message);
      return false;
    } catch (_) {
      state = state.copyWith(
        isApproving: false,
        errorMessage: 'Failed to approve purchase order. Please try again.',
      );
      return false;
    }
  }

  /// Reject Purchase Order via POST /api/orders/:id/reject
  Future<bool> rejectOrder(String orderId, {String? reason}) async {
    if (state.isRejecting) return false;

    state = state.copyWith(isRejecting: true, errorMessage: null);

    try {
      final responseData = await _apiClient.post(
        ApiConstants.orderReject(orderId),
        data: {
          if (reason != null && reason.isNotEmpty) 'reason': reason.trim(),
        },
      );

      PurchaseOrder updatedOrder;
      if (responseData != null) {
        final Map<String, dynamic> body = responseData is Map<String, dynamic>
            ? responseData
            : <String, dynamic>{};
        final dynamic data = body['data'] ?? body;
        final Map<String, dynamic> dataMap = data is Map<String, dynamic>
            ? data
            : <String, dynamic>{};

        updatedOrder = PurchaseOrder.fromJson({
          ...?state.createdOrder?.toJson(),
          'status': 'REJECTED',
          ...dataMap,
        });
      } else {
        final current =
            state.createdOrder ??
            _buildFallbackOrder(const CartState(), 'Global Retail Mart');
        updatedOrder = PurchaseOrder(
          id: current.id,
          orderNumber: current.orderNumber,
          storeName: current.storeName,
          status: 'REJECTED',
          items: current.items,
          subtotal: current.subtotal,
          deliveryFees: current.deliveryFees,
          totalAmount: current.totalAmount,
          notes: current.notes,
          createdAt: current.createdAt,
        );
      }

      state = state.copyWith(isRejecting: false, createdOrder: updatedOrder);

      loadOrderHistory(isRefresh: true);
      return true;
    } on ApiException catch (e) {
      state = state.copyWith(isRejecting: false, errorMessage: e.message);
      return false;
    } catch (_) {
      state = state.copyWith(
        isRejecting: false,
        errorMessage: 'Failed to reject purchase order.',
      );
      return false;
    }
  }

  PurchaseOrder _buildFallbackOrder(CartState cartState, String storeName) {
    final now = DateTime.now();
    final poId = 'po_${now.millisecondsSinceEpoch}';
    return PurchaseOrder(
      id: poId,
      orderNumber: 'PO-${poId.substring(poId.length - 5)}',
      storeName: storeName.isNotEmpty ? storeName : 'Global Retail Mart',
      status: 'PENDING_APPROVAL',
      items: cartState.items,
      subtotal: cartState.totalProductSubtotal,
      deliveryFees: cartState.totalDeliveryFees,
      totalAmount: cartState.estimatedTotalCost,
      notes: state.notes,
      createdAt: now,
    );
  }

  void clearError() {
    state = state.copyWith(errorMessage: null);
  }
}

final orderProvider = StateNotifierProvider<OrderNotifier, OrderState>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return OrderNotifier(apiClient, ref);
});
