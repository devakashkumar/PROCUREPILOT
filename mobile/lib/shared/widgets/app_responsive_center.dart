import 'package:flutter/material.dart';
import '../../core/constants/app_spacing.dart';

/// Responsive Layout Wrapper centering content and maintaining safe padding
class AppResponsiveCenter extends StatelessWidget {
  final Widget child;
  final double maxContentWidth;
  final EdgeInsetsGeometry? padding;
  final bool enableSafeArea;

  const AppResponsiveCenter({
    super.key,
    required this.child,
    this.maxContentWidth = AppSpacing.maxContentWidthMobile,
    this.padding,
    this.enableSafeArea = true,
  });

  @override
  Widget build(BuildContext context) {
    Widget content = Center(
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: maxContentWidth),
        child: Padding(
          padding:
              padding ?? const EdgeInsets.symmetric(horizontal: AppSpacing.md),
          child: child,
        ),
      ),
    );

    if (enableSafeArea) {
      return SafeArea(child: content);
    }

    return content;
  }
}
