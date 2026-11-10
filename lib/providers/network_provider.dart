import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/network/api_client.dart';
import '../core/network/api_config.dart';
import '../core/network/token_manager.dart';
import '../core/storage/secure_storage.dart';

/// Secure Storage Provider
final secureStorageProvider = Provider<ISecureStorageService>((ref) {
  return SecureStorageService();
});

/// Token Manager Provider
final tokenManagerProvider = Provider<TokenManager>((ref) {
  final storage = ref.watch(secureStorageProvider);
  return TokenManager(storage);
});

/// API Config Provider
final apiConfigProvider = Provider<ApiConfig>((ref) {
  return const ApiConfig();
});

/// Centralized ApiClient Provider
final apiClientProvider = Provider<ApiClient>((ref) {
  final tokenManager = ref.watch(tokenManagerProvider);
  final config = ref.watch(apiConfigProvider);

  return ApiClient(
    tokenManager: tokenManager,
    config: config,
    onSessionExpired: () {
      // Session expiration handler logic (e.g. notify auth state)
    },
  );
});
