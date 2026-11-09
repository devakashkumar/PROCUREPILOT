import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/components/app_bar_header.dart';
import '../../../shared/widgets/app_empty_state.dart';
import '../../../shared/widgets/app_error_widget.dart';
import '../../../shared/widgets/app_responsive_center.dart';
import '../../../shared/widgets/app_skeleton.dart';
import '../models/analytics_data.dart';
import '../providers/analytics_provider.dart';
import '../widgets/analytics_summary_card.dart';
import '../widgets/order_status_chart.dart';
import '../widgets/procurement_insight_card.dart';
import '../widgets/spending_chart.dart';

class AnalyticsScreen extends ConsumerWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final state = ref.watch(analyticsProvider);

    return Scaffold(
      appBar: ProcureAppBarHeader(
        title: 'Business Insights',
        subtitle: 'Understand your procurement performance',
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw, size: 18),
            onPressed: () => ref
                .read(analyticsProvider.notifier)
                .loadAnalytics(isRefresh: true),
          ),
          const SizedBox(width: AppSpacing.xs),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => ref
              .read(analyticsProvider.notifier)
              .loadAnalytics(isRefresh: true),
          color: AppColors.primary,
          child: AppResponsiveCenter(
            child: ListView(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.md,
              ),
              children: [
                // SECTION 1: TIME RANGE FILTER BAR
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Time Horizon',
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: isDark
                            ? AppColors.surfaceDark
                            : AppColors.surfaceLight,
                        borderRadius: BorderRadius.circular(
                          AppSpacing.radiusMd,
                        ),
                        border: Border.all(
                          color: isDark
                              ? AppColors.borderDark
                              : AppColors.borderLight,
                        ),
                      ),
                      child: DropdownButton<String>(
                        value: state.selectedTimeRange,
                        underline: const SizedBox(),
                        isDense: true,
                        onChanged: (newRange) {
                          if (newRange != null) {
                            ref
                                .read(analyticsProvider.notifier)
                                .setTimeRange(newRange);
                          }
                        },
                        items: const [
                          DropdownMenuItem(
                            value: '30 Days',
                            child: Text('30 Days'),
                          ),
                          DropdownMenuItem(
                            value: '90 Days',
                            child: Text('90 Days'),
                          ),
                          DropdownMenuItem(
                            value: 'This Year',
                            child: Text('This Year'),
                          ),
                          DropdownMenuItem(
                            value: 'All Time',
                            child: Text('All Time'),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: AppSpacing.md),

                // SECTION 2: METRICS SUMMARY GRID
                _buildMetricsContent(context, ref, theme, isDark, state),

                const SizedBox(height: AppSpacing.xl),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMetricsContent(
    BuildContext context,
    WidgetRef ref,
    ThemeData theme,
    bool isDark,
    AnalyticsState state,
  ) {
    if (state.isLoading) {
      return Column(
        children: const [
          AppCardSkeleton(),
          SizedBox(height: AppSpacing.md),
          AppCardSkeleton(),
        ],
      );
    }

    if (state.errorMessage != null && state.data == null) {
      return AppErrorWidget(
        message: state.errorMessage!,
        onRetry: () =>
            ref.read(analyticsProvider.notifier).loadAnalytics(isRefresh: true),
      );
    }

    final data =
        state.data ??
        const AnalyticsData(
          totalSpendInr: 0.0,
          totalOrdersCount: 0,
          pendingOrdersCount: 0,
          approvedOrdersCount: 0,
          paidOrdersCount: 0,
          rejectedOrdersCount: 0,
          averageOrderValueInr: 0.0,
          supplierSpendDistribution: {},
          statusDistribution: {},
          monthlyTrendSpots: [],
          trendMonthLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          topProducts: [],
          timeRange: 'All Time',
        );

    if (data.totalOrdersCount == 0 && data.totalSpendInr == 0) {
      return AppEmptyState(
        title: 'No Analytics Data Available',
        description:
            'Create purchase orders to populate procurement analytics and spending trends.',
        icon: LucideIcons.lineChart,
      );
    }

    return Column(
      children: [
        // Summary Cards Grid
        Row(
          children: [
            Expanded(
              child: AnalyticsSummaryCard(
                title: 'Total Spend',
                value: CurrencyFormatter.formatINR(data.totalSpendInr),
                subtitle: 'Approved & Paid Total',
                icon: LucideIcons.dollarSign,
                valueColor: AppColors.primary,
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: AnalyticsSummaryCard(
                title: 'Total Orders',
                value: '${data.totalOrdersCount}',
                subtitle:
                    '${data.paidOrdersCount} Paid • ${data.pendingOrdersCount} Pending',
                icon: LucideIcons.shoppingBag,
              ),
            ),
          ],
        ),

        const SizedBox(height: AppSpacing.sm),

        Row(
          children: [
            Expanded(
              child: AnalyticsSummaryCard(
                title: 'Avg Order Value',
                value: CurrencyFormatter.formatINR(data.averageOrderValueInr),
                subtitle: 'Per completed order',
                icon: LucideIcons.calculator,
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: AnalyticsSummaryCard(
                title: 'Approved POs',
                value: '${data.approvedOrdersCount + data.paidOrdersCount}',
                subtitle: 'Ready or completed',
                icon: LucideIcons.checkCircle2,
                valueColor: AppColors.success,
              ),
            ),
          ],
        ),

        const SizedBox(height: AppSpacing.md),

        // SECTION 3: SPENDING TREND CHART
        SpendingChart(
          spots: data.monthlyTrendSpots,
          monthLabels: data.trendMonthLabels,
          totalSpend: data.totalSpendInr,
        ),

        const SizedBox(height: AppSpacing.md),

        // SECTION 4: ORDER STATUS DISTRIBUTION CHART
        OrderStatusChart(statusCounts: data.statusDistribution),

        const SizedBox(height: AppSpacing.md),

        // SECTION 5: PROCUREMENT INSIGHT CARD
        ProcurementInsightCard(
          supplierSpend: data.supplierSpendDistribution,
          topProducts: data.topProducts,
        ),
      ],
    );
  }
}
