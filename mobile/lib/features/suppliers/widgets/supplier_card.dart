import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/app_status_badge.dart';
import '../models/supplier.dart';

class SupplierCard extends StatelessWidget {
  final SupplierOffer offer;
  final bool isSelected;
  final VoidCallback onSelect;

  const SupplierCard({
    super.key,
    required this.offer,
    required this.isSelected,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final supplier = offer.supplier;

    return AppCard(
      border: isSelected
          ? Border.all(color: AppColors.primary, width: 2)
          : Border.all(
              color: isDark ? AppColors.borderDark : AppColors.borderLight,
              width: 1,
            ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Supplier Name, Verified Badge & Badges Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 18,
                      backgroundColor: isDark
                          ? AppColors.primaryContainerDark
                          : AppColors.primaryContainerLight,
                      child: Text(
                        supplier.name.isNotEmpty
                            ? supplier.name[0].toUpperCase()
                            : 'S',
                        style: const TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Flexible(
                                child: Text(
                                  supplier.name,
                                  style: theme.textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              if (supplier.isVerified) ...[
                                const SizedBox(width: 4),
                                const Icon(
                                  LucideIcons.checkCircle,
                                  size: 14,
                                  color: AppColors.primary,
                                ),
                              ],
                            ],
                          ),
                          Row(
                            children: [
                              const Icon(
                                LucideIcons.mapPin,
                                size: 12,
                                color: AppColors.textSecondaryLight,
                              ),
                              const SizedBox(width: 2),
                              Text(
                                supplier.location,
                                style: theme.textTheme.labelSmall,
                              ),
                              const SizedBox(width: 8),
                              const Icon(
                                LucideIcons.star,
                                size: 12,
                                color: AppColors.warning,
                              ),
                              const SizedBox(width: 2),
                              Text(
                                supplier.reliabilityScore.toStringAsFixed(1),
                                style: theme.textTheme.labelSmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              if (isSelected)
                const AppStatusBadge(
                  label: 'Selected',
                  status: BadgeStatus.success,
                ),
            ],
          ),

          const SizedBox(height: AppSpacing.sm),

          // Highlight Badges Row (Lowest Price / Fastest / Reliable)
          if (offer.isCheapest || offer.isFastest || offer.isMostReliable) ...[
            Wrap(
              spacing: 6,
              runSpacing: 4,
              children: [
                if (offer.isCheapest)
                  const AppStatusBadge(
                    label: 'Lowest Price',
                    status: BadgeStatus.success,
                    icon: LucideIcons.tag,
                  ),
                if (offer.isFastest)
                  const AppStatusBadge(
                    label: 'Fastest Delivery',
                    status: BadgeStatus.info,
                    icon: LucideIcons.zap,
                  ),
                if (offer.isMostReliable)
                  const AppStatusBadge(
                    label: 'High Reliability',
                    status: BadgeStatus.aiRecommended,
                    icon: LucideIcons.shieldCheck,
                  ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
          ],

          const Divider(),
          const SizedBox(height: AppSpacing.xs),

          // Product & Price Breakdown
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    offer.productName,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    '${offer.quantity} ${offer.unit} @ ${CurrencyFormatter.formatINR(offer.unitPrice)}/${offer.unit}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: isDark
                          ? AppColors.textSecondaryDark
                          : AppColors.textSecondaryLight,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(
                        LucideIcons.truck,
                        size: 12,
                        color: AppColors.info,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Delivery: ${offer.deliveryDays} ${offer.deliveryDays == 1 ? 'day' : 'days'} (${CurrencyFormatter.formatINR(offer.deliveryFee)})',
                        style: theme.textTheme.labelSmall,
                      ),
                    ],
                  ),
                ],
              ),

              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('Offer Total', style: theme.textTheme.labelSmall),
                  Text(
                    CurrencyFormatter.formatINR(offer.totalOfferCost),
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // Selection Action Button
          AppButton(
            text: isSelected ? 'Offer Selected ✓' : 'Select Offer',
            variant: isSelected
                ? AppButtonVariant.primary
                : AppButtonVariant.outline,
            onPressed: onSelect,
          ),
        ],
      ),
    );
  }
}
