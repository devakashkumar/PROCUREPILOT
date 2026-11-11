import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/app_status_badge.dart';

class CartSummaryCard extends StatelessWidget {
  final double totalBudget;
  final double productSubtotal;
  final double deliveryFees;
  final double estimatedTotal;
  final double remainingBudget;
  final bool isOverBudget;
  final bool isOptimizationValid;
  final VoidCallback? onReoptimize;

  const CartSummaryCard({
    super.key,
    required this.totalBudget,
    required this.productSubtotal,
    required this.deliveryFees,
    required this.estimatedTotal,
    required this.remainingBudget,
    required this.isOverBudget,
    required this.isOptimizationValid,
    this.onReoptimize,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Optimization Status Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
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
                    'Procurement Budget',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              AppStatusBadge(
                label: isOptimizationValid ? 'AI Optimized' : 'Needs Updating',
                status: isOptimizationValid
                    ? BadgeStatus.aiRecommended
                    : BadgeStatus.warning,
                icon: isOptimizationValid
                    ? LucideIcons.sparkles
                    : LucideIcons.alertTriangle,
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // Re-optimize Warning Banner if quantities changed
          if (!isOptimizationValid) ...[
            Container(
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: isDark
                    ? AppColors.warningBgDark
                    : AppColors.warningBgLight,
                borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                border: Border.all(
                  color: AppColors.warning.withValues(alpha: 0.3),
                ),
              ),
              child: Row(
                children: [
                  const Icon(
                    LucideIcons.refreshCw,
                    color: AppColors.warning,
                    size: 18,
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Text(
                      'Quantities changed. Update optimization to ensure best supplier pricing.',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: AppColors.warning,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  if (onReoptimize != null) ...[
                    const SizedBox(width: AppSpacing.xs),
                    GestureDetector(
                      onTap: onReoptimize,
                      child: Text(
                        'Re-optimize',
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.md),
          ],

          // Financial Line Items Breakdown
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
            value: CurrencyFormatter.formatINR(totalBudget),
            isMuted: true,
            isDark: isDark,
          ),

          const SizedBox(height: AppSpacing.sm),
          const Divider(),
          const SizedBox(height: AppSpacing.sm),

          // Total & Remaining Budget
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Estimated Purchase Total',
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    'Subject to final supplier verification',
                    style: theme.textTheme.labelSmall?.copyWith(fontSize: 10),
                  ),
                ],
              ),
              Text(
                CurrencyFormatter.formatINR(estimatedTotal),
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
                'Remaining Target Budget',
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

          // Over-budget alert
          if (isOverBudget) ...[
            const SizedBox(height: AppSpacing.sm),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: isDark ? AppColors.errorBgDark : AppColors.errorBgLight,
                borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
              ),
              child: Row(
                children: const [
                  Icon(
                    LucideIcons.alertTriangle,
                    size: 14,
                    color: AppColors.error,
                  ),
                  SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Warning: Estimated purchase total exceeds target budget limit.',
                      style: TextStyle(
                        fontSize: 11,
                        color: AppColors.error,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
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
