import 'dart:async';
import 'package:dio/dio.dart';
import '../constants/api_constants.dart';
import '../storage/secure_storage.dart';

/// Central Token Manager managing token retrieval, caching, and refresh operations.
class TokenManager {
  final ISecureStorageService _storage;
  String? _cachedAccessToken;
  String? _cachedRefreshToken;
  bool _isRefreshing = false;
  Completer<String?>? _refreshCompleter;

  TokenManager(this._storage);

  Future<String?> getAccessToken() async {
    _cachedAccessToken ??= await _storage.getAccessToken();
    return _cachedAccessToken;
  }

  Future<String?> getRefreshToken() async {
    _cachedRefreshToken ??= await _storage.getRefreshToken();
    return _cachedRefreshToken;
  }

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    _cachedAccessToken = accessToken;
    _cachedRefreshToken = refreshToken;
    await _storage.saveAuthTokens(
      accessToken: accessToken,
      refreshToken: refreshToken,
    );
  }

  Future<void> clearTokens() async {
    _cachedAccessToken = null;
    _cachedRefreshToken = null;
    await _storage.clearTokens();
  }

  /// Thread-safe refresh token execution.
  /// If multiple requests hit 401 concurrently, only ONE refresh HTTP request is made.
  Future<String?> refreshToken(Dio refreshDio) async {
    if (_isRefreshing) {
      return _refreshCompleter?.future;
    }

    _isRefreshing = true;
    _refreshCompleter = Completer<String?>();

    try {
      final currentRefreshToken = await getRefreshToken();
      if (currentRefreshToken == null || currentRefreshToken.isEmpty) {
        await clearTokens();
        _refreshCompleter?.complete(null);
        return null;
      }

      final response = await refreshDio.post(
        ApiConstants.refreshToken,
        data: {'refreshToken': currentRefreshToken},
        options: Options(
          headers: {
            ApiConstants.contentTypeHeader: ApiConstants.jsonContentType,
          },
        ),
      );

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        final newAccessToken =
            data['accessToken'] ?? data['data']?['accessToken'];
        final newRefreshToken =
            data['refreshToken'] ??
            data['data']?['refreshToken'] ??
            currentRefreshToken;

        if (newAccessToken != null && newAccessToken is String) {
          await saveTokens(
            accessToken: newAccessToken,
            refreshToken: newRefreshToken as String,
          );
          _refreshCompleter?.complete(newAccessToken);
          return newAccessToken;
        }
      }

      await clearTokens();
      _refreshCompleter?.complete(null);
      return null;
    } catch (e) {
      await clearTokens();
      _refreshCompleter?.complete(null);
      return null;
    } finally {
      _isRefreshing = false;
    }
  }
}
