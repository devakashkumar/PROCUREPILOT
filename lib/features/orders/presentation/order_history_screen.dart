import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/router/app_routes.dart';
import '../../../shared/components/app_bar_header.dart';
import '../../../shared/widgets/app_empty_state.dart';
import '../../../shared/widgets/app_error_widget.dart';
import '../../../shared/widgets/app_responsive_center.dart';
import '../../../shared/widgets/app_skeleton.dart';
import '../providers/order_provider.dart';
import '../widgets/order_history_card.dart';
import '../widgets/order_status_filter.dart';

class OrderHistoryScreen extends ConsumerWidget {
  const OrderHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final state = ref.watch(orderProvider);

    return Scaffold(
      appBar: ProcureAppBarHeader(
        title: 'My Orders',
        subtitle: 'Track purchases, approvals and shipments',
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw, size: 18),
            onPressed: () => ref
                .read(orderProvider.notifier)
                .loadOrderHistory(isRefresh: true),
          ),
          const SizedBox(width: AppSpacing.xs),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => ref
              .read(orderProvider.notifier)
              .loadOrderHistory(isRefresh: true),
          color: AppColors.primary,
          child: AppResponsiveCenter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: AppSpacing.sm),

                // Search Input Field
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                  ),
                  child: Container(
                    decoration: BoxDecoration(
                      color: isDark
                          ? AppColors.surfaceDark
                          : AppColors.surfaceLight,
                      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                      border: Border.all(
                        color: isDark
                            ? AppColors.borderDark
                            : AppColors.borderLight,
                      ),
                    ),
                    child: TextField(
                      onChanged: (query) {
                        ref.read(orderProvider.notifier).searchOrders(query);
                      },
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: isDark
                            ? AppColors.textPrimaryDark
                            : AppColors.textPrimaryLight,
                      ),
                      decoration: InputDecoration(
                        hintText: 'Search order number or product…',
                        hintStyle: theme.textTheme.bodyMedium?.copyWith(
                          color: isDark
                              ? AppColors.textMutedDark
                              : AppColors.textMutedLight,
                        ),
                        prefixIcon: const Icon(LucideIcons.search, size: 18),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 10,
                        ),
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: AppSpacing.sm),

                // Order Status Filter Chips Bar
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                  ),
                  child: OrderStatusFilter(
                    selectedStatus: state.selectedStatusFilter,
                    onSelectStatus: (status) {
                      ref.read(orderProvider.notifier).filterByStatus(status);
                    },
                  ),
                ),

                const SizedBox(height: AppSpacing.md),

                // Order History Metrics Summary Bar
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: _MetricItem(
                          title: 'Total POs',
                          value: '${state.orders.length}',
                          isDark: isDark,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.xs),
                      Expanded(
                        child: _MetricItem(
                          title: 'Pending',
                          value:
                              '${state.orders.where((o) => o.status == 'PENDING_APPROVAL' || o.status == 'DRAFT').length}',
                          valueColor: AppColors.warning,
                          isDark: isDark,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.xs),
                      Expanded(
                        child: _MetricItem(
                          title: 'Approved',
                          value:
                              '${state.orders.where((o) => o.status == 'APPROVED' || o.status == 'PAID').length}',
                          valueColor: AppColors.primary,
                          isDark: isDark,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: AppSpacing.md),

                // Order List Body
                Expanded(
                  child: _buildOrdersList(context, ref, theme, isDark, state),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildOrdersList(
    BuildContext context,
    WidgetRef ref,
    ThemeData theme,
    bool isDark,
    OrderState state,
  ) {
    if (state.isLoadingOrders) {
      return ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
        itemCount: 4,
        itemBuilder: (_, index) => const Padding(
          padding: EdgeInsets.only(bottom: AppSpacing.sm),
          child: AppCardSkeleton(),
        ),
      );
    }

    if (state.errorMessage != null && state.orders.isEmpty) {
      return AppErrorWidget(
        message: state.errorMessage!,
        onRetry: () =>
            ref.read(orderProvider.notifier).loadOrderHistory(isRefresh: true),
      );
    }

    if (state.filteredOrders.isEmpty) {
      return AppEmptyState(
        title: 'No Orders Found',
        description: state.searchQuery.isNotEmpty
            ? 'No purchase orders match "${state.searchQuery}".'
            : 'No orders match filter "${state.selectedStatusFilter}".',
        icon: LucideIcons.packageOpen,
        actionLabel: 'Create New Procurement',
        onActionPressed: () => context.go(AppRoutes.procurement),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.only(
        left: AppSpacing.md,
        right: AppSpacing.md,
        bottom: AppSpacing.xl,
      ),
      itemCount: state.filteredOrders.length,
      separatorBuilder: (_, index) => const SizedBox(height: AppSpacing.sm),
      itemBuilder: (context, index) {
        final order = state.filteredOrders[index];

        return OrderHistoryCard(
          order: order,
          onTap: () {
            context.push(AppRoutes.orderDetailsPath(order.id));
          },
        );
      },
    );
  }
}

class _MetricItem extends StatelessWidget {
  final String title;
  final String value;
  final Color? valueColor;
  final bool isDark;

  const _MetricItem({
    required this.title,
    required this.value,
    this.valueColor,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: 8,
      ),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        border: Border.all(
          color: isDark ? AppColors.borderDark : AppColors.borderLight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: theme.textTheme.labelSmall?.copyWith(
              fontSize: 10,
              color: isDark
                  ? AppColors.textSecondaryDark
                  : AppColors.textSecondaryLight,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: valueColor,
            ),
          ),
        ],
      ),
    );
  }
}
