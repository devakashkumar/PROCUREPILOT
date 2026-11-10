import 'package:flutter_test/flutter_test.dart';
import 'package:procurepilot/core/network/api_client.dart';
import 'package:procurepilot/core/network/token_manager.dart';
import 'package:procurepilot/core/storage/secure_storage.dart';
import 'package:procurepilot/features/auth/services/auth_service.dart';

class MockSecureStorage extends ISecureStorageService {
  final Map<String, String> _storage = {};

  @override
  Future<void> clearTokens() async => _storage.clear();
  @override
  Future<void> delete(String key) async => _storage.remove(key);
  @override
  Future<void> deleteAll() async => _storage.clear();
  @override
  Future<String?> getAccessToken() async => _storage['access_token'];
  @override
  Future<String?> getRefreshToken() async => _storage['refresh_token'];
  @override
  Future<String?> read(String key) async => _storage[key];
  @override
  Future<void> saveAccessToken(String token) async =>
      _storage['access_token'] = token;
  @override
  Future<void> saveAuthTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    _storage['access_token'] = accessToken;
    _storage['refresh_token'] = refreshToken;
  }

  @override
  Future<void> saveRefreshToken(String token) async =>
      _storage['refresh_token'] = token;
  @override
  Future<void> write(String key, String value) async => _storage[key] = value;
}

void main() {
  late MockSecureStorage mockStorage;
  late TokenManager tokenManager;
  late ApiClient apiClient;
  late AuthService authService;

  setUp(() {
    mockStorage = MockSecureStorage();
    tokenManager = TokenManager(mockStorage);
    apiClient = ApiClient(tokenManager: tokenManager);
    authService = AuthService(apiClient);
  });

  test('AuthService demo login uses correct credentials', () {
    expect(AuthService.demoEmail, 'demo@procurepilot.ai');
    expect(AuthService.demoPassword, 'Demo@12345');
    expect(authService, isNotNull);
  });

  test('Mock storage saves and retrieves tokens correctly', () async {
    await mockStorage.saveAuthTokens(
      accessToken: 'sample_access_token',
      refreshToken: 'sample_refresh_token',
    );
    final accessToken = await mockStorage.getAccessToken();
    final refreshToken = await mockStorage.getRefreshToken();

    expect(accessToken, 'sample_access_token');
    expect(refreshToken, 'sample_refresh_token');
  });
}
