import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/app_status_badge.dart';
import '../models/product.dart';

class ProductCard extends StatelessWidget {
  final Product product;
  final int selectedQuantity;
  final ValueChanged<int> onQuantityChanged;
  final VoidCallback onTap;

  const ProductCard({
    super.key,
    required this.product,
    required this.selectedQuantity,
    required this.onQuantityChanged,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return AppCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Row: Product Image Thumbnail & Stock Badge
          Stack(
            children: [
              Container(
                height: 120,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: isDark
                      ? AppColors.surfaceVariantDark
                      : AppColors.surfaceVariantLight,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                  child:
                      product.imageUrl != null && product.imageUrl!.isNotEmpty
                      ? Image.network(
                          product.imageUrl!,
                          fit: BoxFit.cover,
                          errorBuilder: (ctx, err, stack) =>
                              _buildFallbackImage(isDark),
                        )
                      : _buildFallbackImage(isDark),
                ),
              ),
              Positioned(
                top: 8,
                left: 8,
                child: AppStatusBadge(
                  label: product.inStock ? 'In Stock' : 'Low Stock',
                  status: product.inStock
                      ? BadgeStatus.success
                      : BadgeStatus.warning,
                ),
              ),
              Positioned(
                top: 8,
                right: 8,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: isDark
                        ? AppColors.surfaceDark
                        : AppColors.surfaceLight,
                    borderRadius: BorderRadius.circular(AppSpacing.radiusFull),
                    border: Border.all(
                      color: isDark
                          ? AppColors.borderDark
                          : AppColors.borderLight,
                    ),
                  ),
                  child: Text(
                    product.category,
                    style: theme.textTheme.labelSmall?.copyWith(fontSize: 10),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.sm),

          // Brand & Name
          Text(
            product.brand.toUpperCase(),
            style: theme.textTheme.labelSmall?.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            product.name,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),

          const SizedBox(height: 2),

          // Unit & Packaging
          Row(
            children: [
              const Icon(
                LucideIcons.package,
                size: 12,
                color: AppColors.textSecondaryLight,
              ),
              const SizedBox(width: 4),
              Text(
                product.unit,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: isDark
                      ? AppColors.textSecondaryDark
                      : AppColors.textSecondaryLight,
                ),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.sm),

          // Quantity Selection Control
          if (selectedQuantity > 0) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
              decoration: BoxDecoration(
                color: isDark
                    ? AppColors.primaryContainerDark
                    : AppColors.primaryContainerLight,
                borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                border: Border.all(color: AppColors.primary, width: 1),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    icon: const Icon(
                      LucideIcons.minus,
                      size: 16,
                      color: AppColors.primary,
                    ),
                    onPressed: () => onQuantityChanged(selectedQuantity - 1),
                    constraints: const BoxConstraints(
                      minWidth: 32,
                      minHeight: 32,
                    ),
                    padding: EdgeInsets.zero,
                  ),
                  Text(
                    '$selectedQuantity Qty',
                    style: theme.textTheme.labelLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(
                      LucideIcons.plus,
                      size: 16,
                      color: AppColors.primary,
                    ),
                    onPressed: () => onQuantityChanged(selectedQuantity + 1),
                    constraints: const BoxConstraints(
                      minWidth: 32,
                      minHeight: 32,
                    ),
                    padding: EdgeInsets.zero,
                  ),
                ],
              ),
            ),
          ] else ...[
            AppButton(
              text: 'Select Quantity',
              variant: AppButtonVariant.outline,
              leadingIcon: LucideIcons.plus,
              onPressed: () => onQuantityChanged(1),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildFallbackImage(bool isDark) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            LucideIcons.box,
            size: 36,
            color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
          ),
          const SizedBox(height: 4),
          Text(
            'Wholesale Catalogue',
            style: TextStyle(
              fontSize: 10,
              color: isDark
                  ? AppColors.textMutedDark
                  : AppColors.textMutedLight,
            ),
          ),
        ],
      ),
    );
  }
}
