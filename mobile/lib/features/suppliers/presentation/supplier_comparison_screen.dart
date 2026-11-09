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
import '../../../shared/widgets/app_empty_state.dart';
import '../../../shared/widgets/app_error_widget.dart';
import '../../../shared/widgets/app_responsive_center.dart';
import '../../../shared/widgets/app_skeleton.dart';
import '../../../shared/widgets/app_status_badge.dart';
import '../providers/supplier_provider.dart';
import '../widgets/supplier_card.dart';
import '../widgets/supplier_comparison_table.dart';
import '../widgets/supplier_filter_chips.dart';

class SupplierComparisonScreen extends ConsumerWidget {
  const SupplierComparisonScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final state = ref.watch(supplierProvider);

    return Scaffold(
      appBar: ProcureAppBarHeader(
        title: 'Compare Suppliers',
        subtitle:
            '${state.suppliers.length} distributors • ${state.offers.length} offers',
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw, size: 18),
            onPressed: () => ref.read(supplierProvider.notifier).refresh(),
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
                    ref.read(supplierProvider.notifier).refresh(),
                color: AppColors.primary,
                child: AppResponsiveCenter(
                  child: ListView(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md,
                      vertical: AppSpacing.md,
                    ),
                    children: [
                      // SECTION 1: PROCUREMENT REQUEST SUMMARY
                      _ProcurementSummaryCard(
                        summaryText: state.requestSummary,
                        totalBudget: state.totalBudget,
                        matchingSuppliersCount: state.suppliers.length,
                      ),

                      const SizedBox(height: AppSpacing.md),

                      // SECTION 2: OPTIMIZATION STRATEGY FILTERS
                      SupplierFilterChips(
                        selectedStrategy: state.selectedStrategy,
                        isOptimizing: state.isOptimizing,
                        onSelectStrategy: (strategy) {
                          ref
                              .read(supplierProvider.notifier)
                              .selectStrategy(strategy);
                        },
                      ),

                      const SizedBox(height: AppSpacing.md),

                      // SECTION 3: COMPARISON MATRIX TABLE
                      if (state.offers.isNotEmpty) ...[
                        SupplierComparisonTable(
                          offers: state.offers,
                          onSelectOffer: (offer) {
                            ref
                                .read(supplierProvider.notifier)
                                .selectOffer(offer);
                          },
                        ),
                        const SizedBox(height: AppSpacing.lg),
                      ],

                      // SECTION 4: PRODUCT-WISE SUPPLIER OFFERS LIST
                      Text(
                        'Available Supplier Offers',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.sm),

                      _buildContent(context, ref, theme, isDark, state),

                      const SizedBox(height: AppSpacing.xl),
                    ],
                  ),
                ),
              ),
            ),

            // SECTION 5: STICKY BUDGET SUMMARY FOOTER
            _StickyBudgetFooter(
              totalSelectedCost: state.totalSelectedCost,
              remainingBudget: state.remainingBudget,
              isOverBudget: state.isOverBudget,
              selectedOffersCount: state.selectedOffers.length,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(
    BuildContext context,
    WidgetRef ref,
    ThemeData theme,
    bool isDark,
    SupplierState state,
  ) {
    if (state.isLoading) {
      return Column(
        children: const [
          AppCardSkeleton(),
          SizedBox(height: AppSpacing.sm),
          AppCardSkeleton(),
        ],
      );
    }

    if (state.errorMessage != null && state.offers.isEmpty) {
      return AppErrorWidget(
        message: state.errorMessage!,
        onRetry: () => ref.read(supplierProvider.notifier).refresh(),
      );
    }

    if (state.offers.isEmpty) {
      return AppEmptyState(
        title: 'No Supplier Offers Available',
        description:
            'No verified distributors matched this procurement request strategy.',
        icon: LucideIcons.truck,
        actionLabel: 'Reset Strategy to Balanced',
        onActionPressed: () {
          ref.read(supplierProvider.notifier).selectStrategy('balanced');
        },
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: state.offers.length,
      separatorBuilder: (_, index) => const SizedBox(height: AppSpacing.sm),
      itemBuilder: (context, index) {
        final offer = state.offers[index];
        final isSelected =
            state.selectedOffers[offer.productId]?.id == offer.id;

        return SupplierCard(
          offer: offer,
          isSelected: isSelected,
          onSelect: () {
            ref.read(supplierProvider.notifier).selectOffer(offer);
          },
        );
      },
    );
  }
}

/// Procurement Request Summary Card
class _ProcurementSummaryCard extends StatelessWidget {
  final String summaryText;
  final double totalBudget;
  final int matchingSuppliersCount;

  const _ProcurementSummaryCard({
    required this.summaryText,
    required this.totalBudget,
    required this.matchingSuppliersCount,
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
                label: 'Procurement Summary',
                status: BadgeStatus.aiRecommended,
                icon: LucideIcons.shoppingCart,
              ),
              Text(
                '$matchingSuppliersCount Distributors',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: AppColors.secondary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            summaryText,
            style: theme.textTheme.titleMedium?.copyWith(
              color: isDark
                  ? AppColors.textPrimaryDark
                  : AppColors.textPrimaryLight,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Target Budget Limit',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: isDark
                      ? AppColors.textSecondaryDark
                      : AppColors.textSecondaryLight,
                ),
              ),
              Text(
                CurrencyFormatter.formatINR(totalBudget),
                style: theme.textTheme.titleSmall?.copyWith(
                  color: AppColors.secondary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Sticky Bottom Summary Card
class _StickyBudgetFooter extends StatelessWidget {
  final double totalSelectedCost;
  final double remainingBudget;
  final bool isOverBudget;
  final int selectedOffersCount;

  const _StickyBudgetFooter({
    required this.totalSelectedCost,
    required this.remainingBudget,
    required this.isOverBudget,
    required this.selectedOffersCount,
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
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Selected Total ($selectedOffersCount ${selectedOffersCount == 1 ? 'item' : 'items'})',
                    style: theme.textTheme.labelSmall,
                  ),
                  Text(
                    totalSelectedCost > 0
                        ? CurrencyFormatter.formatINR(totalSelectedCost)
                        : 'No offers selected',
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: isOverBudget ? AppColors.error : AppColors.primary,
                    ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('Remaining Budget', style: theme.textTheme.labelSmall),
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

          if (isOverBudget) ...[
            const SizedBox(height: 4),
            Row(
              children: const [
                Icon(
                  LucideIcons.alertTriangle,
                  size: 12,
                  color: AppColors.error,
                ),
                SizedBox(width: 4),
                Text(
                  'Selected total exceeds target budget limit.',
                  style: TextStyle(
                    fontSize: 10,
                    color: AppColors.error,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ],

          const SizedBox(height: AppSpacing.sm),

          AppButton(
            text: 'Review Optimized Purchase',
            variant: AppButtonVariant.primary,
            leadingIcon: LucideIcons.shieldCheck,
            onPressed: () {
              context.push(AppRoutes.approvalPath('opt_session_1'));
            },
          ),
        ],
      ),
    );
  }
}
