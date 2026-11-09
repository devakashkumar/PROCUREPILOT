import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_exception.dart';
import '../../../providers/network_provider.dart';
import '../models/product.dart';

class ProductState {
  final bool isLoading;
  final bool isRefreshing;
  final String? errorMessage;
  final List<Product> products;
  final List<Product> filteredProducts;
  final String selectedCategory;
  final String searchQuery;
  final List<String> categories;

  const ProductState({
    this.isLoading = true,
    this.isRefreshing = false,
    this.errorMessage,
    this.products = const [],
    this.filteredProducts = const [],
    this.selectedCategory = 'All',
    this.searchQuery = '',
    this.categories = const ['All'],
  });

  ProductState copyWith({
    bool? isLoading,
    bool? isRefreshing,
    String? errorMessage,
    List<Product>? products,
    List<Product>? filteredProducts,
    String? selectedCategory,
    String? searchQuery,
    List<String>? categories,
  }) {
    return ProductState(
      isLoading: isLoading ?? this.isLoading,
      isRefreshing: isRefreshing ?? this.isRefreshing,
      errorMessage: errorMessage,
      products: products ?? this.products,
      filteredProducts: filteredProducts ?? this.filteredProducts,
      selectedCategory: selectedCategory ?? this.selectedCategory,
      searchQuery: searchQuery ?? this.searchQuery,
      categories: categories ?? this.categories,
    );
  }
}

class ProductNotifier extends StateNotifier<ProductState> {
  final ApiClient _apiClient;

  ProductNotifier(this._apiClient) : super(const ProductState()) {
    loadProducts();
  }

  Future<void> loadProducts({bool isRefresh = false}) async {
    if (isRefresh) {
      state = state.copyWith(isRefreshing: true, errorMessage: null);
    } else {
      state = state.copyWith(isLoading: true, errorMessage: null);
    }

    try {
      dynamic responseData;

      try {
        responseData = await _apiClient.get(
          '/api/products',
          queryParameters: {
            if (state.selectedCategory != 'All')
              'category': state.selectedCategory,
            if (state.searchQuery.isNotEmpty) 'query': state.searchQuery,
          },
        );
      } on ApiException catch (_) {
        // Fallback to /products endpoint if /api/products is aliased
        responseData = await _apiClient.get(
          ApiConstants.products,
          queryParameters: {
            if (state.selectedCategory != 'All')
              'category': state.selectedCategory,
            if (state.searchQuery.isNotEmpty) 'query': state.searchQuery,
          },
        );
      }

      List<Product> productList = [];
      if (responseData != null) {
        final dynamic data = responseData is Map<String, dynamic>
            ? (responseData['data'] ?? responseData['products'] ?? responseData)
            : responseData;

        if (data is List) {
          productList = data
              .map((e) => Product.fromJson(Map<String, dynamic>.from(e as Map)))
              .toList();
        }
      }

      // Extract unique categories
      final Set<String> catSet = {'All'};
      for (final prod in productList) {
        if (prod.category.isNotEmpty) {
          catSet.add(prod.category);
        }
      }

      state = state.copyWith(
        isLoading: false,
        isRefreshing: false,
        products: productList,
        categories: catSet.toList(),
      );

      _applyFilters();
    } on ApiException catch (e) {
      state = state.copyWith(
        isLoading: false,
        isRefreshing: false,
        errorMessage: e.message,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        isRefreshing: false,
        errorMessage:
            'Failed to load products. Please check network connection.',
      );
    }
  }

  void search(String query) {
    state = state.copyWith(searchQuery: query.trim());
    _applyFilters();
  }

  void selectCategory(String category) {
    state = state.copyWith(selectedCategory: category);
    _applyFilters();
  }

  void _applyFilters() {
    final query = state.searchQuery.toLowerCase();
    final category = state.selectedCategory;

    final filtered = state.products.where((prod) {
      final matchesQuery =
          query.isEmpty ||
          prod.name.toLowerCase().contains(query) ||
          prod.brand.toLowerCase().contains(query) ||
          prod.description.toLowerCase().contains(query);

      final matchesCategory = category == 'All' || prod.category == category;

      return matchesQuery && matchesCategory;
    }).toList();

    state = state.copyWith(filteredProducts: filtered);
  }

  Future<void> refresh() async {
    await loadProducts(isRefresh: true);
  }
}

final productProvider = StateNotifierProvider<ProductNotifier, ProductState>((
  ref,
) {
  final apiClient = ref.watch(apiClientProvider);
  return ProductNotifier(apiClient);
});
