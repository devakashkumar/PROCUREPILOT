import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/widgets/app_card.dart';

class OrderSummaryCard extends StatelessWidget {
  final double productSubtotal;
  final double deliveryFees;
  final double totalAmount;
  final double targetBudget;

  const OrderSummaryCard({
    super.key,
    required this.productSubtotal,
    required this.deliveryFees,
    required this.totalAmount,
    this.targetBudget = 10000.0,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final remainingBudget = targetBudget - totalAmount;
    final isOverBudget = remainingBudget < 0;

    return AppCard(
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
                'Financial Order Summary',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          _SummaryRow(
            label: 'Products Subtotal',
            value: CurrencyFormatter.formatINR(productSubtotal),
            isDark: isDark,
          ),
          const SizedBox(height: AppSpacing.xs),
          _SummaryRow(
            label: 'Estimated Delivery Fees',
            value: CurrencyFormatter.formatINR(deliveryFees),
            isDark: isDark,
          ),
          const SizedBox(height: AppSpacing.xs),
          _SummaryRow(
            label: 'Target Budget Limit',
            value: CurrencyFormatter.formatINR(targetBudget),
            isMuted: true,
            isDark: isDark,
          ),

          const SizedBox(height: AppSpacing.sm),
          const Divider(),
          const SizedBox(height: AppSpacing.sm),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Final Estimated PO Total',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                CurrencyFormatter.formatINR(totalAmount),
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: isOverBudget ? AppColors.error : AppColors.primary,
                ),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.xs),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Remaining Budget',
                style: theme.textTheme.labelMedium?.copyWith(
                  color: isDark
                      ? AppColors.textSecondaryDark
                      : AppColors.textSecondaryLight,
                ),
              ),
              Text(
                CurrencyFormatter.formatINR(remainingBudget),
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: isOverBudget ? AppColors.error : AppColors.success,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isMuted;
  final bool isDark;

  const _SummaryRow({
    required this.label,
    required this.value,
    this.isMuted = false,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: theme.textTheme.bodyMedium?.copyWith(
            color: isMuted
                ? (isDark ? AppColors.textMutedDark : AppColors.textMutedLight)
                : (isDark
                      ? AppColors.textSecondaryDark
                      : AppColors.textSecondaryLight),
          ),
        ),
        Text(
          value,
          style: theme.textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.w600,
            color: isMuted
                ? (isDark ? AppColors.textMutedDark : AppColors.textMutedLight)
                : (isDark
                      ? AppColors.textPrimaryDark
                      : AppColors.textPrimaryLight),
          ),
        ),
      ],
    );
  }
}
