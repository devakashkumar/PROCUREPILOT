import 'package:flutter_secure_storage/flutter_secure_storage.dart';

abstract class ISecureStorageService {
  Future<String?> getAccessToken();
  Future<void> saveAccessToken(String token);
  Future<String?> getRefreshToken();
  Future<void> saveRefreshToken(String token);
  Future<void> saveAuthTokens({
    required String accessToken,
    required String refreshToken,
  });
  Future<void> clearTokens();
  Future<String?> read(String key);
  Future<void> write(String key, String value);
  Future<void> delete(String key);
  Future<void> deleteAll();
}

class SecureStorageService implements ISecureStorageService {
  final FlutterSecureStorage _storage;

  static const String _accessTokenKey = 'procurepilot_access_token';
  static const String _refreshTokenKey = 'procurepilot_refresh_token';
  static const String _userDataKey = 'procurepilot_user_data';

  SecureStorageService({FlutterSecureStorage? storage})
    : _storage =
          storage ??
          const FlutterSecureStorage(
            aOptions: AndroidOptions(encryptedSharedPreferences: true),
            iOptions: IOSOptions(
              accessibility: KeychainAccessibility.first_unlock,
            ),
          );

  @override
  Future<String?> getAccessToken() async {
    return await _storage.read(key: _accessTokenKey);
  }

  @override
  Future<void> saveAccessToken(String token) async {
    await _storage.write(key: _accessTokenKey, value: token);
  }

  @override
  Future<String?> getRefreshToken() async {
    return await _storage.read(key: _refreshTokenKey);
  }

  @override
  Future<void> saveRefreshToken(String token) async {
    await _storage.write(key: _refreshTokenKey, value: token);
  }

  @override
  Future<void> saveAuthTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await saveAccessToken(accessToken);
    await saveRefreshToken(refreshToken);
  }

  @override
  Future<void> clearTokens() async {
    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _refreshTokenKey);
    await _storage.delete(key: _userDataKey);
  }

  @override
  Future<String?> read(String key) async {
    return await _storage.read(key: key);
  }

  @override
  Future<void> write(String key, String value) async {
    await _storage.write(key: key, value: value);
  }

  @override
  Future<void> delete(String key) async {
    await _storage.delete(key: key);
  }

  @override
  Future<void> deleteAll() async {
    await _storage.deleteAll();
  }
}
