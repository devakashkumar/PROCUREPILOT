import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/app_status_badge.dart';
import '../../cart/models/cart_item.dart';
import 'order_item_card.dart';

class OrderSupplierGroupCard extends StatelessWidget {
  final String supplierName;
  final List<ProcurementCartItem> items;

  const OrderSupplierGroupCard({
    super.key,
    required this.supplierName,
    required this.items,
  });

  double get _groupSubtotal {
    double total = 0.0;
    for (final item in items) {
      total += item.lineSubtotal;
    }
    return total;
  }

  double get _deliveryFee =>
      items.isNotEmpty ? (items.first.deliveryFee ?? 0.0) : 0.0;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final firstSupplier = items.isNotEmpty ? items.first.supplier : null;

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Supplier Group Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundColor: isDark
                          ? AppColors.primaryContainerDark
                          : AppColors.primaryContainerLight,
                      child: Text(
                        supplierName.isNotEmpty
                            ? supplierName[0].toUpperCase()
                            : 'S',
                        style: const TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Flexible(
                                child: Text(
                                  supplierName,
                                  style: theme.textTheme.titleSmall?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              if (firstSupplier?.isVerified ?? true) ...[
                                const SizedBox(width: 4),
                                const Icon(
                                  LucideIcons.checkCircle,
                                  size: 14,
                                  color: AppColors.primary,
                                ),
                              ],
                            ],
                          ),
                          Text(
                            '${firstSupplier?.location ?? 'Mumbai, MH'} • ${(firstSupplier?.reliabilityScore ?? 4.8).toStringAsFixed(1)} ★',
                            style: theme.textTheme.labelSmall?.copyWith(
                              fontSize: 10,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 4),
              const AppStatusBadge(
                label: 'Fulfillment Partner',
                status: BadgeStatus.neutral,
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.sm),
          const Divider(),
          const SizedBox(height: AppSpacing.xs),

          // Order Items
          ...items.map((item) => OrderItemCard(item: item)),

          const SizedBox(height: AppSpacing.xs),
          const Divider(),
          const SizedBox(height: AppSpacing.xs),

          // Subtotal & Shipping
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Flexible(
                child: Text(
                  'Delivery Fee: ${CurrencyFormatter.formatINR(_deliveryFee)}',
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: isDark
                        ? AppColors.textSecondaryDark
                        : AppColors.textSecondaryLight,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Group Total: ',
                    style: theme.textTheme.labelMedium?.copyWith(
                      color: isDark
                          ? AppColors.textSecondaryDark
                          : AppColors.textSecondaryLight,
                    ),
                  ),
                  Text(
                    CurrencyFormatter.formatINR(_groupSubtotal + _deliveryFee),
                    style: theme.textTheme.titleSmall?.copyWith(
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
}
