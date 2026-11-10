import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../models/supplier.dart';

class SupplierBadgeShowcase extends StatelessWidget {
  final Supplier supplier;

  const SupplierBadgeShowcase({super.key, required this.supplier});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 4,
      runSpacing: 2,
      children: [
        if (supplier.supplierTier.isNotEmpty)
          _BadgeChip(
            icon: LucideIcons.award,
            label: supplier.supplierTier,
            color: Colors.amber.shade800,
            bgColor: Colors.amber.withValues(alpha: 0.15),
          ),
        if (supplier.isLightningDispatch)
          const _BadgeChip(
            icon: LucideIcons.zap,
            label: 'Lightning Fast',
            color: AppColors.primary,
            bgColor: AppColors.primaryContainerLight,
          ),
        if (supplier.isEcoCertified)
          _BadgeChip(
            icon: LucideIcons.leaf,
            label: 'Eco-Cert',
            color: Colors.green.shade700,
            bgColor: Colors.green.withValues(alpha: 0.15),
          ),
      ],
    );
  }
}

class _BadgeChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final Color bgColor;

  const _BadgeChip({
    required this.icon,
    required this.label,
    required this.color,
    required this.bgColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 10, color: color),
          const SizedBox(width: 3),
          Flexible(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.bold,
                color: color,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}
