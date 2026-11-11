import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/router/app_routes.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../providers/auth_provider.dart';

class LoginForm extends ConsumerStatefulWidget {
  const LoginForm({super.key});

  @override
  ConsumerState<LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends ConsumerState<LoginForm> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _emailController;
  late TextEditingController _passwordController;
  bool _rememberMe = true;
  static const String _savedEmailKey = 'procurepilot_saved_login_email';

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController();
    _passwordController = TextEditingController();
    _loadRememberedEmail();
  }

  Future<void> _loadRememberedEmail() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedEmail = prefs.getString(_savedEmailKey);
      if (savedEmail != null && savedEmail.isNotEmpty && mounted) {
        setState(() {
          _emailController.text = savedEmail;
          _rememberMe = true;
        });
      }
    } catch (_) {}
  }

  Future<void> _saveRememberedEmail(String email) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      if (_rememberMe) {
        await prefs.setString(_savedEmailKey, email.trim());
      } else {
        await prefs.remove(_savedEmailKey);
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    FocusScope.of(context).unfocus();
    if (!(_formKey.currentState?.validate() ?? false)) return;

    final email = _emailController.text.trim();
    final password = _passwordController.text;

    await _saveRememberedEmail(email);

    final success = await ref
        .read(authControllerProvider.notifier)
        .login(email: email, password: password);

    if (success && mounted) {
      context.go(AppRoutes.dashboard);
    }
  }

  Future<void> _handleDemoLogin() async {
    FocusScope.of(context).unfocus();
    final success = await ref.read(authControllerProvider.notifier).demoLogin();

    if (success && mounted) {
      context.go(AppRoutes.dashboard);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final authState = ref.watch(authControllerProvider);
    final isLoading = authState.isLoading;

    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Inline Error Feedback Banner
          if (authState.errorMessage != null) ...[
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.sm,
              ),
              margin: const EdgeInsets.only(bottom: AppSpacing.md),
              decoration: BoxDecoration(
                color: isDark ? AppColors.errorBgDark : AppColors.errorBgLight,
                borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                border: Border.all(
                  color: AppColors.error.withValues(alpha: 0.3),
                ),
              ),
              child: Row(
                children: [
                  const Icon(
                    LucideIcons.alertTriangle,
                    color: AppColors.error,
                    size: 18,
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Text(
                      authState.errorMessage!,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: AppColors.error,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(
                      LucideIcons.x,
                      size: 16,
                      color: AppColors.error,
                    ),
                    onPressed: () {
                      ref.read(authControllerProvider.notifier).clearError();
                    },
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
            ),
          ],

          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Email Field
                AppTextField(
                  label: 'Email Address',
                  hint: 'owner@kiranastore.com',
                  controller: _emailController,
                  prefixIcon: LucideIcons.mail,
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.next,
                  enabled: !isLoading,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Please enter your email address.';
                    }
                    final emailRegex = RegExp(
                      r'^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$',
                    );
                    if (!emailRegex.hasMatch(value.trim())) {
                      return 'Please enter a valid email address.';
                    }
                    return null;
                  },
                ),

                const SizedBox(height: AppSpacing.md),

                // Password Field
                AppTextField(
                  label: 'Password',
                  hint: 'Enter your account password',
                  controller: _passwordController,
                  prefixIcon: LucideIcons.lock,
                  isPassword: true,
                  textInputAction: TextInputAction.done,
                  enabled: !isLoading,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your password.';
                    }
                    if (value.length < 4) {
                      return 'Password must be at least 4 characters.';
                    }
                    return null;
                  },
                ),

                const SizedBox(height: AppSpacing.sm),

                // Remember Me Row
                Row(
                  children: [
                    SizedBox(
                      width: 24,
                      height: 24,
                      child: Checkbox(
                        value: _rememberMe,
                        activeColor: AppColors.primary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(4),
                        ),
                        onChanged: isLoading
                            ? null
                            : (val) {
                                setState(() {
                                  _rememberMe = val ?? false;
                                });
                              },
                      ),
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    GestureDetector(
                      onTap: isLoading
                          ? null
                          : () {
                              setState(() {
                                _rememberMe = !_rememberMe;
                              });
                            },
                      child: Text(
                        'Remember me on this device',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: isDark
                              ? AppColors.textSecondaryDark
                              : AppColors.textSecondaryLight,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: AppSpacing.lg),

                // Primary Sign In Button
                AppButton(
                  text: 'Sign In',
                  variant: AppButtonVariant.primary,
                  isLoading: isLoading,
                  onPressed: isLoading ? null : _handleLogin,
                  trailingIcon: LucideIcons.arrowRight,
                ),

                const SizedBox(height: AppSpacing.md),

                // Demo Account Section Divider
                Row(
                  children: [
                    const Expanded(child: Divider()),
                    Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.sm,
                      ),
                      child: Text(
                        'OR',
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: isDark
                              ? AppColors.textMutedDark
                              : AppColors.textMutedLight,
                        ),
                      ),
                    ),
                    const Expanded(child: Divider()),
                  ],
                ),

                const SizedBox(height: AppSpacing.md),

                // Explore Demo Account Button
                AppButton(
                  text: 'Explore Demo Account',
                  variant: AppButtonVariant.aiGradient,
                  isLoading: isLoading,
                  leadingIcon: LucideIcons.sparkles,
                  onPressed: isLoading ? null : _handleDemoLogin,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
