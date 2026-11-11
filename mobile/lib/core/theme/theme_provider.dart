import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Theme Mode State Notifier for switching Light/Dark/System theme
class ThemeModeNotifier extends StateNotifier<ThemeMode> {
  static const String _themeModeKey = 'procurepilot_theme_mode';

  ThemeModeNotifier() : super(ThemeMode.system) {
    _loadSavedThemeMode();
  }

  Future<void> _loadSavedThemeMode() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedIndex = prefs.getInt(_themeModeKey);
      if (savedIndex != null &&
          savedIndex >= 0 &&
          savedIndex < ThemeMode.values.length) {
        state = ThemeMode.values[savedIndex];
      }
    } catch (_) {
      // Fallback to system default if SharedPreferences fails
    }
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    state = mode;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt(_themeModeKey, mode.index);
    } catch (_) {}
  }

  void toggleTheme() {
    if (state == ThemeMode.dark) {
      setThemeMode(ThemeMode.light);
    } else {
      setThemeMode(ThemeMode.dark);
    }
  }
}

final themeModeProvider = StateNotifierProvider<ThemeModeNotifier, ThemeMode>((
  ref,
) {
  return ThemeModeNotifier();
});
