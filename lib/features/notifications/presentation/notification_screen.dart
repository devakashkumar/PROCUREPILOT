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
import '../models/app_notification.dart';
import '../providers/notification_provider.dart';
import '../widgets/notification_card.dart';
import '../widgets/notification_category_filter.dart';

class NotificationScreen extends ConsumerWidget {
  const NotificationScreen({super.key});

  void _handleNotificationTap(
    BuildContext context,
    WidgetRef ref,
    AppNotification notification,
  ) {
    ref.read(notificationProvider.notifier).markAsRead(notification.id);

    if (notification.orderId != null && notification.orderId!.isNotEmpty) {
      context.push(AppRoutes.orderDetailsPath(notification.orderId!));
    } else if (notification.paymentId != null &&
        notification.paymentId!.isNotEmpty) {
      context.push(AppRoutes.paymentStatusPath(notification.paymentId!));
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final state = ref.watch(notificationProvider);

    return Scaffold(
      appBar: ProcureAppBarHeader(
        title: 'Notifications',
        subtitle: state.unreadCount > 0
            ? '${state.unreadCount} unread procurement updates'
            : 'All procurement notifications read',
        actions: [
          if (state.unreadCount > 0)
            IconButton(
              tooltip: 'Mark all as read',
              icon: const Icon(
                LucideIcons.checkCheck,
                size: 20,
                color: AppColors.primary,
              ),
              onPressed: () {
                ref.read(notificationProvider.notifier).markAllAsRead();
              },
            ),
          const SizedBox(width: AppSpacing.xs),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => ref
              .read(notificationProvider.notifier)
              .loadNotifications(isRefresh: true),
          color: AppColors.primary,
          child: AppResponsiveCenter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: AppSpacing.sm),

                // Notification Category Filters Bar
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                  ),
                  child: NotificationCategoryFilter(
                    selectedFilter: state.selectedFilter,
                    onSelectFilter: (filter) {
                      ref
                          .read(notificationProvider.notifier)
                          .filterByCategory(filter);
                    },
                  ),
                ),

                const SizedBox(height: AppSpacing.md),

                // Notifications List Body
                Expanded(
                  child: _buildNotificationsList(
                    context,
                    ref,
                    theme,
                    isDark,
                    state,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNotificationsList(
    BuildContext context,
    WidgetRef ref,
    ThemeData theme,
    bool isDark,
    NotificationState state,
  ) {
    if (state.isLoading) {
      return ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
        itemCount: 4,
        itemBuilder: (_, index) => const Padding(
          padding: EdgeInsets.only(bottom: AppSpacing.sm),
          child: AppCardSkeleton(),
        ),
      );
    }

    if (state.errorMessage != null && state.notifications.isEmpty) {
      return AppErrorWidget(
        message: state.errorMessage!,
        onRetry: () => ref
            .read(notificationProvider.notifier)
            .loadNotifications(isRefresh: true),
      );
    }

    if (state.filteredNotifications.isEmpty) {
      return AppEmptyState(
        title: 'No Notifications',
        description: state.selectedFilter != 'All'
            ? 'No notifications match filter "${state.selectedFilter}".'
            : 'You are all caught up! No new procurement notifications.',
        icon: LucideIcons.bellOff,
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.only(
        left: AppSpacing.md,
        right: AppSpacing.md,
        bottom: AppSpacing.xl,
      ),
      itemCount: state.filteredNotifications.length,
      separatorBuilder: (_, index) => const SizedBox(height: AppSpacing.sm),
      itemBuilder: (context, index) {
        final notification = state.filteredNotifications[index];

        return NotificationCard(
          notification: notification,
          onTap: () => _handleNotificationTap(context, ref, notification),
        );
      },
    );
  }
}
