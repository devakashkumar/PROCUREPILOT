import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_spacing.dart';

enum AppButtonVariant { primary, secondary, outline, ghost, aiGradient }

class AppButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final bool isLoading;
  final bool isFullWidth;
  final IconData? leadingIcon;
  final IconData? trailingIcon;
  final double? height;

  const AppButton({
    super.key,
    required this.text,
    this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.isLoading = false,
    this.isFullWidth = true,
    this.leadingIcon,
    this.trailingIcon,
    this.height,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    Widget child = Row(
      mainAxisSize: isFullWidth ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (isLoading) ...[
          SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(
              strokeWidth: 2.5,
              valueColor: AlwaysStoppedAnimation<Color>(_getTextColor(isDark)),
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
        ] else if (leadingIcon != null) ...[
          Icon(leadingIcon, size: 18, color: _getTextColor(isDark)),
          const SizedBox(width: AppSpacing.sm),
        ],
        Flexible(
          child: Text(
            text,
            style: theme.textTheme.labelLarge?.copyWith(
              color: _getTextColor(isDark),
              fontWeight: FontWeight.w600,
            ),
            overflow: TextOverflow.ellipsis,
            maxLines: 1,
          ),
        ),
        if (!isLoading && trailingIcon != null) ...[
          const SizedBox(width: AppSpacing.sm),
          Icon(trailingIcon, size: 18, color: _getTextColor(isDark)),
        ],
      ],
    );

    if (variant == AppButtonVariant.aiGradient) {
      return Container(
        height: height ?? AppSpacing.buttonHeight,
        width: isFullWidth ? double.infinity : null,
        decoration: BoxDecoration(
          gradient: AppColors.aiGradient,
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withValues(alpha: 0.3),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: isLoading ? null : onPressed,
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
              child: child,
            ),
          ),
        ),
      );
    }

    final buttonStyle = _getButtonStyle(theme, isDark);

    return SizedBox(
      height: height ?? AppSpacing.buttonHeight,
      width: isFullWidth ? double.infinity : null,
      child: ElevatedButton(
        style: buttonStyle,
        onPressed: isLoading ? null : onPressed,
        child: child,
      ),
    );
  }

  Color _getTextColor(bool isDark) {
    switch (variant) {
      case AppButtonVariant.primary:
      case AppButtonVariant.aiGradient:
        return Colors.white;
      case AppButtonVariant.secondary:
        return isDark ? AppColors.backgroundDark : AppColors.textPrimaryLight;
      case AppButtonVariant.outline:
      case AppButtonVariant.ghost:
        return isDark ? AppColors.secondary : AppColors.primary;
    }
  }

  ButtonStyle _getButtonStyle(ThemeData theme, bool isDark) {
    switch (variant) {
      case AppButtonVariant.primary:
        return ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          ),
        );
      case AppButtonVariant.secondary:
        return ElevatedButton.styleFrom(
          backgroundColor: AppColors.secondary,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          ),
        );
      case AppButtonVariant.outline:
        return ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          elevation: 0,
          side: BorderSide(
            color: isDark ? AppColors.secondary : AppColors.primary,
            width: 1.5,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          ),
        );
      case AppButtonVariant.ghost:
        return ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          ),
        );
      case AppButtonVariant.aiGradient:
        return const ButtonStyle();
    }
  }
}
