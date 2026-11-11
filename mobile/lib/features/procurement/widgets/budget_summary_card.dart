import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/widgets/app_card.dart';

class BudgetSummaryCard extends StatelessWidget {
  final double totalBudget;
  final double totalCost;
  final double remainingBudget;
  final double utilizationPercentage;

  const BudgetSummaryCard({
    super.key,
    required this.totalBudget,
    required this.totalCost,
    required this.remainingBudget,
    required this.utilizationPercentage,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final isOverBudget = remainingBudget < 0;

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(
                    LucideIcons.wallet,
                    size: 18,
                    color: AppColors.primary,
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  Text(
                    'Financial & Budget Summary',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: isOverBudget
                      ? AppColors.errorBgLight
                      : AppColors.successBgLight,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusFull),
                ),
                child: Text(
                  '${(utilizationPercentage * 100).toStringAsFixed(0)}% Utilized',
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: isOverBudget ? AppColors.error : AppColors.success,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // Budget Progress Indicator Bar
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: utilizationPercentage,
              minHeight: 8,
              backgroundColor: isDark
                  ? AppColors.surfaceVariantDark
                  : AppColors.surfaceVariantLight,
              valueColor: AlwaysStoppedAnimation<Color>(
                isOverBudget ? AppColors.error : AppColors.primary,
              ),
            ),
          ),

          const SizedBox(height: AppSpacing.md),

          // 3 Metric Financial Breakdown
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _BudgetStatTile(
                label: 'Available Budget',
                amount: CurrencyFormatter.formatINR(totalBudget),
                isDark: isDark,
              ),
              _BudgetStatTile(
                label: 'Optimized Cost',
                amount: CurrencyFormatter.formatINR(totalCost),
                amountColor: AppColors.primary,
                isDark: isDark,
              ),
              _BudgetStatTile(
                label: 'Remaining',
                amount: CurrencyFormatter.formatINR(remainingBudget),
                amountColor: isOverBudget ? AppColors.error : AppColors.success,
                isDark: isDark,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _BudgetStatTile extends StatelessWidget {
  final String label;
  final String amount;
  final Color? amountColor;
  final bool isDark;

  const _BudgetStatTile({
    required this.label,
    required this.amount,
    this.amountColor,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: theme.textTheme.labelSmall?.copyWith(
            color: isDark
                ? AppColors.textSecondaryDark
                : AppColors.textSecondaryLight,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          amount,
          style: theme.textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.bold,
            color: amountColor,
          ),
        ),
      ],
    );
  }
}
