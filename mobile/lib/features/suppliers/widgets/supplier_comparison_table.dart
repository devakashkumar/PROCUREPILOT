import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/widgets/app_card.dart';
import '../models/supplier.dart';

class SupplierComparisonTable extends StatelessWidget {
  final List<SupplierOffer> offers;
  final ValueChanged<SupplierOffer> onSelectOffer;

  const SupplierComparisonTable({
    super.key,
    required this.offers,
    required this.onSelectOffer,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    if (offers.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(LucideIcons.columns, size: 18, color: AppColors.primary),
            const SizedBox(width: AppSpacing.xs),
            Text(
              'Supplier Comparison Matrix',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),

        // Scrollable horizontal matrix cards
        SizedBox(
          height: 180,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: offers.length,
            separatorBuilder: (_, index) =>
                const SizedBox(width: AppSpacing.sm),
            itemBuilder: (context, index) {
              final offer = offers[index];
              return SizedBox(
                width: 220,
                child: AppCard(
                  onTap: () => onSelectOffer(offer),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Flexible(
                            child: Text(
                              offer.supplier.name,
                              style: theme.textTheme.titleSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Row(
                            children: [
                              const Icon(
                                LucideIcons.star,
                                size: 12,
                                color: AppColors.warning,
                              ),
                              const SizedBox(width: 2),
                              Text(
                                offer.supplier.reliabilityScore.toStringAsFixed(
                                  1,
                                ),
                                style: theme.textTheme.labelSmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const Divider(),
                      _ComparisonRow(
                        label: 'Offer Price',
                        value: CurrencyFormatter.formatINR(
                          offer.totalOfferCost,
                        ),
                        isHighlight: offer.isCheapest,
                        isDark: isDark,
                      ),
                      _ComparisonRow(
                        label: 'Delivery',
                        value: '${offer.deliveryDays} Days',
                        isHighlight: offer.isFastest,
                        isDark: isDark,
                      ),
                      _ComparisonRow(
                        label: 'Stock',
                        value: offer.stockAvailable
                            ? 'In Stock'
                            : 'Out of Stock',
                        isHighlight: offer.stockAvailable,
                        isDark: isDark,
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _ComparisonRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isHighlight;
  final bool isDark;

  const _ComparisonRow({
    required this.label,
    required this.value,
    this.isHighlight = false,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: theme.textTheme.labelSmall?.copyWith(
            color: isDark
                ? AppColors.textSecondaryDark
                : AppColors.textSecondaryLight,
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: isHighlight
              ? BoxDecoration(
                  color: isDark
                      ? AppColors.primaryContainerDark
                      : AppColors.primaryContainerLight,
                  borderRadius: BorderRadius.circular(4),
                )
              : null,
          child: Text(
            value,
            style: theme.textTheme.labelSmall?.copyWith(
              fontWeight: isHighlight ? FontWeight.bold : FontWeight.w600,
              color: isHighlight ? AppColors.primary : null,
            ),
          ),
        ),
      ],
    );
  }
}
