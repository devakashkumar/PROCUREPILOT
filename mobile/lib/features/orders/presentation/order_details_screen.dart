import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/router/app_routes.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/utils/date_formatter.dart';
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
import '../widgets/order_supplier_group.dart';
import '../widgets/order_timeline.dart';

class OrderDetailsScreen extends ConsumerStatefulWidget {
  final String orderId;

  const OrderDetailsScreen({super.key, this.orderId = 'po_89420'});

  @override
  ConsumerState<OrderDetailsScreen> createState() => _OrderDetailsScreenState();
}

class _OrderDetailsScreenState extends ConsumerState<OrderDetailsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(orderProvider.notifier).fetchOrderDetails(widget.orderId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final orderState = ref.watch(orderProvider);

    final PurchaseOrder order =
        orderState.selectedOrderDetails ??
        orderState.createdOrder ??
        PurchaseOrder(
          id: widget.orderId,
          orderNumber: 'PO-89420',
          storeName: 'Sharma Kirana Store',
          status: 'PENDING_APPROVAL',
          items: const [
            ProcurementCartItem(
              product: Product(
                id: 'prod_1',
                name: 'Basmati Rice 50kg',
                brand: 'India Gate',
                category: 'Grocery',
                unit: '50 kg Bag',
                description: 'Rice',
              ),
              quantity: 2,
              supplier: Supplier(
                id: 'sup_10',
                name: 'Apex Wholesale Traders',
                location: 'Mumbai, MH',
                reliabilityScore: 4.9,
                rating: 4.8,
              ),
              unitPrice: 2250.0,
              deliveryFee: 100.0,
            ),
          ],
          subtotal: 4500.0,
          deliveryFees: 100.0,
          totalAmount: 4600.0,
          createdAt: DateTime.now(),
        );

    final groupedSuppliers = _groupItemsBySupplier(order.items);
    final isApproved = order.status == 'APPROVED';
    final isPendingApproval =
        order.status == 'PENDING_APPROVAL' || order.status == 'DRAFT';
    final isPaid = order.status == 'PAID';

    return Scaffold(
      appBar: ProcureAppBarHeader(
        title: 'Order ${order.orderNumber}',
        subtitle: 'Order Breakdown & Tracking',
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw, size: 18),
            onPressed: () {
              ref
                  .read(orderProvider.notifier)
                  .fetchOrderDetails(widget.orderId);
            },
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
                  padding: const EdgeInsets.all(AppSpacing.md),
                  children: [
                    // SECTION A: ORDER OVERVIEW CARD
                    AppCard(
                      hasGradient: true,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                order.orderNumber,
                                style: theme.textTheme.titleMedium?.copyWith(
                                  color: isDark
                                      ? AppColors.textPrimaryDark
                                      : AppColors.textPrimaryLight,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              AppStatusBadge(
                                label: order.status,
                                status: isPaid
                                    ? BadgeStatus.success
                                    : isApproved
                                    ? BadgeStatus.success
                                    : BadgeStatus.warning,
                              ),
                            ],
                          ),
                          const SizedBox(height: AppSpacing.xs),
                          Text(
                            order.storeName,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: AppColors.secondary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Created: ${AppDateFormatter.formatShortDate(order.createdAt ?? DateTime.now())}',
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: isDark
                                      ? AppColors.textSecondaryDark
                                      : AppColors.textSecondaryLight,
                                ),
                              ),
                              Text(
                                CurrencyFormatter.formatINR(order.totalAmount),
                                style: theme.textTheme.titleLarge?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: isDark
                                      ? AppColors.textPrimaryDark
                                      : AppColors.textPrimaryLight,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: AppSpacing.md),

                    // SECTION B: ORDER LIFECYCLE TIMELINE
                    OrderTimelineWidget(order: order),

                    const SizedBox(height: AppSpacing.md),

                    // SECTION C: SUPPLIER FULFILLMENT GROUPS
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

                    // SECTION D: PAYMENT INFORMATION CARD
                    AppCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(
                                LucideIcons.creditCard,
                                size: 18,
                                color: AppColors.primary,
                              ),
                              const SizedBox(width: AppSpacing.xs),
                              Text(
                                'Payment & Settlement Info',
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: AppSpacing.sm),
                          const Divider(),
                          const SizedBox(height: AppSpacing.xs),

                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Payment Status',
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: isDark
                                      ? AppColors.textSecondaryDark
                                      : AppColors.textSecondaryLight,
                                ),
                              ),
                              AppStatusBadge(
                                label: isPaid ? 'PAID' : 'PAYMENT PENDING',
                                status: isPaid
                                    ? BadgeStatus.success
                                    : BadgeStatus.warning,
                              ),
                            ],
                          ),
                          if (order.paymentId != null) ...[
                            const SizedBox(height: AppSpacing.xs),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Payment Reference ID',
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    color: isDark
                                        ? AppColors.textSecondaryDark
                                        : AppColors.textSecondaryLight,
                                  ),
                                ),
                                Text(
                                  order.paymentId!,
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ],
                            ),
                          ],

                          if (isApproved || isPaid) ...[
                            const SizedBox(height: AppSpacing.md),
                            AppButton(
                              text: 'View Payment Details',
                              variant: AppButtonVariant.outline,
                              leadingIcon: LucideIcons.externalLink,
                              onPressed: () {
                                context.push(
                                  AppRoutes.paymentStatusPath(
                                    order.paymentId ?? order.id,
                                  ),
                                );
                              },
                            ),
                          ],
                        ],
                      ),
                    ),

                    const SizedBox(height: AppSpacing.xl),
                  ],
                ),
              ),
            ),

            // STICKY BOTTOM ACTION FOOTER
            if (isPendingApproval) ...[
              _StickyActionFooter(
                buttonText: 'Review & Approve Order',
                icon: LucideIcons.shieldCheck,
                onPressed: () => context.push(AppRoutes.approvalPath(order.id)),
              ),
            ] else if (isApproved && !isPaid) ...[
              _StickyActionFooter(
                buttonText: 'Proceed to Payment',
                icon: LucideIcons.creditCard,
                onPressed: () =>
                    context.push(AppRoutes.paymentStatusPath(order.id)),
              ),
            ],
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

class _StickyActionFooter extends StatelessWidget {
  final String buttonText;
  final IconData icon;
  final VoidCallback onPressed;

  const _StickyActionFooter({
    required this.buttonText,
    required this.icon,
    required this.onPressed,
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
      ),
      child: AppButton(
        text: buttonText,
        variant: AppButtonVariant.primary,
        leadingIcon: icon,
        onPressed: onPressed,
      ),
    );
  }
}
