/// Standard generic API response wrapper for ProcurePilot backend
class ApiResponse<T> {
  final bool success;
  final String? message;
  final T? data;
  final String? errorCode;
  final DateTime? timestamp;

  const ApiResponse({
    required this.success,
    this.message,
    this.data,
    this.errorCode,
    this.timestamp,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic json)? fromJsonT,
  ) {
    final rawData = json['data'];
    return ApiResponse<T>(
      success: json['success'] as bool? ?? true,
      message: json['message'] as String?,
      data: (rawData != null && fromJsonT != null)
          ? fromJsonT(rawData)
          : rawData as T?,
      errorCode: json['errorCode'] as String? ?? json['code'] as String?,
      timestamp: json['timestamp'] != null
          ? DateTime.tryParse(json['timestamp'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson(Object? Function(T value)? toJsonT) {
    return {
      'success': success,
      'message': message,
      'data': (data != null && toJsonT != null) ? toJsonT(data as T) : data,
      'errorCode': errorCode,
      'timestamp': timestamp?.toIso8601String(),
    };
  }

  @override
  String toString() =>
      'ApiResponse(success: $success, message: $message, data: $data, errorCode: $errorCode)';
}
