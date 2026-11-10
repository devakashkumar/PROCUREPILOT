import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_constants.dart';
import '../core/network/api_client.dart';
import '../core/network/api_exception.dart';
import '../core/storage/secure_storage.dart';
import '../models/user_model.dart';
import 'network_provider.dart';

enum AuthStatus { initial, unauthenticated, authenticated }

class AuthState {
  final AuthStatus status;
  final UserModel? user;
  final String? errorMessage;
  final bool isLoading;

  const AuthState({
    this.status = AuthStatus.initial,
    this.user,
    this.errorMessage,
    this.isLoading = false,
  });

  AuthState copyWith({
    AuthStatus? status,
    UserModel? user,
    String? errorMessage,
    bool? isLoading,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      errorMessage: errorMessage,
      isLoading: isLoading ?? this.isLoading,
    );
  }

  bool get isAuthenticated => status == AuthStatus.authenticated;
}

class AuthStateNotifier extends StateNotifier<AuthState> {
  final ISecureStorageService _storage;
  final ApiClient? _apiClient;

  AuthStateNotifier(this._storage, [this._apiClient])
    : super(const AuthState());

  /// Initializes services and checks token / session validity
  Future<bool> checkAuthStatus() async {
    state = state.copyWith(isLoading: true);
    try {
      final token = await _storage.getAccessToken();
      if (token == null || token.isEmpty) {
        state = state.copyWith(
          status: AuthStatus.unauthenticated,
          isLoading: false,
        );
        return false;
      }

      // If ApiClient is available, attempt endpoint session validation
      if (_apiClient != null) {
        try {
          final responseData = await _apiClient.get(ApiConstants.me);
          if (responseData != null) {
            final jsonMap = responseData is Map<String, dynamic>
                ? (responseData['data'] as Map<String, dynamic>? ??
                      responseData)
                : <String, dynamic>{};
            final user = UserModel.fromJson(jsonMap);
            state = state.copyWith(
              status: AuthStatus.authenticated,
              user: user,
              isLoading: false,
            );
            return true;
          }
        } on ApiException catch (apiException) {
          if (apiException.type == ApiExceptionType.unauthorized ||
              apiException.type == ApiExceptionType.forbidden ||
              apiException.type == ApiExceptionType.refreshTokenExpired) {
            await logout();
            return false;
          }
          // On network errors or timeouts, trust cached stored token for offline experience
          state = state.copyWith(
            status: AuthStatus.authenticated,
            isLoading: false,
          );
          return true;
        } catch (_) {
          // Unexpected parsing error, fallback to unauthenticated or stored token
        }
      }

      state = state.copyWith(
        status: AuthStatus.authenticated,
        isLoading: false,
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        errorMessage: e.toString(),
        isLoading: false,
      );
      return false;
    }
  }

  Future<void> setAuthenticatedUser(
    UserModel user,
    String accessToken,
    String refreshToken,
  ) async {
    await _storage.saveAuthTokens(
      accessToken: accessToken,
      refreshToken: refreshToken,
    );
    state = state.copyWith(
      status: AuthStatus.authenticated,
      user: user,
      isLoading: false,
    );
  }

  Future<void> logout() async {
    await _storage.clearTokens();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }
}

final authStateProvider = StateNotifierProvider<AuthStateNotifier, AuthState>((
  ref,
) {
  final storage = ref.watch(secureStorageProvider);
  final apiClient = ref.watch(apiClientProvider);
  return AuthStateNotifier(storage, apiClient);
});
