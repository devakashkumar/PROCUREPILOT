import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/router/app_routes.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/app_error_widget.dart';
import '../../../shared/widgets/app_responsive_center.dart';
import '../../../shared/widgets/app_skeleton.dart';
import '../../../shared/widgets/app_status_badge.dart';
import '../../notifications/providers/notification_provider.dart';
import '../providers/dashboard_provider.dart';
import '../widgets/dashboard_header.dart';
import '../widgets/quick_action_card.dart';
import '../widgets/recent_orders_section.dart';
import '../widgets/statistics_card.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final state = ref.watch(dashboardProvider);

    if (state.isLoading && !state.isRefreshing) {
      return Scaffold(
        body: AppResponsiveCenter(
          child: ListView(
            padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
            children: const [
              AppSkeleton(height: 50, width: double.infinity),
              SizedBox(height: AppSpacing.md),
              AppCardSkeleton(),
              SizedBox(height: AppSpacing.md),
              AppCardSkeleton(),
            ],
          ),
        ),
      );
    }

    if (state.errorMessage != null && state.recentOrders.isEmpty) {
      return Scaffold(
        body: AppResponsiveCenter(
          child: AppErrorWidget(
            message: state.errorMessage!,
            onRetry: () => ref.read(dashboardProvider.notifier).refresh(),
          ),
        ),
      );
    }

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => ref.read(dashboardProvider.notifier).refresh(),
          color: AppColors.primary,
          child: AppResponsiveCenter(
            child: ListView(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.md,
              ),
              children: [
                // SECTION A: DASHBOARD HEADER
                DashboardHeader(
                  user: state.user,
                  unreadCount: ref.watch(notificationProvider).unreadCount,
                  onNotificationTap: () =>
                      context.push(AppRoutes.notifications),
                ),

                const SizedBox(height: AppSpacing.md),

                // SECTION B: BUSINESS OVERVIEW CARD
                StatisticsCard(
                  totalOrders: state.totalOrders,
                  pendingOrders: state.pendingOrders,
                  completedOrders: state.completedOrders,
                  totalSpend: state.totalSpend,
                ),

                const SizedBox(height: AppSpacing.md),

                // SECTION C: AI PROCUREMENT HERO CARD
                AppCard(
                  hasGradient: true,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: const [
                          AppStatusBadge(
                            label: 'ProcurePilot AI',
                            status: BadgeStatus.aiRecommended,
                            icon: LucideIcons.sparkles,
                          ),
                          Text(
                            'Smart Purchasing',
                            style: TextStyle(
                              fontSize: 12,
                              color: AppColors.secondary,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Text(
                        'Procurement, Powered by AI',
                        style: theme.textTheme.headlineSmall?.copyWith(
                          color: isDark
                              ? AppColors.textPrimaryDark
                              : AppColors.textPrimaryLight,
                          fontWeight: FontWeight.bold,
                          letterSpacing: -0.3,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      Text(
                        'Tell us what your business needs. We’ll find the best suppliers and optimize your purchases.',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: isDark
                              ? AppColors.textSecondaryDark
                              : AppColors.textSecondaryLight,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.md),
                      Row(
                        children: [
                          Expanded(
                            child: AppButton(
                              text: 'Start Smart Procurement',
                              variant: AppButtonVariant.aiGradient,
                              leadingIcon: LucideIcons.sparkles,
                              onPressed: () =>
                                  context.go(AppRoutes.procurement),
                            ),
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          IconButton(
                            style: IconButton.styleFrom(
                              backgroundColor: isDark
                                  ? AppColors.surfaceVariantDark
                                  : AppColors.surfaceVariantLight,
                              padding: const EdgeInsets.all(12),
                            ),
                            icon: const Icon(
                              LucideIcons.mic,
                              color: AppColors.primary,
                            ),
                            tooltip: 'Speak Requirements',
                            onPressed: () => context.go(AppRoutes.procurement),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: AppSpacing.lg),

                // SECTION D: QUICK ACTIONS
                const QuickActionCard(),

                const SizedBox(height: AppSpacing.lg),

                // SECTION E: SPENDING OVERVIEW & ANALYTICS
                _SpendingOverviewSection(
                  totalSpend: state.totalSpend,
                  spendPoints: state.monthlySpendPoints,
                ),

                const SizedBox(height: AppSpacing.lg),

                // SECTION F: RECENT ORDERS
                RecentOrdersSection(orders: state.recentOrders),

                const SizedBox(height: AppSpacing.lg),

                // SECTION G: SMART INSIGHT CARD
                _SmartInsightSection(insights: state.insights),

                const SizedBox(height: AppSpacing.xl),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Spending Overview Section Widget
class _SpendingOverviewSection extends StatelessWidget {
  final double totalSpend;
  final List<double> spendPoints;

  const _SpendingOverviewSection({
    required this.totalSpend,
    required this.spendPoints,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Spending Overview',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              Icon(
                LucideIcons.trendingUp,
                size: 18,
                color: isDark
                    ? AppColors.textSecondaryDark
                    : AppColors.textSecondaryLight,
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            CurrencyFormatter.formatINR(totalSpend),
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),

          if (spendPoints.length >= 2) ...[
            SizedBox(
              height: 120,
              child: LineChart(
                LineChartData(
                  gridData: const FlGridData(show: false),
                  titlesData: const FlTitlesData(show: false),
                  borderData: FlBorderData(show: false),
                  lineBarsData: [
                    LineChartBarData(
                      spots: spendPoints
                          .asMap()
                          .entries
                          .map((e) => FlSpot(e.key.toDouble(), e.value))
                          .toList(),
                      isCurved: true,
                      color: AppColors.primary,
                      barWidth: 3,
                      isStrokeCapRound: true,
                      dotData: const FlDotData(show: true),
                      belowBarData: BarAreaData(
                        show: true,
                        color: AppColors.primary.withValues(alpha: 0.15),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ] else ...[
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: isDark
                    ? AppColors.surfaceVariantDark
                    : AppColors.surfaceVariantLight,
                borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
              ),
              child: Row(
                children: [
                  const Icon(
                    LucideIcons.lineChart,
                    size: 24,
                    color: AppColors.primary,
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Text(
                      'Procurement spending analytics will populate here as purchase history grows.',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: isDark
                            ? AppColors.textSecondaryDark
                            : AppColors.textSecondaryLight,
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

/// Smart Insight Card Section Widget
class _SmartInsightSection extends StatelessWidget {
  final List<Map<String, dynamic>> insights;

  const _SmartInsightSection({required this.insights});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final hasInsights = insights.isNotEmpty;
    final firstInsight = hasInsights ? insights.first : null;
    final title =
        firstInsight?['title']?.toString() ?? 'Smart Inventory Protection';
    final desc =
        firstInsight?['description']?.toString() ??
        'ProcurePilot AI monitors distributor price drops and seasonal surges to suggest optimal reorder times.';

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                LucideIcons.lightbulb,
                size: 18,
                color: AppColors.secondary,
              ),
              const SizedBox(width: AppSpacing.xs),
              Text(
                'ProcurePilot Insights',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            title,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            desc,
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
