import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_spacing.dart';

class ProcureAppBarHeader extends StatelessWidget
    implements PreferredSizeWidget {
  final String title;
  final String? subtitle;
  final bool showAiBadge;
  final List<Widget>? actions;
  final Widget? leading;

  const ProcureAppBarHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.showAiBadge = false,
    this.actions,
    this.leading,
  });

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return AppBar(
      leading: leading,
      title: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Flexible(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Flexible(
                      child: Text(
                        title,
                        style: theme.textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (showAiBadge) ...[
                      const SizedBox(width: AppSpacing.xs),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          gradient: AppColors.aiGradient,
                          borderRadius: BorderRadius.circular(
                            AppSpacing.radiusFull,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              LucideIcons.sparkles,
                              size: 10,
                              color: Colors.white,
                            ),
                            const SizedBox(width: 3),
                            Text(
                              'AI',
                              style: theme.textTheme.labelSmall?.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 9,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
                if (subtitle != null) ...[
                  Text(
                    subtitle!,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: isDark
                          ? AppColors.textSecondaryDark
                          : AppColors.textSecondaryLight,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
      actions:
          actions ??
          [
            IconButton(
              icon: const Icon(LucideIcons.bell, size: 20),
              onPressed: () {},
            ),
            const SizedBox(width: AppSpacing.xs),
          ],
    );
  }
}
