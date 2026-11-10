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
import '../../../shared/widgets/app_responsive_center.dart';
import '../../../shared/widgets/app_status_badge.dart';
import '../../cart/models/cart_item.dart';
import '../../products/models/product.dart';
import '../../suppliers/models/supplier.dart';
import '../models/purchase_order.dart';
import '../providers/order_provider.dart';
import '../widgets/approval_checklist.dart';
import '../widgets/approval_summary_card.dart';
import '../widgets/order_status_timeline.dart';
import '../widgets/order_supplier_group.dart';

class OrderApprovalScreen extends ConsumerStatefulWidget {
  final String orderId;

  const OrderApprovalScreen({super.key, this.orderId = 'po_89420'});

  @override
  ConsumerState<OrderApprovalScreen> createState() =>
      _OrderApprovalScreenState();
}

class _OrderApprovalScreenState extends ConsumerState<OrderApprovalScreen> {
  final TextEditingController _rejectionReasonController =
      TextEditingController();

  @override
  void dispose() {
    _rejectionReasonController.dispose();
    super.dispose();
  }

  Future<void> _handleApprove() async {
    final notifier = ref.read(orderProvider.notifier);
    final success = await notifier.approveOrder(widget.orderId);

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Purchase Order approved successfully!'),
          backgroundColor: AppColors.success,
        ),
      );
    }
  }

  Future<void> _handleReject() async {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Reject Purchase Order?'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Are you sure you want to reject this order? This action may be irreversible.',
            ),
            const SizedBox(height: AppSpacing.md),
            TextField(
              controller: _rejectionReasonController,
              decoration: const InputDecoration(
                hintText: 'Reason for rejection (optional)',
              ),
              maxLines: 2,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(dialogContext);
              final reason = _rejectionReasonController.text;
              final success = await ref
                  .read(orderProvider.notifier)
                  .rejectOrder(widget.orderId, reason: reason);

              if (success && mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Purchase Order has been rejected.'),
                    backgroundColor: AppColors.error,
                  ),
                );
              }
            },
            child: const Text(
              'Confirm Reject',
              style: TextStyle(color: AppColors.error),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final orderState = ref.watch(orderProvider);

    // Fallback Purchase Order data if createdOrder is loading
    final PurchaseOrder order =
        orderState.createdOrder ??
        PurchaseOrder(
          id: widget.orderId,
          orderNumber: 'PO-89420',
          storeName: 'Global Retail Mart',
          status: 'PENDING_APPROVAL',
          items: const [
            ProcurementCartItem(
              product: Product(
                id: 'prod_1',
                name: 'Basmati Rice 50kg',
                brand: 'Apex Harvest',
                category: 'Grocery',
                unit: '50 kg Bag',
                description: 'Rice',
              ),
              quantity: 2,
              supplier: Supplier(
                id: 'sup_10',
                name: 'Apex Wholesale Traders',
                location: 'New York, NY',
                reliabilityScore: 4.9,
                rating: 4.8,
              ),
              unitPrice: 45.0,
              deliveryFee: 5.0,
            ),
          ],
          subtotal: 4500.0,
          deliveryFees: 100.0,
          totalAmount: 4600.0,
          createdAt: DateTime.now(),
        );

    final groupedSuppliers = _groupItemsBySupplier(order.items);
    final isApproved = order.status == 'APPROVED';
    final isRejected = order.status == 'REJECTED';

    return Scaffold(
      appBar: ProcureAppBarHeader(
        title: 'Review & Approve Order',
        subtitle: 'Your confirmation is required before payment',
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw, size: 18),
            onPressed: () => ref.read(orderProvider.notifier).clearError(),
          ),
          const SizedBox(width: AppSpacing.xs),
        ],
      ),
      body: SafeArea(
        child: Column(
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
                        margin: const EdgeInsets.only(bottom: AppSpacing.md),
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
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: AppColors.error,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    // SECTION 1: ORDER APPROVAL LIFECYCLE TIMELINE
                    OrderStatusTimeline(status: order.status),

                    const SizedBox(height: AppSpacing.md),

                    // SECTION 2: APPROVAL SUCCESS BANNER (IF APPROVED)
                    if (isApproved) ...[
                      AppCard(
                        backgroundColor: isDark
                            ? AppColors.successBgDark
                            : AppColors.successBgLight,
                        child: Row(
                          children: [
                            const Icon(
                              LucideIcons.checkCircle2,
                              color: AppColors.success,
                              size: 28,
                            ),
                            const SizedBox(width: AppSpacing.md),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Purchase Order Approved ✓',
                                    style: theme.textTheme.titleMedium
                                        ?.copyWith(
                                          color: isDark
                                              ? AppColors.secondary
                                              : AppColors.success,
                                          fontWeight: FontWeight.bold,
                                        ),
                                  ),
                                  Text(
                                    'Order #${order.orderNumber} is validated and ready for payment checkout.',
                                    style: theme.textTheme.bodySmall,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: AppSpacing.md),
                    ],

                    // SECTION 3: REJECTION BANNER (IF REJECTED)
                    if (isRejected) ...[
                      AppCard(
                        backgroundColor: isDark
                            ? AppColors.errorBgDark
                            : AppColors.errorBgLight,
                        child: Row(
                          children: [
                            const Icon(
                              LucideIcons.alertOctagon,
                              color: AppColors.error,
                              size: 28,
                            ),
                            const SizedBox(width: AppSpacing.md),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Purchase Order Rejected',
                                    style: theme.textTheme.titleMedium
                                        ?.copyWith(
                                          color: AppColors.error,
                                          fontWeight: FontWeight.bold,
                                        ),
                                  ),
                                  Text(
                                    'This purchase order was rejected by the business owner.',
                                    style: theme.textTheme.bodySmall,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: AppSpacing.md),
                    ],

                    // SECTION 4: APPROVAL FINANCIAL SUMMARY
                    ApprovalSummaryCard(order: order),

                    const SizedBox(height: AppSpacing.md),

                    // SECTION 5: SUPPLIER FULFILLMENT GROUPS
                    Text(
                      'Distributor Fulfillment Groups',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    ...groupedSuppliers.entries.map((entry) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: AppSpacing.md),
                        child: OrderSupplierGroupCard(
                          supplierName: entry.key,
                          items: entry.value,
                        ),
                      );
                    }),

                    // SECTION 6: MANDATORY APPROVAL CHECKLIST
                    if (!isApproved && !isRejected) ...[
                      ApprovalChecklist(
                        check1: orderState.checkItem1,
                        check2: orderState.checkItem2,
                        check3: orderState.checkItem3,
                        check4: orderState.checkItem4,
                        enabled:
                            !orderState.isApproving && !orderState.isRejecting,
                        onItemChanged: (index, val) {
                          ref
                              .read(orderProvider.notifier)
                              .setCheckItem(index, val);
                        },
                      ),
                      const SizedBox(height: AppSpacing.xl),
                    ],
                  ],
                ),
              ),
            ),

            // SECTION 7: STICKY FOOTER ACTIONS
            _StickyApprovalFooter(
              order: order,
              isApproved: isApproved,
              isRejected: isRejected,
              isAllChecklistApproved: orderState.isAllChecklistApproved,
              isApproving: orderState.isApproving,
              isRejecting: orderState.isRejecting,
              onApprove: _handleApprove,
              onReject: _handleReject,
              onContinueToPayment: () {
                context.push(AppRoutes.paymentStatusPath(order.id));
              },
            ),
          ],
        ),
      ),
    );
  }

  Map<String, List<ProcurementCartItem>> _groupItemsBySupplier(
    List<ProcurementCartItem> items,
  ) {
    final Map<String, List<ProcurementCartItem>> map = {};
    for (final item in items) {
      final name = item.supplier?.name ?? 'Apex Wholesale Traders';
      if (!map.containsKey(name)) {
        map[name] = [];
      }
      map[name]!.add(item);
    }
    return map;
  }
}

/// Sticky Bottom Approval Action Bar
class _StickyApprovalFooter extends StatelessWidget {
  final PurchaseOrder order;
  final bool isApproved;
  final bool isRejected;
  final bool isAllChecklistApproved;
  final bool isApproving;
  final bool isRejecting;
  final VoidCallback onApprove;
  final VoidCallback onReject;
  final VoidCallback onContinueToPayment;

  const _StickyApprovalFooter({
    required this.order,
    required this.isApproved,
    required this.isRejected,
    required this.isAllChecklistApproved,
    required this.isApproving,
    required this.isRejecting,
    required this.onApprove,
    required this.onReject,
    required this.onContinueToPayment,
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
                  Text('PO Approved Total', style: theme.textTheme.labelSmall),
                  Text(
                    CurrencyFormatter.formatINR(order.totalAmount),
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
              AppStatusBadge(
                label: order.status,
                status: isApproved ? BadgeStatus.success : BadgeStatus.warning,
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.sm),

          if (isApproved) ...[
            AppButton(
              text: 'Continue to Payment',
              variant: AppButtonVariant.primary,
              leadingIcon: LucideIcons.creditCard,
              onPressed: onContinueToPayment,
            ),
          ] else if (isRejected) ...[
            AppButton(
              text: 'Order Rejected',
              variant: AppButtonVariant.outline,
              onPressed: null,
            ),
          ] else ...[
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: isRejecting || isApproving ? null : onReject,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.error,
                      side: const BorderSide(color: AppColors.error),
                    ),
                    child: isRejecting
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                AppColors.error,
                              ),
                            ),
                          )
                        : const Text('Reject Order'),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: AppButton(
                    text: 'Approve Purchase Order',
                    variant: AppButtonVariant.primary,
                    isLoading: isApproving,
                    leadingIcon: LucideIcons.shieldCheck,
                    onPressed: isAllChecklistApproved && !isApproving
                        ? onApprove
                        : null,
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
