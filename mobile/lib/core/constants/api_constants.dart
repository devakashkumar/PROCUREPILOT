/// Centralized API Constants and Backend Contracts for ProcurePilot AI
abstract class ApiConstants {
  // Configurable base URL with environment variable override
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://api.procurepilot.ai/v1',
  );

  // Connection and request timeouts
  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 15);
  static const Duration sendTimeout = Duration(seconds: 15);

  // Header Keys
  static const String authorizationHeader = 'Authorization';
  static const String bearerPrefix = 'Bearer ';
  static const String contentTypeHeader = 'Content-Type';
  static const String jsonContentType = 'application/json';
  static const String apiKeyHeader = 'X-API-Key';

  // Auth Endpoints
  static const String login = '/api/auth/login';
  static const String register = '/api/auth/register';
  static const String refreshToken = '/api/auth/refresh';
  static const String me = '/api/auth/me';
  static const String logout = '/api/auth/logout';

  // Procurement & AI Assistant Endpoints
  static const String procurementRecommendations =
      '/procurement/recommendations';
  static const String procurementRfq = '/procurement/rfq';

  // Products & Inventory Endpoints
  static const String products = '/products';
  static String productDetail(String id) => '/products/$id';

  // Suppliers Endpoints
  static const String suppliers = '/suppliers';
  static String supplierDetail(String id) => '/suppliers/$id';

  // Cart & Order Endpoints
  static const String cart = '/cart';
  static const String orders = '/orders';
  static String orderDetail(String id) => '/orders/$id';
  static String orderApproval(String id) => '/orders/$id/approval';
  static String orderApprove(String id) => '/api/orders/$id/approve';
  static String orderReject(String id) => '/api/orders/$id/reject';

  // Payments Endpoints
  static const String checkout = '/payments/checkout';
  static const String paymentCreate = '/api/payments/create';
  static const String paymentCapture = '/api/payments/capture';
  static String paymentStatus(String id) => '/payments/status/$id';
  static String paymentDetail(String id) => '/api/payments/$id';

  // Profile Endpoints
  static const String profile = '/profile';

  // Notification Endpoints
  static const String notifications = '/api/notifications';
  static const String notificationsUnreadCount =
      '/api/notifications/unread-count';
  static String markNotificationRead(String id) =>
      '/api/notifications/$id/read';
  static const String markAllNotificationsRead = '/api/notifications/read-all';
  static const String registerPushDevice = '/api/notifications/push-token';
}
