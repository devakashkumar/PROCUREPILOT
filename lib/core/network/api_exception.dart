import 'package:dio/dio.dart';

enum ApiExceptionType {
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  unprocessableEntity,
  serverError,
  networkError,
  timeout,
  refreshTokenExpired,
  cancelled,
  unknown,
}

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final ApiExceptionType type;
  final dynamic data;
  final String? errorCode;

  const ApiException({
    required this.message,
    required this.type,
    this.statusCode,
    this.data,
    this.errorCode,
  });

  factory ApiException.fromDioException(DioException dioException) {
    switch (dioException.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return const ApiException(
          message:
              'Connection timed out. Please check your internet connection.',
          type: ApiExceptionType.timeout,
        );

      case DioExceptionType.connectionError:
        return const ApiException(
          message: 'Unable to connect to server. Please verify network access.',
          type: ApiExceptionType.networkError,
        );

      case DioExceptionType.cancel:
        return const ApiException(
          message: 'Request was cancelled.',
          type: ApiExceptionType.cancelled,
        );

      case DioExceptionType.badResponse:
        final response = dioException.response;
        final statusCode = response?.statusCode;
        final responseData = response?.data;

        String extractedMessage = 'An unexpected server error occurred.';
        String? errCode;

        if (responseData is Map<String, dynamic>) {
          extractedMessage =
              responseData['message'] ??
              responseData['error'] ??
              extractedMessage;
          errCode = responseData['errorCode'] ?? responseData['code'];
        }

        switch (statusCode) {
          case 400:
            return ApiException(
              message: extractedMessage,
              statusCode: statusCode,
              type: ApiExceptionType.badRequest,
              data: responseData,
              errorCode: errCode,
            );
          case 401:
            return ApiException(
              message: extractedMessage.isNotEmpty
                  ? extractedMessage
                  : 'Unauthorized access.',
              statusCode: statusCode,
              type: ApiExceptionType.unauthorized,
              data: responseData,
              errorCode: errCode,
            );
          case 403:
            return ApiException(
              message: extractedMessage.isNotEmpty
                  ? extractedMessage
                  : 'Access forbidden.',
              statusCode: statusCode,
              type: ApiExceptionType.forbidden,
              data: responseData,
              errorCode: errCode,
            );
          case 404:
            return ApiException(
              message: extractedMessage.isNotEmpty
                  ? extractedMessage
                  : 'Resource not found.',
              statusCode: statusCode,
              type: ApiExceptionType.notFound,
              data: responseData,
              errorCode: errCode,
            );
          case 409:
            return ApiException(
              message: extractedMessage,
              statusCode: statusCode,
              type: ApiExceptionType.conflict,
              data: responseData,
              errorCode: errCode,
            );
          case 422:
            return ApiException(
              message: extractedMessage,
              statusCode: statusCode,
              type: ApiExceptionType.unprocessableEntity,
              data: responseData,
              errorCode: errCode,
            );
          case 500:
          case 502:
          case 503:
          case 504:
            return ApiException(
              message: 'Server error ($statusCode). Please try again later.',
              statusCode: statusCode,
              type: ApiExceptionType.serverError,
              data: responseData,
              errorCode: errCode,
            );
          default:
            return ApiException(
              message: extractedMessage,
              statusCode: statusCode,
              type: ApiExceptionType.unknown,
              data: responseData,
              errorCode: errCode,
            );
        }

      default:
        final rawMsg = dioException.message ?? '';
        if (rawMsg.contains('SocketException') ||
            rawMsg.contains('Failed host lookup') ||
            rawMsg.contains('errno = 7')) {
          return const ApiException(
            message:
                'Unable to resolve server host. Please check network connection or set API_BASE_URL (e.g., http://10.0.2.2:3000/v1).',
            type: ApiExceptionType.networkError,
          );
        }
        return ApiException(
          message: rawMsg.isNotEmpty
              ? rawMsg
              : 'An unexpected network error occurred.',
          type: ApiExceptionType.unknown,
        );
    }
  }

  @override
  String toString() =>
      'ApiException(message: $message, statusCode: $statusCode, type: $type, errorCode: $errorCode)';
}
