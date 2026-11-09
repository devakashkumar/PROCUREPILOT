import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';

class OptimizationStrategyOption {
  final String key;
  final String label;
  final IconData icon;

  const OptimizationStrategyOption({
    required this.key,
    required this.label,
    required this.icon,
  });
}

class SupplierFilterChips extends StatelessWidget {
  final String selectedStrategy;
  final ValueChanged<String> onSelectStrategy;
  final bool isOptimizing;

  static const List<OptimizationStrategyOption> strategies = [
    OptimizationStrategyOption(
      key: 'balanced',
      label: 'Balanced',
      icon: LucideIcons.scale,
    ),
    OptimizationStrategyOption(
      key: 'cheapest',
      label: 'Cheapest',
      icon: LucideIcons.tag,
    ),
    OptimizationStrategyOption(
      key: 'reliable',
      label: 'Reliable',
      icon: LucideIcons.shieldCheck,
    ),
    OptimizationStrategyOption(
      key: 'fastest',
      label: 'Fastest',
      icon: LucideIcons.zap,
    ),
  ];

  const SupplierFilterChips({
    super.key,
    required this.selectedStrategy,
    required this.onSelectStrategy,
    this.isOptimizing = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return SizedBox(
      height: 40,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: EdgeInsets.zero,
        itemCount: strategies.length,
        separatorBuilder: (_, index) => const SizedBox(width: AppSpacing.xs),
        itemBuilder: (context, index) {
          final opt = strategies[index];
          final isSelected = opt.key == selectedStrategy;

          return GestureDetector(
            onTap: isOptimizing ? null : () => onSelectStrategy(opt.key),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected
                    ? AppColors.primary
                    : (isDark ? AppColors.surfaceDark : AppColors.surfaceLight),
                borderRadius: BorderRadius.circular(AppSpacing.radiusFull),
                border: Border.all(
                  color: isSelected
                      ? AppColors.primary
                      : (isDark ? AppColors.borderDark : AppColors.borderLight),
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.25),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ]
                    : null,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (isSelected && isOptimizing) ...[
                    const SizedBox(
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    ),
                    const SizedBox(width: 6),
                  ] else ...[
                    Icon(
                      opt.icon,
                      size: 15,
                      color: isSelected
                          ? Colors.white
                          : (isDark
                                ? AppColors.textSecondaryDark
                                : AppColors.textSecondaryLight),
                    ),
                    const SizedBox(width: 6),
                  ],
                  Text(
                    opt.label,
                    style: theme.textTheme.labelMedium?.copyWith(
                      color: isSelected
                          ? Colors.white
                          : (isDark
                                ? AppColors.textPrimaryDark
                                : AppColors.textPrimaryLight),
                      fontWeight: isSelected
                          ? FontWeight.bold
                          : FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
