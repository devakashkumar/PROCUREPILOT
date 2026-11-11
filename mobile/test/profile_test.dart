import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:procurepilot/features/profile/presentation/business_profile_screen.dart';
import 'package:procurepilot/features/profile/presentation/edit_profile_screen.dart';
import 'package:procurepilot/features/profile/presentation/profile_screen.dart';
import 'package:procurepilot/features/profile/presentation/settings_screen.dart';
import 'package:procurepilot/features/profile/providers/profile_provider.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('ProfileNotifier updates profile state cleanly', () async {
    final container = ProviderContainer();
    addTearDown(container.dispose);

    final notifier = container.read(profileProvider.notifier);
    final success = await notifier.updateProfile(
      name: 'Sharma Owner',
      phone: '9876543210',
      storeName: 'Sharma Kirana Store',
      storeAddress: 'Mumbai, MH',
      gstNumber: '22AAAAA0000A1Z5',
    );

    expect(success, isTrue);
    expect(container.read(profileProvider).user?.name, 'Sharma Owner');
  });

  testWidgets('ProfileScreen renders main profile sections', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      const ProviderScope(child: MaterialApp(home: ProfileScreen())),
    );
    await tester.pump(const Duration(seconds: 1));
    expect(find.byType(ProfileScreen), findsOneWidget);
  });

  testWidgets('EditProfileScreen renders edit form', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      const ProviderScope(child: MaterialApp(home: EditProfileScreen())),
    );
    await tester.pump(const Duration(seconds: 1));
    expect(find.byType(EditProfileScreen), findsOneWidget);
  });

  testWidgets('BusinessProfileScreen renders business details', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      const ProviderScope(child: MaterialApp(home: BusinessProfileScreen())),
    );
    await tester.pump(const Duration(seconds: 1));
    expect(find.byType(BusinessProfileScreen), findsOneWidget);
  });

  testWidgets('SettingsScreen renders account settings', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      const ProviderScope(child: MaterialApp(home: SettingsScreen())),
    );
    await tester.pump(const Duration(seconds: 1));
    expect(find.byType(SettingsScreen), findsOneWidget);
  });
}
