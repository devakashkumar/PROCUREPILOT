import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_exception.dart';
import '../../../models/user_model.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/network_provider.dart';

class DashboardState {
  final bool isLoading;
  final bool isRefreshing;
  final String? errorMessage;
  final UserModel? user;
  final List<Map<String, dynamic>> recentOrders;
  final int totalOrders;
  final int pendingOrders;
  final int completedOrders;
  final double totalSpend;
  final List<Map<String, dynamic>> insights;
  final List<double> monthlySpendPoints;

  const DashboardState({
    this.isLoading = true,
    this.isRefreshing = false,
    this.errorMessage,
    this.user,
    this.recentOrders = const [],
    this.totalOrders = 0,
    this.pendingOrders = 0,
    this.completedOrders = 0,
    this.totalSpend = 0.0,
    this.insights = const [],
    this.monthlySpendPoints = const [],
  });

  DashboardState copyWith({
    bool? isLoading,
    bool? isRefreshing,
    String? errorMessage,
    UserModel? user,
    List<Map<String, dynamic>>? recentOrders,
    int? totalOrders,
    int? pendingOrders,
    int? completedOrders,
    double? totalSpend,
    List<Map<String, dynamic>>? insights,
    List<double>? monthlySpendPoints,
  }) {
    return DashboardState(
      isLoading: isLoading ?? this.isLoading,
      isRefreshing: isRefreshing ?? this.isRefreshing,
      errorMessage: errorMessage,
      user: user ?? this.user,
      recentOrders: recentOrders ?? this.recentOrders,
      totalOrders: totalOrders ?? this.totalOrders,
      pendingOrders: pendingOrders ?? this.pendingOrders,
      completedOrders: completedOrders ?? this.completedOrders,
      totalSpend: totalSpend ?? this.totalSpend,
      insights: insights ?? this.insights,
      monthlySpendPoints: monthlySpendPoints ?? this.monthlySpendPoints,
    );
  }
}

class DashboardNotifier extends StateNotifier<DashboardState> {
  final ApiClient _apiClient;
  final Ref _ref;

  DashboardNotifier(this._apiClient, this._ref)
    : super(const DashboardState()) {
    loadDashboardData();
  }

  Future<void> loadDashboardData({bool isRefresh = false}) async {
    if (isRefresh) {
      state = state.copyWith(isRefreshing: true, errorMessage: null);
    } else {
      state = state.copyWith(isLoading: true, errorMessage: null);
    }

    try {
      // Step 1: Read authenticated user from AuthState
      final authState = _ref.read(authStateProvider);
      UserModel? currentUser = authState.user;

      // If user profile is missing in local authState, fetch from /api/auth/me
      if (currentUser == null) {
        try {
          final meResponse = await _apiClient.get(ApiConstants.me);
          if (meResponse != null) {
            final userMap = meResponse is Map<String, dynamic>
                ? (meResponse['data'] as Map<String, dynamic>? ?? meResponse)
                : <String, dynamic>{};
            currentUser = UserModel.fromJson(userMap);
          }
        } catch (_) {}
      }

      // Step 2: Fetch Orders from GET /api/orders
      List<Map<String, dynamic>> ordersList = [];
      int totalCount = 0;
      int pendingCount = 0;
      int completedCount = 0;
      double totalSpendSum = 0.0;

      try {
        final ordersResponse = await _apiClient.get(ApiConstants.orders);
        if (ordersResponse != null) {
          final dynamic data = ordersResponse is Map<String, dynamic>
              ? (ordersResponse['data'] ??
                    ordersResponse['orders'] ??
                    ordersResponse)
              : ordersResponse;

          if (data is List) {
            ordersList = data
                .map((e) => Map<String, dynamic>.from(e as Map))
                .toList();
          }
        }
      } on ApiException catch (_) {
        // If /api/orders endpoint is not populated yet or offline, gracefully fallback
      } catch (_) {}

      // Calculate order statistics from actual backend order list
      totalCount = ordersList.length;
      for (final order in ordersList) {
        final status = (order['status'] ?? 'DRAFT').toString().toUpperCase();
        final amount =
            (order['totalAmount'] ?? order['amount'] ?? order['total'] ?? 0.0)
                as num;

        totalSpendSum += amount.toDouble();

        if (status == 'PENDING' ||
            status == 'PENDING_APPROVAL' ||
            status == 'DRAFT') {
          pendingCount++;
        } else if (status == 'APPROVED' ||
            status == 'PAID' ||
            status == 'COMPLETED' ||
            status == 'DELIVERED') {
          completedCount++;
        }
      }

      // Step 3: Fetch Insights / Recommendations if available
      List<Map<String, dynamic>> insightsList = [];
      try {
        final recResponse = await _apiClient.get(
          ApiConstants.procurementRecommendations,
        );
        if (recResponse != null) {
          final dynamic recData = recResponse is Map<String, dynamic>
              ? (recResponse['data'] ?? recResponse)
              : recResponse;
          if (recData is List) {
            insightsList = recData
                .map((e) => Map<String, dynamic>.from(e as Map))
                .toList();
          }
        }
      } catch (_) {}

      state = state.copyWith(
        isLoading: false,
        isRefreshing: false,
        user: currentUser,
        recentOrders: ordersList,
        totalOrders: totalCount,
        pendingOrders: pendingCount,
        completedOrders: completedCount,
        totalSpend: totalSpendSum,
        insights: insightsList,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        isRefreshing: false,
        errorMessage: 'Failed to update dashboard data. Please try again.',
      );
    }
  }

  Future<void> refresh() async {
    await loadDashboardData(isRefresh: true);
  }
}

final dashboardProvider =
    StateNotifierProvider<DashboardNotifier, DashboardState>((ref) {
      final apiClient = ref.watch(apiClientProvider);
      return DashboardNotifier(apiClient, ref);
    });
