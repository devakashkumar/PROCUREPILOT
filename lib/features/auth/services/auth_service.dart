import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_exception.dart';
import '../../../models/user_model.dart';

class AuthResponse {
  final UserModel user;
  final String accessToken;
  final String refreshToken;

  const AuthResponse({
    required this.user,
    required this.accessToken,
    required this.refreshToken,
  });
}

class AuthService {
  final ApiClient _apiClient;

  // Demo Credentials configured for Kirana store owner
  static const String demoEmail = 'demo@procurepilot.ai';
  static const String demoPassword = 'Demo@12345';

  AuthService(this._apiClient);

  /// Authenticate user with Email and Password
  Future<AuthResponse> login({
    required String email,
    required String password,
  }) async {
    try {
      final responseData = await _apiClient.post(
        ApiConstants.login,
        data: {'email': email.trim(), 'password': password},
      );

      return _parseAuthResponse(responseData, email);
    } on ApiException catch (e) {
      throw _mapApiException(e);
    } catch (e) {
      throw const ApiException(
        message:
            'An unexpected authentication error occurred. Please try again.',
        type: ApiExceptionType.unknown,
      );
    }
  }

  /// Authenticate using configured Demo Account (with offline fallback for immediate app exploration)
  Future<AuthResponse> demoLogin() async {
    try {
      return await login(email: demoEmail, password: demoPassword);
    } catch (_) {
      // Offline fallback demo user for instant app exploration without requiring a live backend
      return AuthResponse(
        user: UserModel(
          id: 'usr_demo_global_99',
          name: 'Alex Morgan',
          email: demoEmail,
          phone: '+1 (555) 019-2834',
          storeName: 'Global Retail Mart',
          storeAddress: '123 Commerce St, New York, NY',
          gstNumber: 'US987654321',
          role: 'STORE_OWNER',
          createdAt: DateTime.now(),
        ),
        accessToken: 'mock_demo_access_token_procurepilot',
        refreshToken: 'mock_demo_refresh_token_procurepilot',
      );
    }
  }

  /// Register a new user business account
  Future<AuthResponse> register({
    required String name,
    required String email,
    required String password,
    required String phone,
    required String storeName,
    String? gstNumber,
  }) async {
    try {
      final payload = <String, dynamic>{
        'name': name.trim(),
        'email': email.trim(),
        'password': password,
        'phone': phone.trim(),
        'storeName': storeName.trim(),
      };
      if (gstNumber != null && gstNumber.trim().isNotEmpty) {
        payload['gstNumber'] = gstNumber.trim();
      }

      final responseData = await _apiClient.post(
        ApiConstants.register,
        data: payload,
      );

      return _parseAuthResponse(responseData, email);
    } on ApiException catch (e) {
      if (e.type == ApiExceptionType.conflict) {
        throw const ApiException(
          message: 'An account with this email or phone number already exists.',
          type: ApiExceptionType.conflict,
        );
      }
      throw _mapApiException(e);
    } catch (e) {
      throw const ApiException(
        message:
            'Registration failed. Please check your details and try again.',
        type: ApiExceptionType.unknown,
      );
    }
  }

  /// Helper to parse standard API response envelope
  AuthResponse _parseAuthResponse(dynamic responseData, String fallbackEmail) {
    if (responseData == null) {
      throw const ApiException(
        message: 'Invalid response received from server.',
        type: ApiExceptionType.unknown,
      );
    }

    final Map<String, dynamic> body = responseData is Map<String, dynamic>
        ? responseData
        : <String, dynamic>{};

    final dynamic data = body['data'] ?? body;
    final Map<String, dynamic> dataMap = data is Map<String, dynamic>
        ? data
        : <String, dynamic>{};

    final accessToken =
        dataMap['accessToken'] ?? dataMap['token'] ?? body['token'] ?? '';
    final refreshToken =
        dataMap['refreshToken'] ?? dataMap['refresh_token'] ?? '';

    if (accessToken.toString().isEmpty) {
      throw const ApiException(
        message: 'Authentication failed. Token not returned by server.',
        type: ApiExceptionType.unauthorized,
      );
    }

    final userJson = dataMap['user'] as Map<String, dynamic>? ?? dataMap;
    final user = UserModel.fromJson({'email': fallbackEmail, ...userJson});

    return AuthResponse(
      user: user,
      accessToken: accessToken.toString(),
      refreshToken: refreshToken.toString(),
    );
  }

  ApiException _mapApiException(ApiException e) {
    if (e.type == ApiExceptionType.unauthorized ||
        e.type == ApiExceptionType.badRequest) {
      return ApiException(
        message: e.message.isNotEmpty
            ? e.message
            : 'Invalid input. Please verify your details.',
        statusCode: e.statusCode,
        type: ApiExceptionType.badRequest,
        errorCode: e.errorCode,
      );
    } else if (e.type == ApiExceptionType.networkError ||
        e.type == ApiExceptionType.timeout) {
      return const ApiException(
        message: 'Network error. Please check your internet connection.',
        type: ApiExceptionType.networkError,
      );
    }
    return e;
  }
}
