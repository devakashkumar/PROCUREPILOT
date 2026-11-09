import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';

class OrderStatusTimeline extends StatelessWidget {
  final String
  status; // 'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PAID', 'REJECTED'

  const OrderStatusTimeline({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final isRejected = status == 'REJECTED';
    final isApproved = status == 'APPROVED' || status == 'PAID';
    final isPaid = status == 'PAID';

    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: Border.all(
          color: isDark ? AppColors.borderDark : AppColors.borderLight,
        ),
      ),
      child: Column(
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
                'Order Approval Lifecycle',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          Row(
            children: [
              _TimelineStep(
                title: 'Created',
                isCompleted: true,
                isActive: false,
                isDark: isDark,
              ),
              _TimelineLine(isCompleted: true),
              _TimelineStep(
                title: 'Review',
                isCompleted: isApproved || isRejected,
                isActive: status == 'PENDING_APPROVAL' || status == 'DRAFT',
                isDark: isDark,
              ),
              _TimelineLine(isCompleted: isApproved),
              _TimelineStep(
                title: 'Approved',
                isCompleted: isApproved,
                isActive: isApproved && !isPaid,
                isError: isRejected,
                isDark: isDark,
              ),
              _TimelineLine(isCompleted: isPaid),
              _TimelineStep(
                title: 'Payment',
                isCompleted: isPaid,
                isActive: isPaid,
                isDark: isDark,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _TimelineStep extends StatelessWidget {
  final String title;
  final bool isCompleted;
  final bool isActive;
  final bool isError;
  final bool isDark;

  const _TimelineStep({
    required this.title,
    required this.isCompleted,
    required this.isActive,
    this.isError = false,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    Color bg = isDark
        ? AppColors.surfaceVariantDark
        : AppColors.surfaceVariantLight;
    Color iconColor = isDark
        ? AppColors.textMutedDark
        : AppColors.textMutedLight;

    if (isError) {
      bg = AppColors.errorBgLight;
      iconColor = AppColors.error;
    } else if (isCompleted || isActive) {
      bg = AppColors.primaryContainerLight;
      iconColor = AppColors.primary;
    }

    return Expanded(
      child: Column(
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: bg,
              shape: BoxShape.circle,
              border: isActive
                  ? Border.all(color: AppColors.primary, width: 2)
                  : null,
            ),
            child: Center(
              child: isError
                  ? const Icon(LucideIcons.x, size: 12, color: AppColors.error)
                  : isCompleted
                  ? const Icon(
                      LucideIcons.check,
                      size: 12,
                      color: AppColors.primary,
                    )
                  : Icon(LucideIcons.circle, size: 8, color: iconColor),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: theme.textTheme.labelSmall?.copyWith(
              fontSize: 9,
              fontWeight: isCompleted || isActive
                  ? FontWeight.bold
                  : FontWeight.normal,
              color: isError
                  ? AppColors.error
                  : isCompleted || isActive
                  ? (isDark
                        ? AppColors.textPrimaryDark
                        : AppColors.textPrimaryLight)
                  : (isDark
                        ? AppColors.textMutedDark
                        : AppColors.textMutedLight),
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _TimelineLine extends StatelessWidget {
  final bool isCompleted;

  const _TimelineLine({required this.isCompleted});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 16,
      height: 2,
      margin: const EdgeInsets.only(bottom: 14),
      color: isCompleted ? AppColors.primary : AppColors.borderLight,
    );
  }
}
