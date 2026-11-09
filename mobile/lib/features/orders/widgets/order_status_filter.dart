import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';

class OrderStatusFilter extends StatelessWidget {
  final String selectedStatus;
  final ValueChanged<String> onSelectStatus;

  static const List<String> statusFilters = [
    'All',
    'Pending',
    'Approved',
    'Paid',
    'Rejected',
    'Cancelled',
  ];

  const OrderStatusFilter({
    super.key,
    required this.selectedStatus,
    required this.onSelectStatus,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return SizedBox(
      height: 38,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: EdgeInsets.zero,
        itemCount: statusFilters.length,
        separatorBuilder: (_, index) => const SizedBox(width: AppSpacing.xs),
        itemBuilder: (context, index) {
          final filter = statusFilters[index];
          final isSelected =
              filter.toLowerCase() == selectedStatus.toLowerCase();

          return GestureDetector(
            onTap: () => onSelectStatus(filter),
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
              ),
              child: Center(
                child: Text(
                  filter,
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: isSelected
                        ? Colors.white
                        : (isDark
                              ? AppColors.textPrimaryDark
                              : AppColors.textPrimaryLight),
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
