import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/app_status_badge.dart';

class AiPriceTrendCard extends StatelessWidget {
  final String commodityName;
  final double currentPrice;
  final double predictedChangePercent; // e.g., +4.2 or -3.1
  final String recommendation; // 'Buy Now' or 'Wait for Drop'

  const AiPriceTrendCard({
    super.key,
    required this.commodityName,
    required this.currentPrice,
    required this.predictedChangePercent,
    required this.recommendation,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final isUp = predictedChangePercent >= 0;

    return AppCard(
      hasGradient: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const AppStatusBadge(
                label: 'AI Market Forecast',
                status: BadgeStatus.aiRecommended,
                icon: LucideIcons.trendingUp,
              ),
              Text(
                recommendation,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: isUp ? AppColors.error : AppColors.success,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            '$commodityName Price Outlook',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Row(
            children: [
              Icon(
                isUp ? LucideIcons.arrowUpRight : LucideIcons.arrowDownRight,
                size: 16,
                color: isUp ? AppColors.error : AppColors.success,
              ),
              const SizedBox(width: 4),
              Text(
                '${isUp ? '+' : ''}$predictedChangePercent% expected in 14 days',
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: isUp ? AppColors.error : AppColors.success,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            isUp
                ? 'High global demand and seasonal shifts indicate upward price pressure. Recommendation: Lock in bulk order now.'
                : 'Favorable supply chain inventory levels indicate declining prices ahead. Recommendation: Hold non-urgent orders.',
            style: theme.textTheme.bodySmall?.copyWith(
              color: isDark
                  ? AppColors.textSecondaryDark
                  : AppColors.textSecondaryLight,
            ),
          ),
        ],
      ),
    );
  }
}
