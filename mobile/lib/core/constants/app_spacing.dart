import 'package:flutter/material.dart';

/// Centralized spacing and layout dimension constants
abstract class AppSpacing {
  // Base Spacing Scale
  static const double xxs = 2.0;
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  static const double xxl = 48.0;

  // Border Radius Scale
  static const double radiusXs = 4.0;
  static const double radiusSm = 8.0;
  static const double radiusMd = 12.0;
  static const double radiusLg = 16.0;
  static const double radiusXl = 24.0;
  static const double radiusFull = 999.0;

  // Component Specific Dimensions
  static const double buttonHeight = 48.0;
  static const double buttonHeightSm = 36.0;
  static const double inputHeight = 52.0;
  static const double cardElevation = 2.0;

  // Responsive Breakpoints
  static const double maxContentWidthMobile = 540.0;
  static const double maxContentWidthTablet = 840.0;
  static const double maxContentWidthDesktop = 1200.0;

  // Padding Constants
  static const EdgeInsets pagePadding = EdgeInsets.all(md);
  static const EdgeInsets pagePaddingHorizontal = EdgeInsets.symmetric(
    horizontal: md,
  );
  static const EdgeInsets cardPadding = EdgeInsets.all(md);
}
