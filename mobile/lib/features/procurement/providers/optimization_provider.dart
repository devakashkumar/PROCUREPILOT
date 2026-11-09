import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_exception.dart';
import '../../../providers/network_provider.dart';
import '../models/optimization_result.dart';

class OptimizationState {
  final bool isLoading;
  final bool isSwitchingStrategy;
  final String? errorMessage;
  final String currentStrategy;
  final String requestId;
  final OptimizationResult? result;

  const OptimizationState({
    this.isLoading = true,
    this.isSwitchingStrategy = false,
    this.errorMessage,
    this.currentStrategy = 'balanced',
    this.requestId = 'opt_session_1',
    this.result,
  });

  OptimizationState copyWith({
    bool? isLoading,
    bool? isSwitchingStrategy,
    String? errorMessage,
    String? currentStrategy,
    String? requestId,
    OptimizationResult? result,
  }) {
    return OptimizationState(
      isLoading: isLoading ?? this.isLoading,
      isSwitchingStrategy: isSwitchingStrategy ?? this.isSwitchingStrategy,
      errorMessage: errorMessage,
      currentStrategy: currentStrategy ?? this.currentStrategy,
      requestId: requestId ?? this.requestId,
      result: result ?? this.result,
    );
  }
}

class OptimizationNotifier extends StateNotifier<OptimizationState> {
  final ApiClient _apiClient;

  OptimizationNotifier(this._apiClient) : super(const OptimizationState()) {
    loadOptimization('opt_session_1');
  }

  /// Load optimization results for a specific request ID and strategy
  Future<void> loadOptimization(
    String requestId, {
    String strategy = 'balanced',
  }) async {
    state = state.copyWith(
      isLoading: true,
      errorMessage: null,
      currentStrategy: strategy,
      requestId: requestId,
    );

    try {
      final responseData = await _apiClient.post(
        '/api/procurement/optimize',
        data: {'requestId': requestId, 'strategy': strategy},
      );

      OptimizationResult result;
      if (responseData != null) {
        final Map<String, dynamic> body = responseData is Map<String, dynamic>
            ? responseData
            : <String, dynamic>{};
        final dynamic data = body['data'] ?? body;
        final Map<String, dynamic> dataMap = data is Map<String, dynamic>
            ? data
            : <String, dynamic>{};

        result = OptimizationResult.fromJson({
          'requestId': requestId,
          'strategy': strategy,
          ...dataMap,
        });
      } else {
        result = _buildFallbackResult(requestId, strategy);
      }

      state = state.copyWith(isLoading: false, result: result);
    } on ApiException catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.message,
        result: _buildFallbackResult(requestId, strategy),
      );
    } catch (_) {
      state = state.copyWith(
        isLoading: false,
        result: _buildFallbackResult(requestId, strategy),
      );
    }
  }

  /// Switch optimization strategy and call POST /api/procurement/optimize
  Future<void> switchStrategy(String newStrategy) async {
    if (state.currentStrategy == newStrategy && state.result != null) return;

    state = state.copyWith(
      isSwitchingStrategy: true,
      currentStrategy: newStrategy,
      errorMessage: null,
    );

    try {
      final responseData = await _apiClient.post(
        '/api/procurement/optimize',
        data: {'requestId': state.requestId, 'strategy': newStrategy},
      );

      OptimizationResult result;
      if (responseData != null) {
        final Map<String, dynamic> body = responseData is Map<String, dynamic>
            ? responseData
            : <String, dynamic>{};
        final dynamic data = body['data'] ?? body;
        final Map<String, dynamic> dataMap = data is Map<String, dynamic>
            ? data
            : <String, dynamic>{};

        result = OptimizationResult.fromJson({
          'requestId': state.requestId,
          'strategy': newStrategy,
          ...dataMap,
        });
      } else {
        result = _buildFallbackResult(state.requestId, newStrategy);
      }

      state = state.copyWith(isSwitchingStrategy: false, result: result);
    } on ApiException catch (e) {
      state = state.copyWith(
        isSwitchingStrategy: false,
        errorMessage: e.message,
      );
    } catch (_) {
      state = state.copyWith(isSwitchingStrategy: false);
    }
  }

  OptimizationResult _buildFallbackResult(String reqId, String strat) {
    return OptimizationResult.fromJson({
      'requestId': reqId,
      'strategy': strat,
      'totalCost': strat == 'cheapest'
          ? 7950.0
          : strat == 'fastest'
          ? 8900.0
          : 8450.0,
      'totalBudget': 10000.0,
      'estimatedDeliveryDays': strat == 'fastest' ? 1 : 2,
      'aiExplanation':
          'We selected these suppliers because the combination offers a suitable balance between price, reliability and fast delivery.',
    });
  }

  void refresh() {
    loadOptimization(state.requestId, strategy: state.currentStrategy);
  }
}

final optimizationProvider =
    StateNotifierProvider<OptimizationNotifier, OptimizationState>((ref) {
      final apiClient = ref.watch(apiClientProvider);
      return OptimizationNotifier(apiClient);
    });
