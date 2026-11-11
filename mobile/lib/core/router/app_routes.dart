/// Centralized Route Paths & Route Names
abstract class AppRoutes {
  // Splash Route
  static const String splash = '/splash';
  static const String splashName = 'splash';

  // Auth Routes
  static const String login = '/login';
  static const String loginName = 'login';
  static const String register = '/register';
  static const String registerName = 'register';

  // Core Bottom Navigation Tab Routes
  static const String dashboard = '/dashboard';
  static const String dashboardName = 'dashboard';

  static const String procurement = '/procurement';
  static const String procurementName = 'procurement';

  static const String products = '/products';
  static const String productsName = 'products';

  static const String suppliers = '/suppliers';
  static const String suppliersName = 'suppliers';

  static const String cart = '/cart';
  static const String cartName = 'cart';

  static const String orders = '/orders';
  static const String ordersName = 'orders';

  static const String profile = '/profile';
  static const String profileName = 'profile';

  // Standalone Sub-routes
  static const String orderDetails = '/orders/:id';
  static const String orderDetailsName = 'orderDetails';
  static String orderDetailsPath(String id) => '/orders/$id';

  static const String approval = '/approval/:id';
  static const String approvalName = 'approval';
  static String approvalPath(String id) => '/approval/$id';

  static const String paymentStatus = '/payment-status/:id';
  static const String paymentStatusName = 'paymentStatus';
  static String paymentStatusPath(String id) => '/payment-status/$id';

  static const String notifications = '/notifications';
  static const String notificationsName = 'notifications';

  static const String analytics = '/analytics';
  static const String analyticsName = 'analytics';
}
