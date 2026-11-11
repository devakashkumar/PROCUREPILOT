import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_exception.dart';
import '../../../providers/network_provider.dart';
import '../models/supplier.dart';

class SupplierState {
  final bool isLoading;
  final bool isOptimizing;
  final String? errorMessage;
  final List<Supplier> suppliers;
  final List<SupplierOffer> offers;
  final String
  selectedStrategy; // 'balanced', 'cheapest', 'reliable', 'fastest'
  final Map<String, SupplierOffer> selectedOffers; // productId -> SupplierOffer
  final double totalBudget;
  final String requestSummary;

  const SupplierState({
    this.isLoading = true,
    this.isOptimizing = false,
    this.errorMessage,
    this.suppliers = const [],
    this.offers = const [],
    this.selectedStrategy = 'balanced',
    this.selectedOffers = const {},
    this.totalBudget = 10000.0,
    this.requestSummary = '20 kg Atta, 30 kg Rice, 15 L Sunflower Oil',
  });

  double get totalSelectedCost {
    double total = 0.0;
    for (final offer in selectedOffers.values) {
      total += offer.totalOfferCost;
    }
    return total;
  }

  double get remainingBudget => totalBudget - totalSelectedCost;
  bool get isOverBudget => totalSelectedCost > totalBudget;

  SupplierState copyWith({
    bool? isLoading,
    bool? isOptimizing,
    String? errorMessage,
    List<Supplier>? suppliers,
    List<SupplierOffer>? offers,
    String? selectedStrategy,
    Map<String, SupplierOffer>? selectedOffers,
    double? totalBudget,
    String? requestSummary,
  }) {
    return SupplierState(
      isLoading: isLoading ?? this.isLoading,
      isOptimizing: isOptimizing ?? this.isOptimizing,
      errorMessage: errorMessage,
      suppliers: suppliers ?? this.suppliers,
      offers: offers ?? this.offers,
      selectedStrategy: selectedStrategy ?? this.selectedStrategy,
      selectedOffers: selectedOffers ?? this.selectedOffers,
      totalBudget: totalBudget ?? this.totalBudget,
      requestSummary: requestSummary ?? this.requestSummary,
    );
  }
}

class SupplierNotifier extends StateNotifier<SupplierState> {
  final ApiClient _apiClient;

  SupplierNotifier(this._apiClient) : super(const SupplierState()) {
    loadSupplierData();
  }

  Future<void> loadSupplierData({bool isRefresh = false}) async {
    if (isRefresh) {
      state = state.copyWith(isLoading: true, errorMessage: null);
    } else {
      state = state.copyWith(isLoading: true, errorMessage: null);
    }

    try {
      dynamic responseData;

      try {
        responseData = await _apiClient.get('/api/suppliers');
      } on ApiException catch (_) {
        responseData = await _apiClient.get(ApiConstants.suppliers);
      }

      List<Supplier> supplierList = [];
      List<SupplierOffer> offerList = [];

      if (responseData != null) {
        final dynamic data = responseData is Map<String, dynamic>
            ? (responseData['data'] ??
                  responseData['suppliers'] ??
                  responseData)
            : responseData;

        if (data is List) {
          supplierList = data
              .map(
                (e) => Supplier.fromJson(Map<String, dynamic>.from(e as Map)),
              )
              .toList();
        }
      }

      // If offers array was included in response data, parse supplier offers
      if (responseData is Map<String, dynamic> &&
          responseData['data'] is Map<String, dynamic>) {
        final Map<String, dynamic> dataMap =
            responseData['data'] as Map<String, dynamic>;
        final offersData = dataMap['offers'] ?? dataMap['supplierOffers'];
        if (offersData is List) {
          offerList = offersData
              .map(
                (e) =>
                    SupplierOffer.fromJson(Map<String, dynamic>.from(e as Map)),
              )
              .toList();
        }
      }

      state = state.copyWith(
        isLoading: false,
        suppliers: supplierList,
        offers: offerList,
      );
    } on ApiException catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.message);
    } catch (_) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load supplier comparison data.',
      );
    }
  }

  /// Change optimization strategy and query POST /api/procurement/optimize
  Future<void> selectStrategy(String strategy) async {
    if (state.selectedStrategy == strategy && state.offers.isNotEmpty) return;

    state = state.copyWith(
      selectedStrategy: strategy,
      isOptimizing: true,
      errorMessage: null,
    );

    try {
      final responseData = await _apiClient.post(
        '/api/procurement/optimize',
        data: {'strategy': strategy, 'summary': state.requestSummary},
      );

      List<SupplierOffer> optimizedOffers = [];
      if (responseData != null) {
        final dynamic data = responseData is Map<String, dynamic>
            ? (responseData['data'] ?? responseData['offers'] ?? responseData)
            : responseData;

        if (data is Map<String, dynamic> && data['offers'] is List) {
          final list = data['offers'] as List;
          optimizedOffers = list
              .map(
                (e) =>
                    SupplierOffer.fromJson(Map<String, dynamic>.from(e as Map)),
              )
              .toList();
        } else if (data is List) {
          optimizedOffers = data
              .map(
                (e) =>
                    SupplierOffer.fromJson(Map<String, dynamic>.from(e as Map)),
              )
              .toList();
        }
      }

      state = state.copyWith(
        isOptimizing: false,
        offers: optimizedOffers.isNotEmpty ? optimizedOffers : state.offers,
      );
    } on ApiException catch (e) {
      state = state.copyWith(isOptimizing: false, errorMessage: e.message);
    } catch (_) {
      state = state.copyWith(isOptimizing: false);
    }
  }

  /// Toggle selection of a specific supplier offer for a product
  void selectOffer(SupplierOffer offer) {
    final updated = Map<String, SupplierOffer>.from(state.selectedOffers);
    updated[offer.productId] = offer;
    state = state.copyWith(selectedOffers: updated);
  }

  void refresh() {
    loadSupplierData(isRefresh: true);
  }
}

final supplierProvider = StateNotifierProvider<SupplierNotifier, SupplierState>(
  (ref) {
    final apiClient = ref.watch(apiClientProvider);
    return SupplierNotifier(apiClient);
  },
);
