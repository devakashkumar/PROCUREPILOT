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
import '../../../shared/widgets/app_empty_state.dart';
import '../../../shared/widgets/app_responsive_center.dart';
import '../../../shared/widgets/app_status_badge.dart';
import '../providers/cart_provider.dart';
import '../widgets/cart_summary_card.dart';
import '../widgets/supplier_group_card.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  void _showClearCartConfirmation(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Clear Cart?'),
        content: const Text(
          'Are you sure you want to remove all items from your procurement cart?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              ref.read(cartProvider.notifier).clearCart();
              Navigator.pop(dialogContext);
            },
            child: const Text(
              'Clear All',
              style: TextStyle(color: AppColors.error),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartState = ref.watch(cartProvider);

    final groupedSuppliers = cartState.groupedBySupplier;

    return Scaffold(
      appBar: ProcureAppBarHeader(
        title: 'Procurement Cart',
        subtitle:
            '${cartState.uniqueItemsCount} items • ${groupedSuppliers.length} supplier groups',
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.trash2, size: 18),
            tooltip: 'Clear Cart',
            onPressed: cartState.items.isEmpty
                ? null
                : () => _showClearCartConfirmation(context, ref),
          ),
          const SizedBox(width: AppSpacing.xs),
        ],
      ),
      body: SafeArea(
        child: cartState.items.isEmpty
            ? AppResponsiveCenter(
                child: AppEmptyState(
                  title: 'Your procurement cart is empty.',
                  description:
                      'Find products and let ProcurePilot build the smartest purchasing combination.',
                  icon: LucideIcons.shoppingBag,
                  actionLabel: 'Start Procurement',
                  onActionPressed: () => context.go(AppRoutes.procurement),
                ),
              )
            : Column(
                children: [
                  Expanded(
                    child: AppResponsiveCenter(
                      child: ListView(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.md,
                          vertical: AppSpacing.md,
                        ),
                        children: [
                          // SECTION 1: SUPPLIER GROUPS & CART ITEMS
                          ...groupedSuppliers.entries.map((entry) {
                            return Padding(
                              padding: const EdgeInsets.only(
                                bottom: AppSpacing.md,
                              ),
                              child: SupplierGroupCard(
                                supplierName: entry.key,
                                items: entry.value,
                                onQuantityChanged: (item) {
                                  ref
                                      .read(cartProvider.notifier)
                                      .addOrUpdateItem(
                                        item.product,
                                        item.quantity,
                                      );
                                },
                                onItemRemoved: (item) {
                                  ref
                                      .read(cartProvider.notifier)
                                      .removeItem(item.product.id);
                                },
                              ),
                            );
                          }),

                          // SECTION 2: BUDGET & FINANCIAL SUMMARY CARD
                          CartSummaryCard(
                            totalBudget: cartState.totalBudget,
                            productSubtotal: cartState.totalProductSubtotal,
                            deliveryFees: cartState.totalDeliveryFees,
                            estimatedTotal: cartState.estimatedTotalCost,
                            remainingBudget: cartState.remainingBudget,
                            isOverBudget: cartState.isOverBudget,
                            isOptimizationValid: cartState.isOptimizationValid,
                            onReoptimize: () {
                              ref
                                  .read(cartProvider.notifier)
                                  .markOptimizationValid(true);
                              context.push(
                                AppRoutes.approvalPath('opt_session_1'),
                              );
                            },
                          ),

                          const SizedBox(height: AppSpacing.xl),
                        ],
                      ),
                    ),
                  ),

                  // SECTION 3: STICKY BOTTOM ACTION FOOTER
                  _StickyCartFooter(
                    estimatedTotal: cartState.estimatedTotalCost,
                    isOverBudget: cartState.isOverBudget,
                    onContinueToPurchaseOrder: () {
                      context.push(AppRoutes.orderDetailsPath('review_po_1'));
                    },
                  ),
                ],
              ),
      ),
    );
  }
}

/// Sticky Bottom Action Bar
class _StickyCartFooter extends StatelessWidget {
  final double estimatedTotal;
  final bool isOverBudget;
  final VoidCallback onContinueToPurchaseOrder;

  const _StickyCartFooter({
    required this.estimatedTotal,
    required this.isOverBudget,
    required this.onContinueToPurchaseOrder,
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
                    'Estimated Total Cost',
                    style: theme.textTheme.labelSmall,
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
              const AppStatusBadge(
                label: 'Subject to PO Review',
                status: BadgeStatus.neutral,
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.sm),

          AppButton(
            text: 'Continue to Purchase Order',
            variant: AppButtonVariant.primary,
            leadingIcon: LucideIcons.fileCheck,
            onPressed: onContinueToPurchaseOrder,
          ),
        ],
      ),
    );
  }
}
