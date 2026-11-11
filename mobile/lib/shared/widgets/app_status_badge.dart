import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_spacing.dart';

enum BadgeStatus { success, warning, error, info, aiRecommended, neutral }

class AppStatusBadge extends StatelessWidget {
  final String label;
  final BadgeStatus status;
  final IconData? icon;

  const AppStatusBadge({
    super.key,
    required this.label,
    this.status = BadgeStatus.neutral,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final config = _getBadgeConfig(isDark);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: config.backgroundColor,
        borderRadius: BorderRadius.circular(AppSpacing.radiusFull),
        border: Border.all(color: config.borderColor, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12, color: config.textColor),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: theme.textTheme.labelSmall?.copyWith(
              color: config.textColor,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  _BadgeStyleConfig _getBadgeConfig(bool isDark) {
    switch (status) {
      case BadgeStatus.success:
        return _BadgeStyleConfig(
          backgroundColor: isDark
              ? AppColors.successBgDark
              : AppColors.successBgLight,
          textColor: isDark ? AppColors.secondary : AppColors.success,
          borderColor: isDark
              ? AppColors.primaryDark
              : AppColors.primaryContainerLight,
        );
      case BadgeStatus.warning:
        return _BadgeStyleConfig(
          backgroundColor: isDark
              ? AppColors.warningBgDark
              : AppColors.warningBgLight,
          textColor: AppColors.warning,
          borderColor: AppColors.warning.withValues(alpha: 0.3),
        );
      case BadgeStatus.error:
        return _BadgeStyleConfig(
          backgroundColor: isDark
              ? AppColors.errorBgDark
              : AppColors.errorBgLight,
          textColor: AppColors.error,
          borderColor: AppColors.error.withValues(alpha: 0.3),
        );
      case BadgeStatus.info:
        return _BadgeStyleConfig(
          backgroundColor: isDark
              ? AppColors.infoBgDark
              : AppColors.infoBgLight,
          textColor: AppColors.info,
          borderColor: AppColors.info.withValues(alpha: 0.3),
        );
      case BadgeStatus.aiRecommended:
        return _BadgeStyleConfig(
          backgroundColor: isDark
              ? AppColors.primaryContainerDark
              : AppColors.primaryContainerLight,
          textColor: isDark ? AppColors.secondary : AppColors.primary,
          borderColor: AppColors.primary,
        );
      case BadgeStatus.neutral:
        return _BadgeStyleConfig(
          backgroundColor: isDark
              ? AppColors.surfaceVariantDark
              : AppColors.surfaceVariantLight,
          textColor: isDark
              ? AppColors.textSecondaryDark
              : AppColors.textSecondaryLight,
          borderColor: isDark ? AppColors.borderDark : AppColors.borderLight,
        );
    }
  }
}

class _BadgeStyleConfig {
  final Color backgroundColor;
  final Color textColor;
  final Color borderColor;

  const _BadgeStyleConfig({
    required this.backgroundColor,
    required this.textColor,
    required this.borderColor,
  });
}
