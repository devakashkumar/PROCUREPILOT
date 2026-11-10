import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../shared/components/app_bar_header.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/app_responsive_center.dart';
import '../../../shared/widgets/app_status_badge.dart';
import '../providers/profile_provider.dart';

class BusinessProfileScreen extends ConsumerWidget {
  const BusinessProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final profileState = ref.watch(profileProvider);
    final user = profileState.user;

    final storeName = (user?.storeName != null && user!.storeName!.isNotEmpty)
        ? user.storeName!
        : 'Global Retail Mart';
    final gst = (user?.gstNumber != null && user!.gstNumber!.isNotEmpty)
        ? user.gstNumber!
        : 'US987654321';
    final address =
        (user?.storeAddress != null && user!.storeAddress!.isNotEmpty)
        ? user.storeAddress!
        : '123 Commerce St, New York, NY';

    return Scaffold(
      appBar: const ProcureAppBarHeader(
        title: 'Business Information',
        subtitle: 'Store Details & Registration',
      ),
      body: SafeArea(
        child: AppResponsiveCenter(
          child: ListView(
            padding: const EdgeInsets.all(AppSpacing.md),
            children: [
              // Store Header Card
              AppCard(
                hasGradient: true,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Row(
                            children: [
                              CircleAvatar(
                                radius: 20,
                                backgroundColor: AppColors.primary,
                                child: const Icon(
                                  LucideIcons.store,
                                  color: Colors.white,
                                  size: 20,
                                ),
                              ),
                              const SizedBox(width: AppSpacing.sm),
                              Expanded(
                                child: Text(
                                  storeName,
                                  style: theme.textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: isDark
                                        ? AppColors.textPrimaryDark
                                        : AppColors.textPrimaryLight,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 4),
                        const AppStatusBadge(
                          label: 'Verified Business',
                          status: BadgeStatus.success,
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      'Tax ID / Business Reg: $gst',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: AppColors.secondary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.md),

              // Business Info Breakdown Card
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Registered Business Details',
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    const Divider(),
                    const SizedBox(height: AppSpacing.xs),

                    _InfoRow(
                      icon: LucideIcons.user,
                      label: 'Business Owner',
                      value: user?.name ?? 'Sharma Owner',
                      isDark: isDark,
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    _InfoRow(
                      icon: LucideIcons.phone,
                      label: 'Contact Phone',
                      value: user?.phone ?? '9876543210',
                      isDark: isDark,
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    _InfoRow(
                      icon: LucideIcons.mail,
                      label: 'Account Email',
                      value: user?.email ?? 'owner@kiranastore.com',
                      isDark: isDark,
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    _InfoRow(
                      icon: LucideIcons.mapPin,
                      label: 'Store Address',
                      value: address,
                      isDark: isDark,
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    _InfoRow(
                      icon: LucideIcons.shieldCheck,
                      label: 'ProcurePilot Role',
                      value: user?.role ?? 'STORE_OWNER',
                      isDark: isDark,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.xl),

              AppButton(
                text: 'Edit Business Information',
                variant: AppButtonVariant.primary,
                leadingIcon: LucideIcons.edit3,
                onPressed: () => context.push('/profile/edit'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final bool isDark;

  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: AppColors.primary),
        const SizedBox(width: AppSpacing.sm),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: theme.textTheme.labelSmall?.copyWith(
                  color: isDark
                      ? AppColors.textSecondaryDark
                      : AppColors.textSecondaryLight,
                ),
              ),
              Text(
                value,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
