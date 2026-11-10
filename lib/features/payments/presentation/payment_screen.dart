import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/router/app_routes.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/components/app_bar_header.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/app_responsive_center.dart';
import '../../../shared/widgets/app_status_badge.dart';
import '../../orders/models/purchase_order.dart';
import '../../orders/providers/order_provider.dart';
import '../providers/payment_provider.dart';
import '../widgets/payment_summary_card.dart';

class PaymentScreen extends ConsumerWidget {
  final String orderId;

  const PaymentScreen({super.key, this.orderId = 'po_89420'});

  Future<void> _handlePayPalCheckout(
    BuildContext context,
    WidgetRef ref,
    PurchaseOrder order,
  ) async {
    final notifier = ref.read(paymentProvider.notifier);
    final success = await notifier.initiatePayPalCheckout(
      orderId: order.id,
      amountInr: order.totalAmount,
    );

    if (success && context.mounted) {
      final activePayment = ref.read(paymentProvider).activePayment;
      final paymentId = activePayment?.paymentId ?? 'pay_98124';
      context.push(AppRoutes.paymentStatusPath(paymentId));
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final orderState = ref.watch(orderProvider);
    final paymentState = ref.watch(paymentProvider);

    // Fallback Purchase Order details if createdOrder is null
    final PurchaseOrder order =
        orderState.createdOrder ??
        PurchaseOrder(
          id: orderId,
          orderNumber: 'PO-89420',
          storeName: 'Global Retail Mart',
          status: 'APPROVED',
          items: const [],
          subtotal: 75.0,
          deliveryFees: 5.0,
          totalAmount: 80.0,
          createdAt: DateTime.now(),
        );

    final isOrderApproved =
        order.status == 'APPROVED' || order.status == 'PAID';
    final amountUsd = order.totalAmount;

    return Scaffold(
      appBar: ProcureAppBarHeader(
        title: 'Secure Checkout',
        subtitle: 'Review your payment details before continuing',
        showAiBadge: true,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: AppResponsiveCenter(
                child: ListView(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.md,
                  ),
                  children: [
                    // Inline Error Alert
                    if (paymentState.errorMessage != null) ...[
                      Container(
                        padding: const EdgeInsets.all(AppSpacing.md),
                        margin: const EdgeInsets.only(bottom: AppSpacing.md),
                        decoration: BoxDecoration(
                          color: isDark
                              ? AppColors.errorBgDark
                              : AppColors.errorBgLight,
                          borderRadius: BorderRadius.circular(
                            AppSpacing.radiusMd,
                          ),
                          border: Border.all(
                            color: AppColors.error.withValues(alpha: 0.3),
                          ),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              LucideIcons.alertTriangle,
                              color: AppColors.error,
                              size: 18,
                            ),
                            const SizedBox(width: AppSpacing.sm),
                            Expanded(
                              child: Text(
                                paymentState.errorMessage!,
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: AppColors.error,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    // SECTION 1: ORDER APPROVAL VERIFICATION CARD
                    AppCard(
                      hasGradient: isOrderApproved,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                order.orderNumber,
                                style: theme.textTheme.titleMedium?.copyWith(
                                  color: isDark
                                      ? AppColors.textPrimaryDark
                                      : AppColors.textPrimaryLight,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              AppStatusBadge(
                                label: isOrderApproved
                                    ? 'Approved for Payment'
                                    : 'Approval Required',
                                status: isOrderApproved
                                    ? BadgeStatus.success
                                    : BadgeStatus.warning,
                              ),
                            ],
                          ),
                          const SizedBox(height: AppSpacing.xs),
                          Text(
                            order.storeName,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: AppColors.secondary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Total Amount: ${CurrencyFormatter.formatINR(order.totalAmount)}',
                            style: theme.textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: isDark
                                  ? AppColors.textPrimaryDark
                                  : AppColors.textPrimaryLight,
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: AppSpacing.md),

                    // Warning if order is not approved yet
                    if (!isOrderApproved) ...[
                      AppCard(
                        backgroundColor: isDark
                            ? AppColors.warningBgDark
                            : AppColors.warningBgLight,
                        child: Row(
                          children: [
                            const Icon(
                              LucideIcons.alertTriangle,
                              color: AppColors.warning,
                              size: 24,
                            ),
                            const SizedBox(width: AppSpacing.md),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Order Not Approved',
                                    style: theme.textTheme.titleSmall?.copyWith(
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.warning,
                                    ),
                                  ),
                                  Text(
                                    'You must approve this purchase order before payment checkout becomes available.',
                                    style: theme.textTheme.bodySmall,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: AppSpacing.md),
                    ],

                    // SECTION 2: FINANCIAL PAYPAL SUMMARY CARD
                    PaymentSummaryCard(
                      amountInr: order.totalAmount,
                      amountUsd: amountUsd,
                      exchangeRate: 83.0,
                      orderNumber: order.orderNumber,
                    ),

                    const SizedBox(height: AppSpacing.lg),

                    // SECTION 3: PAYPAL PARTNER BADGE & SECURITY
                    AppCard(
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: isDark
                                  ? AppColors.surfaceVariantDark
                                  : AppColors.surfaceVariantLight,
                              borderRadius: BorderRadius.circular(
                                AppSpacing.radiusMd,
                              ),
                            ),
                            child: const Icon(
                              LucideIcons.shieldCheck,
                              size: 24,
                              color: AppColors.primary,
                            ),
                          ),
                          const SizedBox(width: AppSpacing.md),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Encrypted PayPal Gateway',
                                  style: theme.textTheme.titleSmall?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  'Payment credentials are never stored. Payment status is verified directly by backend APIs.',
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: isDark
                                        ? AppColors.textSecondaryDark
                                        : AppColors.textSecondaryLight,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: AppSpacing.xl),
                  ],
                ),
              ),
            ),

            // SECTION 4: STICKY FOOTER PAYPAL ACTION
            _StickyCheckoutFooter(
              amountUsd: amountUsd,
              isApproved: isOrderApproved,
              isLoading: paymentState.isCreating,
              onPayWithPayPal: () => _handlePayPalCheckout(context, ref, order),
            ),
          ],
        ),
      ),
    );
  }
}

/// Sticky Bottom Checkout Bar
class _StickyCheckoutFooter extends StatelessWidget {
  final double amountUsd;
  final bool isApproved;
  final bool isLoading;
  final VoidCallback onPayWithPayPal;

  const _StickyCheckoutFooter({
    required this.amountUsd,
    required this.isApproved,
    required this.isLoading,
    required this.onPayWithPayPal,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
        border: Border(
          top: BorderSide(
            color: isDark ? AppColors.borderDark : AppColors.borderLight,
            width: 1,
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.05),
            blurRadius: 10,
            offset: const Offset(0, -3),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('PayPal Checkout Total', style: theme.textTheme.labelSmall),
              Text(
                '\$${amountUsd.toStringAsFixed(2)} USD',
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.sm),

          AppButton(
            text: 'Pay with PayPal Sandbox',
            variant: AppButtonVariant.primary,
            isLoading: isLoading,
            leadingIcon: LucideIcons.creditCard,
            onPressed: isApproved && !isLoading ? onPayWithPayPal : null,
          ),
        ],
      ),
    );
  }
}
