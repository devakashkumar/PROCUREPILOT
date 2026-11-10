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
import '../../../shared/widgets/app_text_field.dart';
import '../providers/profile_provider.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _storeNameController;
  late TextEditingController _storeAddressController;
  late TextEditingController _gstController;

  @override
  void initState() {
    super.initState();
    final user = ref.read(profileProvider).user;
    _nameController = TextEditingController(text: user?.name ?? '');
    _phoneController = TextEditingController(text: user?.phone ?? '');
    _storeNameController = TextEditingController(text: user?.storeName ?? '');
    _storeAddressController = TextEditingController(
      text: user?.storeAddress ?? '',
    );
    _gstController = TextEditingController(text: user?.gstNumber ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _storeNameController.dispose();
    _storeAddressController.dispose();
    _gstController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    FocusScope.of(context).unfocus();
    if (!(_formKey.currentState?.validate() ?? false)) return;

    final success = await ref
        .read(profileProvider.notifier)
        .updateProfile(
          name: _nameController.text.trim(),
          phone: _phoneController.text.trim(),
          storeName: _storeNameController.text.trim(),
          storeAddress: _storeAddressController.text.trim(),
          gstNumber: _gstController.text.trim(),
        );

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Profile updated successfully!'),
          backgroundColor: AppColors.success,
        ),
      );
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final profileState = ref.watch(profileProvider);

    return Scaffold(
      appBar: const ProcureAppBarHeader(
        title: 'Edit Profile',
        subtitle: 'Update Personal & Store Details',
      ),
      body: SafeArea(
        child: AppResponsiveCenter(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Error Alert
                  if (profileState.errorMessage != null) ...[
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      margin: const EdgeInsets.only(bottom: AppSpacing.md),
                      decoration: BoxDecoration(
                        color: isDark
                            ? AppColors.errorBgDark
                            : AppColors.errorBgLight,
                        borderRadius: BorderRadius.circular(
                          AppSpacing.radiusMd,
                        ),
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
                              profileState.errorMessage!,
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: AppColors.error,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  AppCard(
                    child: Column(
                      children: [
                        AppTextField(
                          label: 'Full Name',
                          hint: 'Enter your full name',
                          controller: _nameController,
                          prefixIcon: LucideIcons.user,
                          enabled: !profileState.isUpdating,
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'Please enter your name.';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: AppSpacing.md),

                        AppTextField(
                          label: 'Mobile Phone Number',
                          hint: '9876543210',
                          controller: _phoneController,
                          prefixIcon: LucideIcons.phone,
                          keyboardType: TextInputType.phone,
                          enabled: !profileState.isUpdating,
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'Please enter your mobile number.';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: AppSpacing.md),

                        AppTextField(
                          label: 'Store Name',
                          hint: 'Global Retail Mart',
                          controller: _storeNameController,
                          prefixIcon: LucideIcons.store,
                          enabled: !profileState.isUpdating,
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'Please enter your store name.';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: AppSpacing.md),

                        AppTextField(
                          label: 'Store Address',
                          hint: '123 Commerce St, New York, NY',
                          controller: _storeAddressController,
                          prefixIcon: LucideIcons.mapPin,
                          enabled: !profileState.isUpdating,
                        ),
                        const SizedBox(height: AppSpacing.md),

                        AppTextField(
                          label: 'Tax ID / Business Reg (Optional)',
                          hint: 'US987654321',
                          controller: _gstController,
                          prefixIcon: LucideIcons.fileText,
                          enabled: !profileState.isUpdating,
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: AppSpacing.xl),

                  AppButton(
                    text: 'Save Changes',
                    variant: AppButtonVariant.primary,
                    isLoading: profileState.isUpdating,
                    leadingIcon: LucideIcons.check,
                    onPressed: profileState.isUpdating ? null : _handleSave,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
