import '../core/network/api_exception.dart';

/// Sealed class pattern representing state of an asynchronous API operation
sealed class ApiResult<T> {
  const ApiResult();

  factory ApiResult.success(T data, {String? message}) = SuccessResult<T>;
  factory ApiResult.failure(ApiException exception) = FailureResult<T>;

  R when<R>({
    required R Function(T data, String? message) success,
    required R Function(ApiException exception) failure,
  }) {
    if (this is SuccessResult<T>) {
      final s = this as SuccessResult<T>;
      return success(s.data, s.message);
    } else if (this is FailureResult<T>) {
      final f = this as FailureResult<T>;
      return failure(f.exception);
    }
    throw StateError('Unknown ApiResult subtype');
  }

  bool get isSuccess => this is SuccessResult<T>;
  bool get isFailure => this is FailureResult<T>;

  T? get dataOrNull => isSuccess ? (this as SuccessResult<T>).data : null;
  ApiException? get exceptionOrNull =>
      isFailure ? (this as FailureResult<T>).exception : null;
}

class SuccessResult<T> extends ApiResult<T> {
  final T data;
  final String? message;

  const SuccessResult(this.data, {this.message});
}

class FailureResult<T> extends ApiResult<T> {
  final ApiException exception;

  const FailureResult(this.exception);
}
