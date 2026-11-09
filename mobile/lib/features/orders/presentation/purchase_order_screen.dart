import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/router/app_routes.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../providers/auth_provider.dart';
import '../../../shared/components/app_bar_header.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/app_empty_state.dart';
import '../../../shared/widgets/app_responsive_center.dart';
import '../../../shared/widgets/app_status_badge.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../cart/providers/cart_provider.dart';
import '../providers/order_provider.dart';
import '../widgets/order_summary_card.dart';
import '../widgets/order_supplier_group.dart';

class PurchaseOrderScreen extends ConsumerStatefulWidget {
  const PurchaseOrderScreen({super.key});

  @override
  ConsumerState<PurchaseOrderScreen> createState() =>
      _PurchaseOrderScreenState();
}

class _PurchaseOrderScreenState extends ConsumerState<PurchaseOrderScreen> {
  late TextEditingController _notesController;

  @override
  void initState() {
    super.initState();
    _notesController = TextEditingController();
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _handleCreateOrder(String storeName) async {
    final cartState = ref.read(cartProvider);
    final orderNotifier = ref.read(orderProvider.notifier);

    orderNotifier.setNotes(_notesController.text);

    final orderId = await orderNotifier.createPurchaseOrder(
      cartState: cartState,
      storeName: storeName,
    );

    if (orderId != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Purchase Order generated successfully!'),
          backgroundColor: AppColors.success,
        ),
      );
      context.go(AppRoutes.approvalPath(orderId));
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final cartState = ref.watch(cartProvider);
    final orderState = ref.watch(orderProvider);
    final authState = ref.watch(authStateProvider);

    final user = authState.user;
    final storeName = (user?.storeName != null && user!.storeName!.isNotEmpty)
        ? user.storeName!
        : 'Sharma Kirana Store';

    final groupedSuppliers = cartState.groupedBySupplier;

    return Scaffold(
      appBar: ProcureAppBarHeader(
        title: 'Purchase Order',
        subtitle: 'Review your procurement before submission',
      ),
      body: SafeArea(
        child: cartState.items.isEmpty && orderState.createdOrder == null
            ? AppResponsiveCenter(
                child: AppEmptyState(
                  title: 'No Cart Selection for PO',
                  description:
                      'Select products or accept an AI optimization to generate a purchase order.',
                  icon: LucideIcons.fileText,
                  actionLabel: 'Go to Product Discovery',
                  onActionPressed: () => context.go(AppRoutes.products),
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
                          // Inline Error Alert
                          if (orderState.errorMessage != null) ...[
                            Container(
                              padding: const EdgeInsets.all(AppSpacing.md),
                              margin: const EdgeInsets.only(
                                bottom: AppSpacing.md,
                              ),
                              decoration: BoxDecoration(
                                color: isDark
                                    ? AppColors.errorBgDark
                                    : AppColors.errorBgLight,
                                borderRadius: BorderRadius.circular(
                                  AppSpacing.radiusMd,
                                ),
                                border: Border.all(
                                  color: AppColors.error.withValues(alpha: 0.3),
                                ),
                              ),
                              child: Row(
                                children: [
                                  const Icon(
                                    LucideIcons.alertTriangle,
                                    color: AppColors.error,
                                    size: 18,
                                  ),
                                  const SizedBox(width: AppSpacing.sm),
                                  Expanded(
                                    child: Text(
                                      orderState.errorMessage!,
                                      style: theme.textTheme.bodySmall
                                          ?.copyWith(
                                            color: AppColors.error,
                                            fontWeight: FontWeight.w600,
                                          ),
                                    ),
                                  ),
                                  IconButton(
                                    icon: const Icon(
                                      LucideIcons.x,
                                      size: 16,
                                      color: AppColors.error,
                                    ),
                                    onPressed: () => ref
                                        .read(orderProvider.notifier)
                                        .clearError(),
                                  ),
                                ],
                              ),
                            ),
                          ],

                          // SECTION 1: ORDER INFO HEADER CARD
                          AppCard(
                            hasGradient: true,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      orderState.createdOrder != null
                                          ? orderState.createdOrder!.orderNumber
                                          : 'PO-DRAFT (Review)',
                                      style: theme.textTheme.titleMedium
                                          ?.copyWith(
                                            color: isDark
                                                ? AppColors.textPrimaryDark
                                                : AppColors.textPrimaryLight,
                                            fontWeight: FontWeight.bold,
                                          ),
                                    ),
                                    AppStatusBadge(
                                      label: orderState.createdOrder != null
                                          ? orderState.createdOrder!.status
                                          : 'DRAFT REVIEW',
                                      status: orderState.createdOrder != null
                                          ? BadgeStatus.info
                                          : BadgeStatus.neutral,
                                    ),
                                  ],
                                ),
                                const SizedBox(height: AppSpacing.xs),
                                Text(
                                  storeName,
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.secondary,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'Date: ${AppDateFormatter.formatShortDate(DateTime.now())} • ${cartState.uniqueItemsCount} items • ${groupedSuppliers.length} supplier groups',
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: isDark
                                        ? AppColors.textSecondaryDark
                                        : AppColors.textSecondaryLight,
                                  ),
                                ),
                              ],
                            ),
                          ),

                          const SizedBox(height: AppSpacing.md),

                          // SECTION 2: SUPPLIER FULFILLMENT GROUPS
                          ...groupedSuppliers.entries.map((entry) {
                            return Padding(
                              padding: const EdgeInsets.only(
                                bottom: AppSpacing.md,
                              ),
                              child: OrderSupplierGroupCard(
                                supplierName: entry.key,
                                items: entry.value,
                              ),
                            );
                          }),

                          // SECTION 3: DELIVERY NOTES / BUSINESS INSTRUCTIONS
                          AppCard(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    const Icon(
                                      LucideIcons.fileText,
                                      size: 18,
                                      color: AppColors.primary,
                                    ),
                                    const SizedBox(width: AppSpacing.xs),
                                    Text(
                                      'Delivery Notes & Special Instructions',
                                      style: theme.textTheme.titleSmall
                                          ?.copyWith(
                                            fontWeight: FontWeight.bold,
                                          ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: AppSpacing.sm),
                                AppTextField(
                                  hint:
                                      'e.g., Please deliver before 11 AM at back entrance.',
                                  controller: _notesController,
                                  maxLines: 2,
                                  enabled: !orderState.isSubmitting,
                                ),
                              ],
                            ),
                          ),

                          const SizedBox(height: AppSpacing.md),

                          // SECTION 4: FINANCIAL ORDER SUMMARY
                          OrderSummaryCard(
                            productSubtotal: cartState.totalProductSubtotal,
                            deliveryFees: cartState.totalDeliveryFees,
                            totalAmount: cartState.estimatedTotalCost,
                            targetBudget: cartState.totalBudget,
                          ),

                          const SizedBox(height: AppSpacing.md),

                          // SECTION 5: ACKNOWLEDGMENT REVIEW CHECKBOX
                          AppCard(
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: Checkbox(
                                    value: orderState.isConfirmed,
                                    activeColor: AppColors.primary,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    onChanged: orderState.isSubmitting
                                        ? null
                                        : (val) {
                                            ref
                                                .read(orderProvider.notifier)
                                                .setConfirmed(val ?? false);
                                          },
                                  ),
                                ),
                                const SizedBox(width: AppSpacing.xs),
                                Expanded(
                                  child: GestureDetector(
                                    onTap: orderState.isSubmitting
                                        ? null
                                        : () {
                                            ref
                                                .read(orderProvider.notifier)
                                                .setConfirmed(
                                                  !orderState.isConfirmed,
                                                );
                                          },
                                    child: Text(
                                      'I have reviewed the products, quantities, suppliers and estimated order amount for my Kirana store.',
                                      style: theme.textTheme.bodySmall
                                          ?.copyWith(
                                            color: isDark
                                                ? AppColors.textPrimaryDark
                                                : AppColors.textPrimaryLight,
                                            fontWeight: FontWeight.w500,
                                          ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),

                          const SizedBox(height: AppSpacing.xl),
                        ],
                      ),
                    ),
                  ),

                  // SECTION 6: STICKY BOTTOM ACTION FOOTER
                  _StickyPOFooter(
                    estimatedTotal: cartState.estimatedTotalCost,
                    isConfirmed: orderState.isConfirmed,
                    isSubmitting: orderState.isSubmitting,
                    onCreateOrder: () => _handleCreateOrder(storeName),
                  ),
                ],
              ),
      ),
    );
  }
}

/// Sticky Bottom Action Bar
class _StickyPOFooter extends StatelessWidget {
  final double estimatedTotal;
  final bool isConfirmed;
  final bool isSubmitting;
  final VoidCallback onCreateOrder;

  const _StickyPOFooter({
    required this.estimatedTotal,
    required this.isConfirmed,
    required this.isSubmitting,
    required this.onCreateOrder,
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
                  Text('Order Total Amount', style: theme.textTheme.labelSmall),
                  Text(
                    CurrencyFormatter.formatINR(estimatedTotal),
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
              const AppStatusBadge(
                label: 'Order Creation',
                status: BadgeStatus.neutral,
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.sm),

          AppButton(
            text: 'Create Purchase Order',
            variant: AppButtonVariant.primary,
            isLoading: isSubmitting,
            leadingIcon: LucideIcons.fileCheck,
            onPressed: isConfirmed && !isSubmitting ? onCreateOrder : null,
          ),
        ],
      ),
    );
  }
}
