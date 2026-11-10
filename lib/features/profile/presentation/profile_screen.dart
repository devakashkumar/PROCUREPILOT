import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/router/app_routes.dart';
import '../../../core/theme/theme_provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../shared/components/app_bar_header.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/app_responsive_center.dart';
import '../../../shared/widgets/app_status_badge.dart';
import '../providers/profile_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  Future<void> _handleLogout(BuildContext context, WidgetRef ref) async {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Confirm Logout'),
        content: const Text(
          'Are you sure you want to log out of ProcurePilot AI? Your session tokens will be cleared.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(dialogContext);
              await ref.read(authStateProvider.notifier).logout();
              if (context.mounted) {
                context.go(AppRoutes.login);
              }
            },
            child: const Text(
              'Logout',
              style: TextStyle(color: AppColors.error),
            ),
          ),
        ],
      ),
    );
  }

  void _showSupportDialog(BuildContext context, String title, String message) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final currentThemeMode = ref.watch(themeModeProvider);
    final profileState = ref.watch(profileProvider);
    final user = profileState.user ?? ref.watch(authStateProvider).user;

    final name = (user?.name != null && user!.name.isNotEmpty)
        ? user.name
        : 'Store Owner';
    final email = (user?.email != null && user!.email.isNotEmpty)
        ? user.email
        : 'owner@globalretailmart.com';
    final storeName = (user?.storeName != null && user!.storeName!.isNotEmpty)
        ? user.storeName!
        : 'Global Retail Mart';

    return Scaffold(
      appBar: const ProcureAppBarHeader(
        title: 'Account & Settings',
        subtitle: 'Profile, Store Info & Preferences',
      ),
      body: SafeArea(
        child: AppResponsiveCenter(
          child: ListView(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.md,
            ),
            children: [
              // SECTION 1: PROFILE HEADER CARD
              AppCard(
                hasGradient: true,
                child: Column(
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 28,
                          backgroundColor: AppColors.primary,
                          child: Text(
                            name.isNotEmpty ? name[0].toUpperCase() : 'K',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 22,
                            ),
                          ),
                        ),
                        const SizedBox(width: AppSpacing.md),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                name,
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: isDark
                                      ? AppColors.textPrimaryDark
                                      : AppColors.textPrimaryLight,
                                ),
                              ),
                              Text(
                                storeName,
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: AppColors.secondary,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                email,
                                style: theme.textTheme.labelSmall?.copyWith(
                                  color: isDark
                                      ? AppColors.textSecondaryDark
                                      : AppColors.textSecondaryLight,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const AppStatusBadge(
                          label: 'Owner',
                          status: BadgeStatus.success,
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.md),
                    OutlinedButton.icon(
                      onPressed: () => context.push('/profile/edit'),
                      icon: const Icon(LucideIcons.edit3, size: 16),
                      label: const Text('Edit Profile'),
                      style: OutlinedButton.styleFrom(
                        visualDensity: VisualDensity.compact,
                        minimumSize: const Size.fromHeight(36),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.md),

              // SECTION 2: MY ACCOUNT
              Text(
                'My Account',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: AppSpacing.xs),
              AppCard(
                child: Column(
                  children: [
                    _SettingsTile(
                      icon: LucideIcons.user,
                      title: 'Personal Information',
                      subtitle: 'Name, phone & email',
                      onTap: () => context.push('/profile/edit'),
                    ),
                    const Divider(),
                    _SettingsTile(
                      icon: LucideIcons.store,
                      title: 'Business Information',
                      subtitle: 'Store details, address & GSTIN',
                      onTap: () => context.push('/profile/business'),
                    ),
                    const Divider(),
                    _SettingsTile(
                      icon: LucideIcons.settings,
                      title: 'Account Settings',
                      subtitle: 'Security & login preferences',
                      onTap: () => context.push('/profile/settings'),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.md),

              // SECTION 3: PROCUREMENT & ORDERS
              Text(
                'Procurement & Orders',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: AppSpacing.xs),
              AppCard(
                child: Column(
                  children: [
                    _SettingsTile(
                      icon: LucideIcons.shoppingBag,
                      title: 'My Orders',
                      subtitle: 'View purchase order history & status',
                      onTap: () => context.go(AppRoutes.orders),
                    ),
                    const Divider(),
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(
                        LucideIcons.sun,
                        size: 20,
                        color: AppColors.primary,
                      ),
                      title: const Text('Theme Appearance'),
                      subtitle: Text(
                        currentThemeMode == ThemeMode.dark
                            ? 'Dark Mode'
                            : currentThemeMode == ThemeMode.light
                            ? 'Light Mode'
                            : 'System Default',
                      ),
                      trailing: DropdownButton<ThemeMode>(
                        value: currentThemeMode,
                        underline: const SizedBox(),
                        onChanged: (newMode) {
                          if (newMode != null) {
                            ref
                                .read(themeModeProvider.notifier)
                                .setThemeMode(newMode);
                          }
                        },
                        items: const [
                          DropdownMenuItem(
                            value: ThemeMode.system,
                            child: Text('System'),
                          ),
                          DropdownMenuItem(
                            value: ThemeMode.light,
                            child: Text('Light'),
                          ),
                          DropdownMenuItem(
                            value: ThemeMode.dark,
                            child: Text('Dark'),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.md),

              // SECTION 4: SUPPORT & POLICIES
              Text(
                'Support & Legal',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: AppSpacing.xs),
              AppCard(
                child: Column(
                  children: [
                    _SettingsTile(
                      icon: LucideIcons.helpCircle,
                      title: 'Help & Support',
                      subtitle: 'ProcurePilot hotline & email support',
                      onTap: () => _showSupportDialog(
                        context,
                        'ProcurePilot Support',
                        'Email: support@procurepilot.ai\nPhone: +1 (800) 555-PROCURE\n24/7 AI procurement assistance available in-app.',
                      ),
                    ),
                    const Divider(),
                    _SettingsTile(
                      icon: LucideIcons.info,
                      title: 'About ProcurePilot AI',
                      subtitle: 'Version 1.0.0+1 • Global Enterprise AI Platform',
                      onTap: () => _showSupportDialog(
                        context,
                        'About ProcurePilot AI',
                        'ProcurePilot AI v1.0.0+1\nAI-powered global wholesale procurement platform for retail and enterprise store owners.',
                      ),
                    ),
                    const Divider(),
                    _SettingsTile(
                      icon: LucideIcons.shieldCheck,
                      title: 'Privacy Policy & Terms',
                      subtitle: 'Data security & terms of service',
                      onTap: () => _showSupportDialog(
                        context,
                        'Privacy Policy',
                        'ProcurePilot AI enforces strict data encryption. Session tokens and business credentials are securely stored using Android Keystore / iOS Keychain.',
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.lg),

              // SECTION 5: LOGOUT ACTION
              AppButton(
                text: 'Log Out of Account',
                variant: AppButtonVariant.outline,
                leadingIcon: LucideIcons.logOut,
                onPressed: () => _handleLogout(context, ref),
              ),

              const SizedBox(height: AppSpacing.xl),
            ],
          ),
        ),
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _SettingsTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Icon(icon, size: 20, color: AppColors.primary),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 12)),
      trailing: const Icon(LucideIcons.chevronRight, size: 18),
      onTap: onTap,
    );
  }
}
