import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_spacing.dart';

class AppCard extends StatelessWidget {
  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry? padding;
  final Color? backgroundColor;
  final Border? border;
  final bool hasGradient;

  const AppCard({
    super.key,
    required this.child,
    this.onTap,
    this.padding,
    this.backgroundColor,
    this.border,
    this.hasGradient = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final defaultBg =
        backgroundColor ??
        (isDark ? AppColors.surfaceDark : AppColors.surfaceLight);
    final defaultBorder =
        border ??
        Border.all(
          color: isDark ? AppColors.borderDark : AppColors.borderLight,
          width: 1,
        );

    Widget content = Container(
      padding: padding ?? const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: hasGradient ? null : defaultBg,
        gradient: hasGradient
            ? (isDark ? AppColors.cardDarkGradient : null)
            : null,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: defaultBorder,
        boxShadow: [
          BoxShadow(
            color: isDark
                ? Colors.black.withValues(alpha: 0.2)
                : Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: child,
    );

    if (onTap != null) {
      return Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
          child: content,
        ),
      );
    }

    return content;
  }
}
