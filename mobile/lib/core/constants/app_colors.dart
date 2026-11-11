import 'package:flutter/material.dart';

/// Centralized design tokens for ProcurePilot AI
/// Primary identity: Modern Fintech + AI Assistant + Kirana Procurement
abstract class AppColors {
  // Primary Palette
  static const Color primary = Color(0xFF087F5B); // Deep Emerald Green
  static const Color primaryDark = Color(0xFF05523B);
  static const Color primaryLight = Color(0xFF0B9E72);
  static const Color primaryContainerLight = Color(0xFFE6F7F0);
  static const Color primaryContainerDark = Color(0xFF13362A);

  // Secondary Accent
  static const Color secondary = Color(0xFFC6F36B); // Electric Lime
  static const Color secondaryDark = Color(0xFF9EE035);
  static const Color secondaryContainerLight = Color(0xFFF2FCD6);
  static const Color secondaryContainerDark = Color(0xFF2C3814);

  // Neutral Backgrounds
  static const Color backgroundLight = Color(0xFFF7F9F6);
  static const Color backgroundDark = Color(0xFF101713);

  // Surface Colors
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color surfaceDark = Color(0xFF19231D);
  static const Color surfaceVariantLight = Color(0xFFEEF2EF);
  static const Color surfaceVariantDark = Color(0xFF222E27);

  // Text Colors
  static const Color textPrimaryLight = Color(0xFF18231D);
  static const Color textPrimaryDark = Color(0xFFE8EFEA);
  static const Color textSecondaryLight = Color(0xFF849188);
  static const Color textSecondaryDark = Color(0xFF9AAA9F);
  static const Color textMutedLight = Color(0xFFA5B2A8);
  static const Color textMutedDark = Color(0xFF6B7A70);

  // Border Colors
  static const Color borderLight = Color(0xFFE0E7E2);
  static const Color borderDark = Color(0xFF2A3830);

  // Feedback Colors
  static const Color success = Color(0xFF087F5B);
  static const Color successBgLight = Color(0xFFE6F7F0);
  static const Color successBgDark = Color(0xFF13362A);

  static const Color warning = Color(0xFFD97706);
  static const Color warningBgLight = Color(0xFFFEF3C7);
  static const Color warningBgDark = Color(0xFF3B270A);

  static const Color error = Color(0xFFDC2626);
  static const Color errorBgLight = Color(0xFFFEE2E2);
  static const Color errorBgDark = Color(0xFF381515);

  static const Color info = Color(0xFF2563EB);
  static const Color infoBgLight = Color(0xFFDBEAFE);
  static const Color infoBgDark = Color(0xFF10254C);

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primary, primaryDark],
  );

  static const LinearGradient aiGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primary, Color(0xFF059669), Color(0xFF047857)],
  );

  static const LinearGradient accentGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [secondary, Color(0xFFA3E635)],
  );

  static const LinearGradient cardDarkGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF19231D), Color(0xFF141C17)],
  );
}
