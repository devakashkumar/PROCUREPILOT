import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';

/// Theme tokens encapsulation for light and dark modes
class AppThemeTokens {
  final bool isDark;

  const AppThemeTokens({required this.isDark});

  Color get primary => AppColors.primary;
  Color get secondary => AppColors.secondary;

  Color get background =>
      isDark ? AppColors.backgroundDark : AppColors.backgroundLight;
  Color get surface => isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
  Color get surfaceVariant =>
      isDark ? AppColors.surfaceVariantDark : AppColors.surfaceVariantLight;

  Color get textPrimary =>
      isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
  Color get textSecondary =>
      isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
  Color get border => isDark ? AppColors.borderDark : AppColors.borderLight;

  BoxShadow get cardShadow => BoxShadow(
    color: isDark
        ? Colors.black.withValues(alpha: 0.3)
        : Colors.black.withValues(alpha: 0.04),
    blurRadius: 12,
    offset: const Offset(0, 4),
  );

  BoxShadow get buttonShadow => BoxShadow(
    color: AppColors.primary.withValues(alpha: isDark ? 0.4 : 0.25),
    blurRadius: 8,
    offset: const Offset(0, 3),
  );

  BorderRadius get cardRadius => BorderRadius.circular(AppSpacing.radiusLg);
  BorderRadius get buttonRadius => BorderRadius.circular(AppSpacing.radiusMd);
  BorderRadius get inputRadius => BorderRadius.circular(AppSpacing.radiusMd);
}
