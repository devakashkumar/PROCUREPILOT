import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/app_status_badge.dart';
import '../models/optimization_result.dart';

class SelectedSupplierCard extends StatelessWidget {
  final SupplierGroup group;

  const SelectedSupplierCard({super.key, required this.group});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final supplier = group.supplier;

    return AppCard(
      child: ExpansionTile(
        tilePadding: EdgeInsets.zero,
        childrenPadding: EdgeInsets.zero,
        initiallyExpanded: true,
        leading: CircleAvatar(
          radius: 18,
          backgroundColor: isDark
              ? AppColors.primaryContainerDark
              : AppColors.primaryContainerLight,
          child: Text(
            supplier.name.isNotEmpty ? supplier.name[0].toUpperCase() : 'S',
            style: const TextStyle(
              color: AppColors.primary,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        title: Row(
          children: [
            Flexible(
              child: Text(
                supplier.name,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            if (supplier.isVerified) ...[
              const SizedBox(width: 4),
              const Icon(
                LucideIcons.checkCircle,
                size: 14,
                color: AppColors.primary,
              ),
            ],
          ],
        ),
        subtitle: Row(
          children: [
            Text(
              '${group.items.length} ${group.items.length == 1 ? 'item' : 'items'} • ETA ${group.deliveryDays} ${group.deliveryDays == 1 ? 'day' : 'days'}',
              style: theme.textTheme.labelSmall,
            ),
            const SizedBox(width: 8),
            const Icon(LucideIcons.star, size: 12, color: AppColors.warning),
            const SizedBox(width: 2),
            Text(
              supplier.reliabilityScore.toStringAsFixed(1),
              style: theme.textTheme.labelSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              CurrencyFormatter.formatINR(group.groupTotal),
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
            const AppStatusBadge(
              label: 'Selected',
              status: BadgeStatus.success,
            ),
          ],
        ),
        children: [
          const Divider(),
          const SizedBox(height: AppSpacing.xs),

          // Supplied Line Items
          ...group.items.map(
            (item) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      '• ${item.productName} (${item.quantity} ${item.unit})',
                      style: theme.textTheme.bodySmall,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Text(
                    CurrencyFormatter.formatINR(item.lineTotal),
                    style: theme.textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: AppSpacing.xs),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Delivery Fee: ${CurrencyFormatter.formatINR(group.deliveryFee)}',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: isDark
                      ? AppColors.textSecondaryDark
                      : AppColors.textSecondaryLight,
                ),
              ),
              Text(
                'Subtotal: ${CurrencyFormatter.formatINR(group.subtotal)}',
                style: theme.textTheme.labelSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.xs),
        ],
      ),
    );
  }
}
