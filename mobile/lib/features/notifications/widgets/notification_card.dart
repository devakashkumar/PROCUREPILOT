import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../shared/widgets/app_card.dart';
import '../models/app_notification.dart';

class NotificationCard extends StatelessWidget {
  final AppNotification notification;
  final VoidCallback onTap;

  const NotificationCard({
    super.key,
    required this.notification,
    required this.onTap,
  });

  IconData _getCategoryIcon(NotificationCategory cat) {
    switch (cat) {
      case NotificationCategory.orderUpdate:
        return LucideIcons.package;
      case NotificationCategory.approvalUpdate:
        return LucideIcons.shieldCheck;
      case NotificationCategory.paymentUpdate:
        return LucideIcons.creditCard;
      case NotificationCategory.procurementUpdate:
        return LucideIcons.sparkles;
      case NotificationCategory.accountUpdate:
        return LucideIcons.user;
      default:
        return LucideIcons.bell;
    }
  }

  Color _getCategoryColor(NotificationCategory cat) {
    switch (cat) {
      case NotificationCategory.orderUpdate:
        return AppColors.info;
      case NotificationCategory.approvalUpdate:
        return AppColors.primary;
      case NotificationCategory.paymentUpdate:
        return AppColors.success;
      case NotificationCategory.procurementUpdate:
        return AppColors.secondary;
      case NotificationCategory.accountUpdate:
        return AppColors.warning;
      default:
        return AppColors.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final catColor = _getCategoryColor(notification.category);
    final catIcon = _getCategoryIcon(notification.category);

    return AppCard(
      onTap: onTap,
      child: Stack(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Category Icon Node
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: catColor.withValues(alpha: isDark ? 0.2 : 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(catIcon, size: 20, color: catColor),
              ),

              const SizedBox(width: AppSpacing.md),

              // Title, Message & Timestamp
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            notification.title,
                            style: theme.textTheme.titleSmall?.copyWith(
                              fontWeight: notification.isRead
                                  ? FontWeight.w600
                                  : FontWeight.bold,
                              color: isDark
                                  ? AppColors.textPrimaryDark
                                  : AppColors.textPrimaryLight,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          AppDateFormatter.formatShortDate(
                            notification.createdAt,
                          ),
                          style: theme.textTheme.labelSmall?.copyWith(
                            fontSize: 10,
                            color: isDark
                                ? AppColors.textSecondaryDark
                                : AppColors.textSecondaryLight,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 4),

                    Text(
                      notification.message,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: notification.isRead
                            ? (isDark
                                  ? AppColors.textSecondaryDark
                                  : AppColors.textSecondaryLight)
                            : (isDark
                                  ? AppColors.textPrimaryDark
                                  : AppColors.textPrimaryLight),
                        height: 1.3,
                      ),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),

          // Unread Indicator Pill
          if (!notification.isRead)
            Positioned(
              right: 0,
              top: 0,
              child: Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
