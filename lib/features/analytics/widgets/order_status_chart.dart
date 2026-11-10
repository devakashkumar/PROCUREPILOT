import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../shared/widgets/app_card.dart';

class OrderStatusChart extends StatelessWidget {
  final Map<String, int> statusCounts;

  const OrderStatusChart({super.key, required this.statusCounts});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final totalOrders = statusCounts.values.fold<int>(
      0,
      (sum, count) => sum + count,
    );

    final pending =
        statusCounts['PENDING_APPROVAL'] ??
        statusCounts['PENDING'] ??
        statusCounts['DRAFT'] ??
        0;
    final approved = statusCounts['APPROVED'] ?? 0;
    final paid = statusCounts['PAID'] ?? statusCounts['COMPLETED'] ?? 0;
    final rejected = statusCounts['REJECTED'] ?? statusCounts['CANCELLED'] ?? 0;

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                LucideIcons.pieChart,
                size: 18,
                color: AppColors.primary,
              ),
              const SizedBox(width: AppSpacing.xs),
              Text(
                'Order Status Distribution',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          if (totalOrders == 0) ...[
            Container(
              height: 100,
              alignment: Alignment.center,
              child: Text(
                'No orders available for status breakdown.',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: isDark
                      ? AppColors.textSecondaryDark
                      : AppColors.textSecondaryLight,
                ),
              ),
            ),
          ] else ...[
            Row(
              children: [
                SizedBox(
                  width: 100,
                  height: 100,
                  child: PieChart(
                    PieChartData(
                      sectionsSpace: 2,
                      centerSpaceRadius: 28,
                      sections: [
                        if (paid > 0)
                          PieChartSectionData(
                            color: AppColors.success,
                            value: paid.toDouble(),
                            radius: 18,
                            showTitle: false,
                          ),
                        if (approved > 0)
                          PieChartSectionData(
                            color: AppColors.primary,
                            value: approved.toDouble(),
                            radius: 18,
                            showTitle: false,
                          ),
                        if (pending > 0)
                          PieChartSectionData(
                            color: AppColors.warning,
                            value: pending.toDouble(),
                            radius: 18,
                            showTitle: false,
                          ),
                        if (rejected > 0)
                          PieChartSectionData(
                            color: AppColors.error,
                            value: rejected.toDouble(),
                            radius: 18,
                            showTitle: false,
                          ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(width: AppSpacing.md),

                Expanded(
                  child: Column(
                    children: [
                      _LegendRow(
                        label: 'Paid / Completed',
                        count: paid,
                        color: AppColors.success,
                        isDark: isDark,
                      ),
                      const SizedBox(height: 4),
                      _LegendRow(
                        label: 'Approved POs',
                        count: approved,
                        color: AppColors.primary,
                        isDark: isDark,
                      ),
                      const SizedBox(height: 4),
                      _LegendRow(
                        label: 'Pending Review',
                        count: pending,
                        color: AppColors.warning,
                        isDark: isDark,
                      ),
                      const SizedBox(height: 4),
                      _LegendRow(
                        label: 'Rejected',
                        count: rejected,
                        color: AppColors.error,
                        isDark: isDark,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _LegendRow extends StatelessWidget {
  final String label;
  final int count;
  final Color color;
  final bool isDark;

  const _LegendRow({
    required this.label,
    required this.count,
    required this.color,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(color: color, shape: BoxShape.circle),
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: theme.textTheme.bodySmall?.copyWith(
                color: isDark
                    ? AppColors.textSecondaryDark
                    : AppColors.textSecondaryLight,
              ),
            ),
          ],
        ),
        Text(
          '$count',
          style: theme.textTheme.bodySmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}
