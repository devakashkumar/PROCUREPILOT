import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/app_status_badge.dart';
import '../models/purchase_order.dart';

class OrderHistoryCard extends StatelessWidget {
  final PurchaseOrder order;
  final VoidCallback onTap;

  const OrderHistoryCard({super.key, required this.order, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final itemsCount = order.items.length;
    final suppliersCount = _getUniqueSuppliersCount(order);

    return AppCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: PO Number & Status Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: isDark
                          ? AppColors.surfaceVariantDark
                          : AppColors.surfaceVariantLight,
                      borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                    ),
                    child: const Icon(
                      LucideIcons.shoppingBag,
                      size: 18,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        order.orderNumber,
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        order.storeName,
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: isDark
                              ? AppColors.textSecondaryDark
                              : AppColors.textSecondaryLight,
                          fontSize: 10,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              AppStatusBadge(
                label: order.status,
                status: _getBadgeStatus(order.status),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.sm),
          const Divider(),
          const SizedBox(height: AppSpacing.xs),

          // Date, Items Count, Suppliers Count & Total Amount
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Order Date: ${AppDateFormatter.formatShortDate(order.createdAt ?? DateTime.now())}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: isDark
                          ? AppColors.textSecondaryDark
                          : AppColors.textSecondaryLight,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '$itemsCount ${itemsCount == 1 ? 'item' : 'items'} • $suppliersCount ${suppliersCount == 1 ? 'supplier' : 'suppliers'}',
                    style: theme.textTheme.labelSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),

              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('Total Amount', style: theme.textTheme.labelSmall),
                  Text(
                    CurrencyFormatter.formatINR(order.totalAmount),
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  int _getUniqueSuppliersCount(PurchaseOrder po) {
    final Set<String> supplierNames = {};
    for (final item in po.items) {
      if (item.supplier?.name != null) {
        supplierNames.add(item.supplier!.name);
      }
    }
    return supplierNames.isNotEmpty ? supplierNames.length : 1;
  }

  BadgeStatus _getBadgeStatus(String status) {
    switch (status.toUpperCase()) {
      case 'PAID':
      case 'APPROVED':
      case 'COMPLETED':
        return BadgeStatus.success;
      case 'PENDING':
      case 'PENDING_APPROVAL':
      case 'DRAFT':
        return BadgeStatus.warning;
      case 'REJECTED':
      case 'CANCELLED':
        return BadgeStatus.error;
      default:
        return BadgeStatus.neutral;
    }
  }
}
