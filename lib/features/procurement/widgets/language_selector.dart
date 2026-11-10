import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';

class LanguageOption {
  final String label;
  final String localeId;
  final String flagEmoji;

  const LanguageOption({
    required this.label,
    required this.localeId,
    required this.flagEmoji,
  });
}

class LanguageSelector extends StatelessWidget {
  final String selectedLocaleId;
  final ValueChanged<String> onLanguageChanged;

  static const List<LanguageOption> options = [
    LanguageOption(label: 'English (IN)', localeId: 'en_IN', flagEmoji: '🇮🇳'),
    LanguageOption(
      label: 'Hindi (हिन्दी)',
      localeId: 'hi_IN',
      flagEmoji: '🇮🇳',
    ),
  ];

  const LanguageSelector({
    super.key,
    required this.selectedLocaleId,
    required this.onLanguageChanged,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: options.map((opt) {
        final isSelected = opt.localeId == selectedLocaleId;
        return Padding(
          padding: const EdgeInsets.only(right: AppSpacing.xs),
          child: GestureDetector(
            onTap: () => onLanguageChanged(opt.localeId),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: isSelected
                    ? AppColors.primary
                    : (isDark
                          ? AppColors.surfaceVariantDark
                          : AppColors.surfaceVariantLight),
                borderRadius: BorderRadius.circular(AppSpacing.radiusFull),
                border: Border.all(
                  color: isSelected
                      ? AppColors.primary
                      : (isDark ? AppColors.borderDark : AppColors.borderLight),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(opt.flagEmoji, style: const TextStyle(fontSize: 12)),
                  const SizedBox(width: 4),
                  Text(
                    opt.label,
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: isSelected
                          ? Colors.white
                          : (isDark
                                ? AppColors.textPrimaryDark
                                : AppColors.textPrimaryLight),
                      fontWeight: isSelected
                          ? FontWeight.bold
                          : FontWeight.w500,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}
