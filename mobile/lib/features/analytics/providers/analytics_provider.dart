import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../orders/providers/order_provider.dart';
import '../models/analytics_data.dart';

class AnalyticsState {
  final bool isLoading;
  final bool isRefreshing;
  final String? errorMessage;
  final AnalyticsData? data;
  final String
  selectedTimeRange; // '30 Days', '90 Days', 'This Year', 'All Time'

  const AnalyticsState({
    this.isLoading = false,
    this.isRefreshing = false,
    this.errorMessage,
    this.data,
    this.selectedTimeRange = 'All Time',
  });

  AnalyticsState copyWith({
    bool? isLoading,
    bool? isRefreshing,
    String? errorMessage,
    AnalyticsData? data,
    String? selectedTimeRange,
  }) {
    return AnalyticsState(
      isLoading: isLoading ?? this.isLoading,
      isRefreshing: isRefreshing ?? this.isRefreshing,
      errorMessage: errorMessage,
      data: data ?? this.data,
      selectedTimeRange: selectedTimeRange ?? this.selectedTimeRange,
    );
  }
}

class AnalyticsNotifier extends StateNotifier<AnalyticsState> {
  final Ref _ref;

  AnalyticsNotifier(this._ref) : super(const AnalyticsState()) {
    loadAnalytics();
  }

  /// Load analytics data derived from orders state
  Future<void> loadAnalytics({bool isRefresh = false}) async {
    state = state.copyWith(
      isLoading: !isRefresh,
      isRefreshing: isRefresh,
      errorMessage: null,
    );

    try {
      final orderState = _ref.read(orderProvider);
      final orders = orderState.orders;

      final analytics = AnalyticsData.fromOrders(
        orders,
        timeRange: state.selectedTimeRange,
      );

      state = state.copyWith(
        isLoading: false,
        isRefreshing: false,
        data: analytics,
      );
    } catch (_) {
      state = state.copyWith(
        isLoading: false,
        isRefreshing: false,
        errorMessage: 'Failed to calculate analytics metrics.',
      );
    }
  }

  void setTimeRange(String range) {
    state = state.copyWith(selectedTimeRange: range);
    loadAnalytics(isRefresh: true);
  }
}

final analyticsProvider =
    StateNotifierProvider<AnalyticsNotifier, AnalyticsState>((ref) {
      return AnalyticsNotifier(ref);
    });
