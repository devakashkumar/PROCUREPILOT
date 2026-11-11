import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/utils/date_formatter.dart';
import '../models/purchase_order.dart';

class OrderTimelineWidget extends StatelessWidget {
  final PurchaseOrder order;

  const OrderTimelineWidget({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final status = order.status.toUpperCase();
    final isRejected = status == 'REJECTED';
    final isApproved =
        status == 'APPROVED' || status == 'PAID' || status == 'COMPLETED';
    final isPaid = status == 'PAID' || status == 'COMPLETED';

    final List<_TimelineEvent> events = [];

    // 1. Created Event
    events.add(
      _TimelineEvent(
        title: 'Purchase Order Created',
        subtitle:
            'Order #${order.orderNumber} initiated for ${order.storeName}',
        timestamp: AppDateFormatter.formatDateTime(
          order.createdAt ?? DateTime.now(),
        ),
        isCompleted: true,
      ),
    );

    // 2. Review Event
    events.add(
      _TimelineEvent(
        title: isRejected
            ? 'Order Rejected'
            : isApproved
            ? 'Owner Approval Confirmed'
            : 'Awaiting Owner Approval',
        subtitle: isRejected
            ? 'Order rejected during review.'
            : isApproved
            ? 'Order explicitly approved by business owner.'
            : 'Requires owner checklist review and approval.',
        timestamp: isApproved || isRejected
            ? AppDateFormatter.formatDateTime(order.createdAt ?? DateTime.now())
            : null,
        isCompleted: isApproved || isRejected,
        isError: isRejected,
      ),
    );

    // 3. Payment Event
    if (!isRejected) {
      events.add(
        _TimelineEvent(
          title: isPaid ? 'Payment Confirmed' : 'Payment Pending',
          subtitle: isPaid
              ? 'PayPal Sandbox payment captured and verified.'
              : 'Checkout available upon owner approval.',
          timestamp: isPaid && order.createdAt != null
              ? AppDateFormatter.formatDateTime(order.createdAt!)
              : null,
          isCompleted: isPaid,
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(
              LucideIcons.gitCommit,
              size: 18,
              color: AppColors.primary,
            ),
            const SizedBox(width: AppSpacing.xs),
            Text(
              'Order Lifecycle Timeline',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),

        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: events.length,
          separatorBuilder: (_, index) => const SizedBox(height: AppSpacing.xs),
          itemBuilder: (context, index) {
            final ev = events[index];
            final isLast = index == events.length - 1;

            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Icon Node + Line
                Column(
                  children: [
                    Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: ev.isError
                            ? AppColors.errorBgLight
                            : ev.isCompleted
                            ? AppColors.primaryContainerLight
                            : (isDark
                                  ? AppColors.surfaceVariantDark
                                  : AppColors.surfaceVariantLight),
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Icon(
                          ev.isError
                              ? LucideIcons.x
                              : ev.isCompleted
                              ? LucideIcons.check
                              : LucideIcons.circle,
                          size: 14,
                          color: ev.isError
                              ? AppColors.error
                              : ev.isCompleted
                              ? AppColors.primary
                              : (isDark
                                    ? AppColors.textMutedDark
                                    : AppColors.textMutedLight),
                        ),
                      ),
                    ),
                    if (!isLast)
                      Container(
                        width: 2,
                        height: 36,
                        color: ev.isCompleted
                            ? AppColors.primary
                            : AppColors.borderLight,
                      ),
                  ],
                ),
                const SizedBox(width: AppSpacing.md),

                // Event Text Info
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                ev.title,
                                style: theme.textTheme.titleSmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: ev.isError ? AppColors.error : null,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            if (ev.timestamp != null) ...[
                              const SizedBox(width: 4),
                              Text(
                                ev.timestamp!,
                                style: theme.textTheme.labelSmall?.copyWith(
                                  fontSize: 10,
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          ev.subtitle,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: isDark
                                ? AppColors.textSecondaryDark
                                : AppColors.textSecondaryLight,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ],
    );
  }
}

class _TimelineEvent {
  final String title;
  final String subtitle;
  final String? timestamp;
  final bool isCompleted;
  final bool isError;

  const _TimelineEvent({
    required this.title,
    required this.subtitle,
    this.timestamp,
    required this.isCompleted,
    this.isError = false,
  });
}
