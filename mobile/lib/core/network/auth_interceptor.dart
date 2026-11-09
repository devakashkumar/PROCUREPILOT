import 'package:dio/dio.dart';
import '../constants/api_constants.dart';
import 'token_manager.dart';

/// Dio Interceptor handling Bearer Authorization injection and token refresh logic
class AuthInterceptor extends Interceptor {
  final TokenManager _tokenManager;
  final Dio _refreshDio;
  final Function()? _onSessionExpired;

  AuthInterceptor({
    required TokenManager tokenManager,
    required Dio refreshDio,
    Function()? onSessionExpired,
  }) : _tokenManager = tokenManager,
       _refreshDio = refreshDio,
       _onSessionExpired = onSessionExpired;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Skip adding auth token for auth endpoints like login and register
    final isAuthEndpoint =
        options.path.contains(ApiConstants.login) ||
        options.path.contains(ApiConstants.register) ||
        options.path.contains(ApiConstants.refreshToken);

    if (!isAuthEndpoint) {
      final token = await _tokenManager.getAccessToken();
      if (token != null && token.isNotEmpty) {
        options.headers[ApiConstants.authorizationHeader] =
            '${ApiConstants.bearerPrefix}$token';
      }
    }

    return handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401) {
      final isAuthEndpoint =
          err.requestOptions.path.contains(ApiConstants.login) ||
          err.requestOptions.path.contains(ApiConstants.register) ||
          err.requestOptions.path.contains(ApiConstants.refreshToken);

      if (!isAuthEndpoint) {
        // Attempt to refresh access token
        final newAccessToken = await _tokenManager.refreshToken(_refreshDio);

        if (newAccessToken != null && newAccessToken.isNotEmpty) {
          // Retry original request with new access token
          final options = err.requestOptions;
          options.headers[ApiConstants.authorizationHeader] =
              '${ApiConstants.bearerPrefix}$newAccessToken';

          try {
            final response = await _refreshDio.fetch(options);
            return handler.resolve(response);
          } on DioException catch (retryError) {
            return handler.next(retryError);
          }
        } else {
          // Token refresh failed or session expired
          _onSessionExpired?.call();
        }
      }
    }

    return handler.next(err);
  }
}
