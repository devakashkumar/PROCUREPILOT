import '../constants/api_constants.dart';

/// Configurable API Environment Settings
class ApiConfig {
  final String baseUrl;
  final Duration connectTimeout;
  final Duration receiveTimeout;
  final Duration sendTimeout;
  final bool enableLogging;

  const ApiConfig({
    this.baseUrl = ApiConstants.baseUrl,
    this.connectTimeout = ApiConstants.connectTimeout,
    this.receiveTimeout = ApiConstants.receiveTimeout,
    this.sendTimeout = ApiConstants.sendTimeout,
    this.enableLogging = true,
  });

  ApiConfig copyWith({
    String? baseUrl,
    Duration? connectTimeout,
    Duration? receiveTimeout,
    Duration? sendTimeout,
    bool? enableLogging,
  }) {
    return ApiConfig(
      baseUrl: baseUrl ?? this.baseUrl,
      connectTimeout: connectTimeout ?? this.connectTimeout,
      receiveTimeout: receiveTimeout ?? this.receiveTimeout,
      sendTimeout: sendTimeout ?? this.sendTimeout,
      enableLogging: enableLogging ?? this.enableLogging,
    );
  }
}
