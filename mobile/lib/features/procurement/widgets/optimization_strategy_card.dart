import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';

class StrategyInfo {
  final String key;
  final String title;
  final String description;
  final IconData icon;

  const StrategyInfo({
    required this.key,
    required this.title,
    required this.description,
    required this.icon,
  });
}

class OptimizationStrategyCard extends StatelessWidget {
  final String currentStrategy;
  final ValueChanged<String> onStrategySelected;
  final bool isSwitching;

  static const List<StrategyInfo> strategies = [
    StrategyInfo(
      key: 'balanced',
      title: 'BALANCED',
      description: 'Best combination of price, reliability and delivery.',
      icon: LucideIcons.scale,
    ),
    StrategyInfo(
      key: 'cheapest',
      title: 'CHEAPEST',
      description: 'Prioritizes minimum purchase cost.',
      icon: LucideIcons.tag,
    ),
    StrategyInfo(
      key: 'reliable',
      title: 'RELIABLE',
      description: 'Prioritizes top supplier reliability.',
      icon: LucideIcons.shieldCheck,
    ),
    StrategyInfo(
      key: 'fastest',
      title: 'FASTEST',
      description: 'Prioritizes quicker delivery time.',
      icon: LucideIcons.zap,
    ),
  ];

  const OptimizationStrategyCard({
    super.key,
    required this.currentStrategy,
    required this.onStrategySelected,
    this.isSwitching = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Optimization Strategy',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            if (isSwitching)
              const SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                ),
              ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: AppSpacing.sm,
          crossAxisSpacing: AppSpacing.sm,
          childAspectRatio: 1.8,
          children: strategies.map((strat) {
            final isSelected = strat.key == currentStrategy;
            return GestureDetector(
              onTap: isSwitching ? null : () => onStrategySelected(strat.key),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: isSelected
                      ? (isDark
                            ? AppColors.primaryContainerDark
                            : AppColors.primaryContainerLight)
                      : (isDark
                            ? AppColors.surfaceDark
                            : AppColors.surfaceLight),
                  borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
                  border: Border.all(
                    color: isSelected
                        ? AppColors.primary
                        : (isDark
                              ? AppColors.borderDark
                              : AppColors.borderLight),
                    width: isSelected ? 2 : 1,
                  ),
                  boxShadow: isSelected
                      ? [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.2),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ]
                      : null,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Row(
                      children: [
                        Icon(
                          strat.icon,
                          size: 16,
                          color: isSelected
                              ? AppColors.primary
                              : (isDark
                                    ? AppColors.textSecondaryDark
                                    : AppColors.textSecondaryLight),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          strat.title,
                          style: theme.textTheme.labelMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: isSelected ? AppColors.primary : null,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      strat.description,
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: isDark
                            ? AppColors.textSecondaryDark
                            : AppColors.textSecondaryLight,
                        fontSize: 10,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}
