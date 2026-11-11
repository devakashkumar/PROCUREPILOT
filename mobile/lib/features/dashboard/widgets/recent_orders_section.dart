import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/router/app_routes.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/app_empty_state.dart';
import '../../../shared/widgets/app_status_badge.dart';

class RecentOrdersSection extends StatelessWidget {
  final List<Map<String, dynamic>> orders;

  const RecentOrdersSection({super.key, required this.orders});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Recent Orders',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            TextButton(
              onPressed: () => context.go(AppRoutes.orders),
              child: Row(
                children: const [
                  Text('View All Orders'),
                  SizedBox(width: 4),
                  Icon(LucideIcons.chevronRight, size: 16),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.xs),

        if (orders.isEmpty) ...[
          const AppCard(
            child: AppEmptyState(
              title: 'No Orders Yet',
              description: 'Your business purchase orders will appear here.',
              icon: LucideIcons.packageOpen,
            ),
          ),
        ] else ...[
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: orders.length > 5 ? 5 : orders.length,
            separatorBuilder: (_, index) =>
                const SizedBox(height: AppSpacing.sm),
            itemBuilder: (context, index) {
              final order = orders[index];
              final orderId = (order['id'] ?? order['_id'] ?? '894$index')
                  .toString();
              final rawStatus = (order['status'] ?? 'DRAFT')
                  .toString()
                  .toUpperCase();
              final rawAmount =
                  (order['totalAmount'] ?? order['amount'] ?? 0.0) as num;
              final itemsCount =
                  (order['itemsCount'] ?? order['products']?.length ?? 1)
                      as num;
              final dateStr = (order['createdAt'] ?? 'Today').toString();

              final badgeConfig = _getBadgeConfig(rawStatus);

              return AppCard(
                onTap: () => context.push(AppRoutes.orderDetailsPath(orderId)),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: isDark
                            ? AppColors.surfaceVariantDark
                            : AppColors.surfaceVariantLight,
                        borderRadius: BorderRadius.circular(
                          AppSpacing.radiusMd,
                        ),
                      ),
                      child: const Icon(
                        LucideIcons.shoppingBag,
                        size: 20,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '#ORD-$orderId',
                                style: theme.textTheme.titleSmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              AppStatusBadge(
                                label: badgeConfig.label,
                                status: badgeConfig.status,
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '$itemsCount ${itemsCount == 1 ? 'item' : 'items'} • $dateStr',
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: isDark
                                      ? AppColors.textSecondaryDark
                                      : AppColors.textSecondaryLight,
                                ),
                              ),
                              Text(
                                CurrencyFormatter.formatINR(
                                  rawAmount.toDouble(),
                                ),
                                style: theme.textTheme.titleSmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.primary,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ],
    );
  }

  _OrderStatusBadgeConfig _getBadgeConfig(String rawStatus) {
    switch (rawStatus) {
      case 'PAID':
      case 'APPROVED':
      case 'COMPLETED':
        return const _OrderStatusBadgeConfig(
          label: 'PAID',
          status: BadgeStatus.success,
        );
      case 'PENDING':
      case 'PENDING_APPROVAL':
        return const _OrderStatusBadgeConfig(
          label: 'PENDING',
          status: BadgeStatus.warning,
        );
      case 'DELIVERED':
      case 'SHIPPED':
        return const _OrderStatusBadgeConfig(
          label: 'IN TRANSIT',
          status: BadgeStatus.info,
        );
      default:
        return const _OrderStatusBadgeConfig(
          label: 'DRAFT',
          status: BadgeStatus.neutral,
        );
    }
  }
}

class _OrderStatusBadgeConfig {
  final String label;
  final BadgeStatus status;

  const _OrderStatusBadgeConfig({required this.label, required this.status});
}
