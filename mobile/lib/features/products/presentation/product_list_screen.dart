import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/router/app_routes.dart';
import '../../../shared/components/app_bar_header.dart';
import '../../../shared/widgets/app_empty_state.dart';
import '../../../shared/widgets/app_error_widget.dart';
import '../../../shared/widgets/app_responsive_center.dart';
import '../../../shared/widgets/app_skeleton.dart';
import '../../cart/providers/cart_provider.dart';
import '../providers/product_provider.dart';
import '../widgets/product_card.dart';
import '../widgets/product_detail_bottom_sheet.dart';
import '../widgets/product_filter_bar.dart';
import '../widgets/product_search_bar.dart';

class ProductListScreen extends ConsumerWidget {
  const ProductListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final productState = ref.watch(productProvider);
    final cartState = ref.watch(cartProvider);

    return Scaffold(
      appBar: ProcureAppBarHeader(
        title: 'Product Discovery',
        subtitle: 'Find everything your business needs.',
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(LucideIcons.shoppingBag, size: 22),
                onPressed: () => context.push(AppRoutes.cart),
              ),
              if (cartState.totalItemCount > 0) ...[
                Positioned(
                  right: 6,
                  top: 6,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: AppColors.secondary,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      '${cartState.totalItemCount}',
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: AppColors.backgroundDark,
                        fontWeight: FontWeight.bold,
                        fontSize: 10,
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(width: AppSpacing.xs),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => ref.read(productProvider.notifier).refresh(),
          color: AppColors.primary,
          child: AppResponsiveCenter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: AppSpacing.sm),

                // Search Bar
                ProductSearchBar(
                  onChanged: (query) {
                    ref.read(productProvider.notifier).search(query);
                  },
                ),

                const SizedBox(height: AppSpacing.sm),

                // Category Filter Bar
                ProductFilterBar(
                  categories: productState.categories,
                  selectedCategory: productState.selectedCategory,
                  onSelectCategory: (cat) {
                    ref.read(productProvider.notifier).selectCategory(cat);
                  },
                ),

                const SizedBox(height: AppSpacing.md),

                // Products View Content
                Expanded(
                  child: _buildProductContent(
                    context,
                    ref,
                    theme,
                    isDark,
                    productState,
                    cartState,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildProductContent(
    BuildContext context,
    WidgetRef ref,
    ThemeData theme,
    bool isDark,
    ProductState state,
    CartState cartState,
  ) {
    if (state.isLoading && !state.isRefreshing) {
      return ListView.builder(
        padding: const EdgeInsets.only(bottom: AppSpacing.md),
        itemCount: 4,
        itemBuilder: (context, index) => const Padding(
          padding: EdgeInsets.only(bottom: AppSpacing.sm),
          child: AppCardSkeleton(),
        ),
      );
    }

    if (state.errorMessage != null && state.products.isEmpty) {
      return AppErrorWidget(
        message: state.errorMessage!,
        onRetry: () => ref.read(productProvider.notifier).refresh(),
      );
    }

    if (state.filteredProducts.isEmpty) {
      return AppEmptyState(
        title: 'No Products Found',
        description: state.searchQuery.isNotEmpty
            ? 'No wholesale products match "${state.searchQuery}". Try a different search term.'
            : 'No products available under category "${state.selectedCategory}".',
        icon: LucideIcons.packageSearch,
        actionLabel: 'Clear Search & Filters',
        onActionPressed: () {
          ref.read(productProvider.notifier).search('');
          ref.read(productProvider.notifier).selectCategory('All');
        },
      );
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final crossAxisCount = constraints.maxWidth > 600 ? 3 : 2;

        return GridView.builder(
          padding: const EdgeInsets.only(bottom: AppSpacing.xl),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            childAspectRatio: 0.64,
            crossAxisSpacing: AppSpacing.sm,
            mainAxisSpacing: AppSpacing.sm,
          ),
          itemCount: state.filteredProducts.length,
          itemBuilder: (context, index) {
            final product = state.filteredProducts[index];
            final selectedQty = cartState.getItemQuantity(product.id);

            return ProductCard(
              product: product,
              selectedQuantity: selectedQty,
              onQuantityChanged: (qty) {
                ref.read(cartProvider.notifier).addOrUpdateItem(product, qty);
              },
              onTap: () {
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  backgroundColor: Colors.transparent,
                  builder: (ctx) => ProductDetailBottomSheet(
                    product: product,
                    initialQuantity: selectedQty,
                    onQuantityConfirmed: (confirmedQty) {
                      ref
                          .read(cartProvider.notifier)
                          .addOrUpdateItem(product, confirmedQty);
                    },
                  ),
                );
              },
            );
          },
        );
      },
    );
  }
}
