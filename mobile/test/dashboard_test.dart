import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:procurepilot/app/app.dart';
import 'package:procurepilot/core/storage/secure_storage.dart';
import 'package:procurepilot/features/dashboard/providers/dashboard_provider.dart';
import 'package:procurepilot/providers/network_provider.dart';

class MockSecureStorage extends ISecureStorageService {
  final Map<String, String> _storage = {};

  @override
  Future<void> clearTokens() async => _storage.clear();
  @override
  Future<void> delete(String key) async => _storage.remove(key);
  @override
  Future<void> deleteAll() async => _storage.clear();
  @override
  Future<String?> getAccessToken() async => 'mock_token';
  @override
  Future<String?> getRefreshToken() async => 'mock_refresh';
  @override
  Future<String?> read(String key) async => _storage[key];
  @override
  Future<void> saveAccessToken(String token) async =>
      _storage['access_token'] = token;
  @override
  Future<void> saveAuthTokens({
    required String accessToken,
    required String refreshToken,
  }) async {}
  @override
  Future<void> saveRefreshToken(String token) async {}
  @override
  Future<void> write(String key, String value) async => _storage[key] = value;
}

void main() {
  testWidgets('Dashboard provider loads state cleanly', (
    WidgetTester tester,
  ) async {
    final container = ProviderContainer(
      overrides: [secureStorageProvider.overrideWithValue(MockSecureStorage())],
    );

    final state = container.read(dashboardProvider);
    expect(state, isA<DashboardState>());
    await tester.pump(const Duration(seconds: 1));
    container.dispose();
  });

  testWidgets('App renders ProcurePilotApp shell', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: ProcurePilotApp()));
    await tester.pump(const Duration(seconds: 3));
    expect(find.byType(ProcurePilotApp), findsOneWidget);
  });
}
