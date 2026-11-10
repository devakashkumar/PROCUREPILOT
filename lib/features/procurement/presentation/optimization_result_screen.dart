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
import '../../../shared/widgets/app_error_widget.dart';
import '../../../shared/widgets/app_responsive_center.dart';
import '../../../shared/widgets/app_skeleton.dart';
import '../../../shared/widgets/app_status_badge.dart';
import '../models/optimization_result.dart';
import '../providers/optimization_provider.dart';
import '../widgets/budget_summary_card.dart';
import '../widgets/optimization_breakdown.dart';
import '../widgets/optimization_strategy_card.dart';
import '../widgets/selected_supplier_card.dart';

class OptimizationResultScreen extends ConsumerWidget {
  final String requestId;

  const OptimizationResultScreen({super.key, this.requestId = 'opt_session_1'});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final state = ref.watch(optimizationProvider);

    if (state.isLoading && !state.isSwitchingStrategy) {
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

    if (state.errorMessage != null && state.result == null) {
      return Scaffold(
        body: AppResponsiveCenter(
          child: AppErrorWidget(
            message: state.errorMessage!,
            onRetry: () => ref.read(optimizationProvider.notifier).refresh(),
          ),
        ),
      );
    }

    final result = state.result!;

    return Scaffold(
      appBar: ProcureAppBarHeader(
        title: 'Purchase Optimization',
        subtitle: 'Your smartest purchasing combination',
        showAiBadge: true,
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw, size: 18),
            onPressed: () => ref.read(optimizationProvider.notifier).refresh(),
          ),
          const SizedBox(width: AppSpacing.xs),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: RefreshIndicator(
                onRefresh: () async =>
                    ref.read(optimizationProvider.notifier).refresh(),
                color: AppColors.primary,
                child: AppResponsiveCenter(
                  child: ListView(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md,
                      vertical: AppSpacing.md,
                    ),
                    children: [
                      // SECTION 1: AI RECOMMENDATION CARD
                      _AiRecommendationCard(
                        result: result,
                        currentStrategy: state.currentStrategy,
                      ),

                      const SizedBox(height: AppSpacing.md),

                      // SECTION 2: OPTIMIZATION STRATEGY SELECTOR
                      OptimizationStrategyCard(
                        currentStrategy: state.currentStrategy,
                        isSwitching: state.isSwitchingStrategy,
                        onStrategySelected: (newStrategy) {
                          ref
                              .read(optimizationProvider.notifier)
                              .switchStrategy(newStrategy);
                        },
                      ),

                      const SizedBox(height: AppSpacing.md),

                      // SECTION 3: BUDGET SUMMARY CARD
                      BudgetSummaryCard(
                        totalBudget: result.totalBudget,
                        totalCost: result.totalCost,
                        remainingBudget: result.remainingBudget,
                        utilizationPercentage: result.budgetUtilization,
                      ),

                      const SizedBox(height: AppSpacing.lg),

                      // SECTION 4: SUPPLIER FULFILLMENT BREAKDOWN
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Supplier Fulfillment Groups',
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            '${result.supplierGroups.length} ${result.supplierGroups.length == 1 ? 'Supplier' : 'Suppliers'}',
                            style: theme.textTheme.labelSmall?.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.sm),

                      if (result.supplierGroups.isEmpty) ...[
                        _buildDefaultSupplierCard(theme, isDark, result),
                      ] else ...[
                        ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: result.supplierGroups.length,
                          separatorBuilder: (_, index) =>
                              const SizedBox(height: AppSpacing.sm),
                          itemBuilder: (context, index) {
                            final group = result.supplierGroups[index];
                            return SelectedSupplierCard(group: group);
                          },
                        ),
                      ],

                      const SizedBox(height: AppSpacing.lg),

                      // SECTION 5: PRODUCT-WISE BREAKDOWN
                      OptimizationBreakdown(items: result.productBreakdown),

                      const SizedBox(height: AppSpacing.lg),

                      // SECTION 6: WHY THIS COMBINATION? (AI EXPLANATION)
                      _AiExplanationCard(explanation: result.aiExplanation),

                      const SizedBox(height: AppSpacing.xl),
                    ],
                  ),
                ),
              ),
            ),

            // SECTION 7: STICKY BOTTOM ACTION FOOTER
            _BottomActionFooter(
              totalCost: result.totalCost,
              onProceedToCart: () => context.push(AppRoutes.cart),
              onBackToSuppliers: () => context.push(AppRoutes.suppliers),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDefaultSupplierCard(
    ThemeData theme,
    bool isDark,
    OptimizationResult result,
  ) {
    return AppCard(
      child: Row(
        children: [
          const Icon(LucideIcons.truck, size: 24, color: AppColors.primary),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Multi-Supplier Fulfillment Active',
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '2 Verified Global Distributors selected for ${result.estimatedDeliveryDays}-day delivery.',
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
    );
  }
}

/// AI Recommendation Header Card
class _AiRecommendationCard extends StatelessWidget {
  final OptimizationResult result;
  final String currentStrategy;

  const _AiRecommendationCard({
    required this.result,
    required this.currentStrategy,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return AppCard(
      hasGradient: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const AppStatusBadge(
                label: 'AI Recommended Purchase',
                status: BadgeStatus.aiRecommended,
                icon: LucideIcons.sparkles,
              ),
              Text(
                'Strategy: ${currentStrategy.toUpperCase()}',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: AppColors.secondary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Optimized Cost',
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: isDark
                          ? AppColors.textSecondaryDark
                          : AppColors.textSecondaryLight,
                    ),
                  ),
                  Text(
                    CurrencyFormatter.formatINR(result.totalCost),
                    style: theme.textTheme.displaySmall?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: isDark
                          ? AppColors.textPrimaryDark
                          : AppColors.textPrimaryLight,
                    ),
                  ),
                ],
              ),
              if (result.savingsAmount != null) ...[
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.secondary,
                    borderRadius: BorderRadius.circular(AppSpacing.radiusFull),
                  ),
                  child: Text(
                    'Save ${CurrencyFormatter.formatINR(result.savingsAmount!)}',
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: AppColors.backgroundDark,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ],
          ),

          const SizedBox(height: AppSpacing.sm),

          Row(
            children: [
              const Icon(
                LucideIcons.clock,
                size: 14,
                color: AppColors.secondary,
              ),
              const SizedBox(width: 4),
              Text(
                'Est. Delivery: ${result.estimatedDeliveryDays} ${result.estimatedDeliveryDays == 1 ? 'day' : 'days'}',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: isDark
                      ? AppColors.textSecondaryDark
                      : AppColors.textSecondaryLight,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// AI Explanation Card ("Why This Combination?")
class _AiExplanationCard extends StatelessWidget {
  final String explanation;

  const _AiExplanationCard({required this.explanation});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                LucideIcons.sparkles,
                size: 18,
                color: AppColors.secondary,
              ),
              const SizedBox(width: AppSpacing.xs),
              Text(
                'Why This Combination?',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            explanation,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: isDark
                  ? AppColors.textSecondaryDark
                  : AppColors.textSecondaryLight,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }
}

/// Sticky Bottom Action Bar
class _BottomActionFooter extends StatelessWidget {
  final double totalCost;
  final VoidCallback onProceedToCart;
  final VoidCallback onBackToSuppliers;

  const _BottomActionFooter({
    required this.totalCost,
    required this.onProceedToCart,
    required this.onBackToSuppliers,
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
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: onBackToSuppliers,
                  child: const Text('Back to Suppliers'),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: AppButton(
                  text: 'Proceed to Cart',
                  variant: AppButtonVariant.primary,
                  leadingIcon: LucideIcons.shoppingBag,
                  onPressed: onProceedToCart,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
