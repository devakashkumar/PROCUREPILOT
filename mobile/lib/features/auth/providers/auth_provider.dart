import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/storage/secure_storage.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/network_provider.dart';
import '../services/auth_service.dart';

export '../../../providers/auth_provider.dart';

/// Provider for AuthService
final authServiceProvider = Provider<AuthService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return AuthService(apiClient);
});

/// Auth Controller Notifier extending StateNotifier for managing login & auth logic
class AuthControllerNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;
  final ISecureStorageService _storage;

  AuthControllerNotifier({
    required AuthService authService,
    required ISecureStorageService storage,
  }) : _authService = authService,
       _storage = storage,
       super(const AuthState());

  /// Perform standard Email/Password Login
  Future<bool> login({required String email, required String password}) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final authResponse = await _authService.login(
        email: email,
        password: password,
      );

      await _storage.saveAuthTokens(
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
      );

      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: authResponse.user,
        isLoading: false,
      );
      return true;
    } catch (e) {
      final errorMsg = e is Exception
          ? e
                .toString()
                .replaceAll('ApiException: ', '')
                .replaceAll('Exception: ', '')
          : 'Failed to sign in. Please try again.';

      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        errorMessage: errorMsg,
        isLoading: false,
      );
      return false;
    }
  }

  /// Perform Account Registration
  Future<bool> register({
    required String name,
    required String email,
    required String password,
    required String phone,
    required String storeName,
    String? gstNumber,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final authResponse = await _authService.register(
        name: name,
        email: email,
        password: password,
        phone: phone,
        storeName: storeName,
        gstNumber: gstNumber,
      );

      await _storage.saveAuthTokens(
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
      );

      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: authResponse.user,
        isLoading: false,
      );
      return true;
    } catch (e) {
      final errorMsg = e is Exception
          ? e
                .toString()
                .replaceAll('ApiException: ', '')
                .replaceAll('Exception: ', '')
          : 'Registration failed. Please check your information.';

      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        errorMessage: errorMsg,
        isLoading: false,
      );
      return false;
    }
  }

  /// Perform Demo Account Login
  Future<bool> demoLogin() async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final authResponse = await _authService.demoLogin();

      await _storage.saveAuthTokens(
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
      );

      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: authResponse.user,
        isLoading: false,
      );
      return true;
    } catch (e) {
      final errorMsg = e is Exception
          ? e
                .toString()
                .replaceAll('ApiException: ', '')
                .replaceAll('Exception: ', '')
          : 'Demo login unavailable. Please check backend connection.';

      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        errorMessage: errorMsg,
        isLoading: false,
      );
      return false;
    }
  }

  /// Clear error message state
  void clearError() {
    state = state.copyWith(errorMessage: null);
  }
}

final authControllerProvider =
    StateNotifierProvider<AuthControllerNotifier, AuthState>((ref) {
      final authService = ref.watch(authServiceProvider);
      final storage = ref.watch(secureStorageProvider);
      return AuthControllerNotifier(authService: authService, storage: storage);
    });
