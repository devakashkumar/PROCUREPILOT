import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/network/api_exception.dart';
import '../../../providers/network_provider.dart';
import '../services/payment_service.dart';

class PaymentState {
  final bool isCreating;
  final bool isCapturing;
  final bool isRefreshing;
  final String? errorMessage;
  final PaymentData? activePayment;

  const PaymentState({
    this.isCreating = false,
    this.isCapturing = false,
    this.isRefreshing = false,
    this.errorMessage,
    this.activePayment,
  });

  PaymentState copyWith({
    bool? isCreating,
    bool? isCapturing,
    bool? isRefreshing,
    String? errorMessage,
    PaymentData? activePayment,
  }) {
    return PaymentState(
      isCreating: isCreating ?? this.isCreating,
      isCapturing: isCapturing ?? this.isCapturing,
      isRefreshing: isRefreshing ?? this.isRefreshing,
      errorMessage: errorMessage,
      activePayment: activePayment ?? this.activePayment,
    );
  }
}

class PaymentNotifier extends StateNotifier<PaymentState> {
  final PaymentService _paymentService;

  PaymentNotifier(this._paymentService) : super(const PaymentState());

  /// Request PayPal order creation and open Sandbox Checkout URL
  Future<bool> initiatePayPalCheckout({
    required String orderId,
    required double amountInr,
  }) async {
    if (state.isCreating) return false;

    state = state.copyWith(isCreating: true, errorMessage: null);

    try {
      final paymentData = await _paymentService.createPaymentOrder(
        orderId: orderId,
        amountInr: amountInr,
      );

      state = state.copyWith(isCreating: false, activePayment: paymentData);

      // Launch approval URL in Sandbox browser if available
      if (paymentData.approvalUrl != null &&
          paymentData.approvalUrl!.isNotEmpty) {
        final uri = Uri.parse(paymentData.approvalUrl!);
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        }
      }
      return true;
    } on ApiException catch (e) {
      state = state.copyWith(isCreating: false, errorMessage: e.message);
      return false;
    } catch (e) {
      state = state.copyWith(
        isCreating: false,
        errorMessage: 'Failed to launch PayPal Sandbox checkout.',
      );
      return false;
    }
  }

  /// Request backend to verify and capture PayPal payment
  Future<bool> verifyAndCapturePayment({
    required String paymentId,
    String? paypalOrderId,
  }) async {
    state = state.copyWith(isCapturing: true, errorMessage: null);

    try {
      final confirmedData = await _paymentService.capturePayment(
        paymentId: paymentId,
        paypalOrderId: paypalOrderId,
      );

      state = state.copyWith(isCapturing: false, activePayment: confirmedData);
      return confirmedData.status == 'COMPLETED';
    } on ApiException catch (e) {
      state = state.copyWith(isCapturing: false, errorMessage: e.message);
      return false;
    } catch (_) {
      state = state.copyWith(
        isCapturing: false,
        errorMessage: 'Payment verification failed.',
      );
      return false;
    }
  }

  /// Refresh status from GET /api/payments/:id
  Future<void> refreshPaymentStatus(String paymentId) async {
    state = state.copyWith(isRefreshing: true, errorMessage: null);

    try {
      final updatedData = await _paymentService.fetchPaymentStatus(paymentId);
      state = state.copyWith(isRefreshing: false, activePayment: updatedData);
    } catch (e) {
      state = state.copyWith(isRefreshing: false);
    }
  }

  void clearError() {
    state = state.copyWith(errorMessage: null);
  }
}

final paymentServiceProvider = Provider<PaymentService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return PaymentService(apiClient);
});

final paymentProvider = StateNotifierProvider<PaymentNotifier, PaymentState>((
  ref,
) {
  final paymentService = ref.watch(paymentServiceProvider);
  return PaymentNotifier(paymentService);
});
