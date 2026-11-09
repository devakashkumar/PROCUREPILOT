import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/procurement/presentation/optimization_result_screen.dart';
import '../../features/analytics/presentation/analytics_screen.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/register_screen.dart';
import '../../features/cart/presentation/cart_screen.dart';
import '../../features/dashboard/presentation/dashboard_screen.dart';
import '../../features/notifications/presentation/notification_screen.dart';
import '../../features/orders/presentation/order_details_screen.dart';
import '../../features/orders/presentation/order_history_screen.dart';
import '../../features/payments/presentation/payment_screen.dart';
import '../../features/payments/presentation/payment_status_screen.dart';
import '../../features/procurement/presentation/procurement_chat_screen.dart';
import '../../features/products/presentation/product_list_screen.dart';
import '../../features/profile/presentation/business_profile_screen.dart';
import '../../features/profile/presentation/edit_profile_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/profile/presentation/settings_screen.dart';
import '../../features/splash/presentation/splash_screen.dart';
import '../../features/suppliers/presentation/supplier_comparison_screen.dart';
import '../../shared/components/main_bottom_nav_scaffold.dart';
import 'app_routes.dart';

final rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'root');

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: AppRoutes.splash,
    debugLogDiagnostics: true,
    routes: [
      // Splash Screen
      GoRoute(
        path: AppRoutes.splash,
        name: AppRoutes.splashName,
        builder: (context, state) => const SplashScreen(),
      ),

      // Auth Routes
      GoRoute(
        path: AppRoutes.login,
        name: AppRoutes.loginName,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: AppRoutes.register,
        name: AppRoutes.registerName,
        builder: (context, state) => const RegisterScreen(),
      ),

      // Standalone Sub-routes
      GoRoute(
        path: AppRoutes.suppliers,
        name: AppRoutes.suppliersName,
        builder: (context, state) => const SupplierComparisonScreen(),
      ),
      GoRoute(
        path: AppRoutes.cart,
        name: AppRoutes.cartName,
        builder: (context, state) => const CartScreen(),
      ),
      GoRoute(
        path: AppRoutes.orderDetails,
        name: AppRoutes.orderDetailsName,
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return OrderDetailsScreen(orderId: id);
        },
      ),
      GoRoute(
        path: AppRoutes.approval,
        name: AppRoutes.approvalName,
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return OptimizationResultScreen(requestId: id);
        },
      ),
      GoRoute(
        path: AppRoutes.paymentStatus,
        name: AppRoutes.paymentStatusName,
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return PaymentScreen(orderId: id);
        },
      ),
      GoRoute(
        path: '/payments/status-verify/:id',
        name: 'paymentStatusVerify',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return PaymentStatusScreen(paymentId: id);
        },
      ),
      GoRoute(
        path: '/profile/edit',
        name: 'editProfile',
        builder: (context, state) => const EditProfileScreen(),
      ),
      GoRoute(
        path: '/profile/business',
        name: 'businessProfile',
        builder: (context, state) => const BusinessProfileScreen(),
      ),
      GoRoute(
        path: '/profile/settings',
        name: 'settings',
        builder: (context, state) => const SettingsScreen(),
      ),
      GoRoute(
        path: AppRoutes.notifications,
        name: AppRoutes.notificationsName,
        builder: (context, state) => const NotificationScreen(),
      ),
      GoRoute(
        path: AppRoutes.analytics,
        name: AppRoutes.analyticsName,
        builder: (context, state) => const AnalyticsScreen(),
      ),

      // Main Tab Shell Navigation
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return MainBottomNavScaffold(navigationShell: navigationShell);
        },
        branches: [
          // Tab 0: Home / Dashboard
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.dashboard,
                name: AppRoutes.dashboardName,
                builder: (context, state) => const DashboardScreen(),
              ),
            ],
          ),
          // Tab 1: Discover / Products
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.products,
                name: AppRoutes.productsName,
                builder: (context, state) => const ProductListScreen(),
              ),
            ],
          ),
          // Tab 2: AI Assistant / Procurement
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.procurement,
                name: AppRoutes.procurementName,
                builder: (context, state) => const ProcurementChatScreen(),
              ),
            ],
          ),
          // Tab 3: Orders
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.orders,
                name: AppRoutes.ordersName,
                builder: (context, state) => const OrderHistoryScreen(),
              ),
            ],
          ),
          // Tab 4: Profile
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.profile,
                name: AppRoutes.profileName,
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
});
