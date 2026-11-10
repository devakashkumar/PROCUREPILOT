import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/currency/currency_provider.dart';
import '../../../core/router/app_routes.dart';
import '../../../core/theme/theme_provider.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/utils/language_provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../shared/components/app_bar_header.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/app_responsive_center.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

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

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final currentThemeMode = ref.watch(themeModeProvider);

    return Scaffold(
      appBar: const ProcureAppBarHeader(
        title: 'Account Settings',
        subtitle: 'App Theme, Security & Session',
      ),
      body: SafeArea(
        child: AppResponsiveCenter(
          child: ListView(
            padding: const EdgeInsets.all(AppSpacing.md),
            children: [
              Text(
                'Appearance & Global Preferences',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: AppSpacing.xs),
              AppCard(
                child: Column(
                  children: [
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(
                        LucideIcons.sun,
                        size: 20,
                        color: AppColors.primary,
                      ),
                      title: const Text('Theme Preference'),
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
                    const Divider(),
                    Consumer(
                      builder: (ctx, watchRef, _) {
                        final activeCurrency = watchRef.watch(currencyProvider);
                        return ListTile(
                          contentPadding: EdgeInsets.zero,
                          leading: const Icon(
                            LucideIcons.coins,
                            size: 20,
                            color: AppColors.primary,
                          ),
                          title: const Text('Global Currency'),
                          subtitle: Text(
                            'Active: $activeCurrency (${CurrencyFormatter.supportedCurrencies[activeCurrency]?.symbol ?? ''})',
                          ),
                          trailing: DropdownButton<String>(
                            value: activeCurrency,
                            underline: const SizedBox(),
                            onChanged: (newCode) {
                              if (newCode != null) {
                                watchRef
                                    .read(currencyProvider.notifier)
                                    .setCurrency(newCode);
                              }
                            },
                            items: CurrencyFormatter.supportedCurrencies.entries
                                .map((e) {
                                  return DropdownMenuItem(
                                    value: e.key,
                                    child: Text(
                                      '${e.key} (${e.value.symbol.trim()})',
                                    ),
                                  );
                                })
                                .toList(),
                          ),
                        );
                      },
                    ),
                    const Divider(),
                    Consumer(
                      builder: (ctx, watchRef, _) {
                        final activeLanguage = watchRef.watch(languageProvider);
                        const languages = [
                          'English (US)',
                          'Spanish (Español)',
                          'French (Français)',
                          'German (Deutsch)',
                        ];
                        return ListTile(
                          contentPadding: EdgeInsets.zero,
                          leading: const Icon(
                            LucideIcons.globe,
                            size: 20,
                            color: AppColors.primary,
                          ),
                          title: const Text('Display Language'),
                          subtitle: Text('Active: $activeLanguage'),
                          trailing: DropdownButton<String>(
                            value: activeLanguage,
                            underline: const SizedBox(),
                            onChanged: (newLang) {
                              if (newLang != null) {
                                watchRef
                                    .read(languageProvider.notifier)
                                    .setLanguage(newLang);
                              }
                            },
                            items: languages.map((lang) {
                              return DropdownMenuItem(
                                value: lang,
                                child: Text(lang),
                              );
                            }).toList(),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.md),

              Text(
                'Security & Session',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: AppSpacing.xs),
              AppCard(
                child: Column(
                  children: [
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(
                        LucideIcons.shieldCheck,
                        size: 20,
                        color: AppColors.primary,
                      ),
                      title: const Text('Token Encryption'),
                      subtitle: const Text(
                        'Tokens stored in Flutter Secure Storage',
                      ),
                    ),
                    const Divider(),
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(
                        LucideIcons.lock,
                        size: 20,
                        color: AppColors.primary,
                      ),
                      title: const Text('Change Password'),
                      subtitle: const Text('Update account security password'),
                      trailing: const Icon(LucideIcons.chevronRight, size: 18),
                      onTap: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text(
                              'Password reset link sent to your registered email.',
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.xl),

              AppButton(
                text: 'Log Out of Account',
                variant: AppButtonVariant.outline,
                leadingIcon: LucideIcons.logOut,
                onPressed: () => _handleLogout(context, ref),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
