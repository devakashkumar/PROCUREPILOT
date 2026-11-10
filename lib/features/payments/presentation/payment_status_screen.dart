import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/router/app_routes.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../shared/components/app_bar_header.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/app_responsive_center.dart';
import '../providers/payment_provider.dart';
import '../services/payment_service.dart';
import '../widgets/payment_status_badge.dart';

class PaymentStatusScreen extends ConsumerStatefulWidget {
  final String paymentId;

  const PaymentStatusScreen({super.key, this.paymentId = 'pay_98124'});

  @override
  ConsumerState<PaymentStatusScreen> createState() =>
      _PaymentStatusScreenState();
}

class _PaymentStatusScreenState extends ConsumerState<PaymentStatusScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref
          .read(paymentProvider.notifier)
          .verifyAndCapturePayment(
            paymentId: widget.paymentId,
            paypalOrderId: 'PAYPAL-ORD-7712',
          );
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final paymentState = ref.watch(paymentProvider);

    final PaymentData payment =
        paymentState.activePayment ??
        PaymentData(
          paymentId: widget.paymentId,
          paypalOrderId: 'PAYPAL-ORD-7712',
          amountInr: 6400.0,
          amountUsd: 77.11,
          status: paymentState.isCapturing ? 'PROCESSING' : 'COMPLETED',
          paidAt: DateTime.now(),
        );

    final isSuccess =
        payment.status == 'COMPLETED' ||
        payment.status == 'SUCCESS' ||
        payment.status == 'PAID';
    final isProcessing =
        paymentState.isCapturing || payment.status == 'PROCESSING';
    final isFailed = payment.status == 'FAILED';
    final isCancelled = payment.status == 'CANCELLED';

    return Scaffold(
      appBar: ProcureAppBarHeader(
        title: 'Payment Verification',
        subtitle: 'Backend Transaction Record',
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw, size: 18),
            onPressed: () {
              ref
                  .read(paymentProvider.notifier)
                  .refreshPaymentStatus(widget.paymentId);
            },
          ),
          const SizedBox(width: AppSpacing.xs),
        ],
      ),
      body: SafeArea(
        child: AppResponsiveCenter(
          child: ListView(
            padding: const EdgeInsets.all(AppSpacing.md),
            children: [
              const SizedBox(height: AppSpacing.md),

              // SECTION 1: STATUS HEADER AVATAR & TITLE
              Center(
                child: Column(
                  children: [
                    if (isProcessing) ...[
                      Container(
                        width: 72,
                        height: 72,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: isDark
                              ? AppColors.surfaceVariantDark
                              : AppColors.surfaceVariantLight,
                          shape: BoxShape.circle,
                        ),
                        child: const CircularProgressIndicator(
                          strokeWidth: 3,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            AppColors.primary,
                          ),
                        ),
                      ),
                    ] else if (isSuccess) ...[
                      Container(
                        width: 72,
                        height: 72,
                        decoration: BoxDecoration(
                          color: isDark
                              ? AppColors.successBgDark
                              : AppColors.successBgLight,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          LucideIcons.checkCircle2,
                          size: 40,
                          color: AppColors.success,
                        ),
                      ),
                    ] else if (isFailed) ...[
                      Container(
                        width: 72,
                        height: 72,
                        decoration: BoxDecoration(
                          color: isDark
                              ? AppColors.errorBgDark
                              : AppColors.errorBgLight,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          LucideIcons.alertOctagon,
                          size: 40,
                          color: AppColors.error,
                        ),
                      ),
                    ] else ...[
                      Container(
                        width: 72,
                        height: 72,
                        decoration: BoxDecoration(
                          color: isDark
                              ? AppColors.surfaceVariantDark
                              : AppColors.surfaceVariantLight,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          LucideIcons.xCircle,
                          size: 40,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                    ],

                    const SizedBox(height: AppSpacing.md),

                    Text(
                      isProcessing
                          ? 'Verifying Your Payment...'
                          : isSuccess
                          ? 'Payment Confirmed'
                          : isFailed
                          ? 'Payment Failed'
                          : isCancelled
                          ? 'Payment Cancelled'
                          : 'Payment Pending',
                      style: theme.textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),

                    const SizedBox(height: AppSpacing.xs),

                    PaymentStatusBadge(status: payment.status),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.xl),

              // SECTION 2: TRANSACTION DETAILS CARD
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          LucideIcons.receipt,
                          size: 18,
                          color: AppColors.primary,
                        ),
                        const SizedBox(width: AppSpacing.xs),
                        Text(
                          'Transaction Details',
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.md),

                    _DetailRow(
                      label: 'Payment Reference',
                      value: payment.paymentId,
                      isDark: isDark,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    _DetailRow(
                      label: 'PayPal Order ID',
                      value: payment.paypalOrderId ?? 'PAYPAL-ORD-7712',
                      isDark: isDark,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    _DetailRow(
                      label:
                          'Paid Amount (${CurrencyFormatter.activeCurrencyCode})',
                      value: CurrencyFormatter.formatINR(payment.amountInr),
                      isBold: true,
                      isDark: isDark,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    _DetailRow(
                      label: 'PayPal Amount (USD)',
                      value: '\$${payment.amountUsd.toStringAsFixed(2)} USD',
                      isBold: true,
                      isDark: isDark,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    _DetailRow(
                      label: 'Transaction Date',
                      value: AppDateFormatter.formatDateTime(
                        payment.paidAt ?? DateTime.now(),
                      ),
                      isDark: isDark,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.lg),

              // SECTION 3: RE-VERIFY & DASHBOARD ACTION BUTTONS
              if (isFailed || isCancelled) ...[
                AppButton(
                  text: 'Re-verify Payment',
                  variant: AppButtonVariant.primary,
                  leadingIcon: LucideIcons.refreshCw,
                  onPressed: () {
                    ref
                        .read(paymentProvider.notifier)
                        .verifyAndCapturePayment(
                          paymentId: widget.paymentId,
                          paypalOrderId: 'PAYPAL-ORD-7712',
                        );
                  },
                ),
                const SizedBox(height: AppSpacing.sm),
              ],

              AppButton(
                text: 'Done & Back to Dashboard',
                variant: isSuccess
                    ? AppButtonVariant.primary
                    : AppButtonVariant.outline,
                leadingIcon: LucideIcons.layoutDashboard,
                onPressed: () {
                  context.go(AppRoutes.dashboard);
                },
              ),

              const SizedBox(height: AppSpacing.xl),
            ],
          ),
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isBold;
  final bool isDark;

  const _DetailRow({
    required this.label,
    required this.value,
    this.isBold = false,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(
            label,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: isDark
                  ? AppColors.textSecondaryDark
                  : AppColors.textSecondaryLight,
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ),
        const SizedBox(width: 4),
        Flexible(
          child: Text(
            value,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: isBold ? FontWeight.bold : FontWeight.w500,
              color: isBold ? AppColors.primary : null,
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}
