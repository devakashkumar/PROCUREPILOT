import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../shared/widgets/app_card.dart';

class ApprovalChecklist extends StatelessWidget {
  final bool check1;
  final bool check2;
  final bool check3;
  final bool check4;
  final Function(int index, bool value) onItemChanged;
  final bool enabled;

  const ApprovalChecklist({
    super.key,
    required this.check1,
    required this.check2,
    required this.check3,
    required this.check4,
    required this.onItemChanged,
    this.enabled = true,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                LucideIcons.checkSquare,
                size: 18,
                color: AppColors.primary,
              ),
              const SizedBox(width: AppSpacing.xs),
              Text(
                'Mandatory Owner Approval Checklist',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          const Divider(),
          const SizedBox(height: AppSpacing.xs),

          _CheckItemTile(
            index: 1,
            label: 'I have reviewed all selected products.',
            value: check1,
            enabled: enabled,
            onChanged: (val) => onItemChanged(1, val),
          ),
          _CheckItemTile(
            index: 2,
            label: 'I have verified quantities and supplier selections.',
            value: check2,
            enabled: enabled,
            onChanged: (val) => onItemChanged(2, val),
          ),
          _CheckItemTile(
            index: 3,
            label: 'I understand the order amount and currency.',
            value: check3,
            enabled: enabled,
            onChanged: (val) => onItemChanged(3, val),
          ),
          _CheckItemTile(
            index: 4,
            label: 'I agree to proceed with this purchase.',
            value: check4,
            enabled: enabled,
            onChanged: (val) => onItemChanged(4, val),
          ),
        ],
      ),
    );
  }
}

class _CheckItemTile extends StatelessWidget {
  final int index;
  final String label;
  final bool value;
  final bool enabled;
  final ValueChanged<bool> onChanged;

  const _CheckItemTile({
    required this.index,
    required this.label,
    required this.value,
    required this.enabled,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(
            width: 24,
            height: 24,
            child: Checkbox(
              value: value,
              activeColor: AppColors.primary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(4),
              ),
              onChanged: enabled ? (v) => onChanged(v ?? false) : null,
            ),
          ),
          const SizedBox(width: AppSpacing.xs),
          Expanded(
            child: GestureDetector(
              onTap: enabled ? () => onChanged(!value) : null,
              child: Text(
                label,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: isDark
                      ? AppColors.textPrimaryDark
                      : AppColors.textPrimaryLight,
                  fontWeight: value ? FontWeight.bold : FontWeight.w400,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
