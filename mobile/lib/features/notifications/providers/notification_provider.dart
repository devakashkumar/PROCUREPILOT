import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../providers/network_provider.dart';
import '../models/app_notification.dart';
import '../services/notification_service.dart';

class NotificationState {
  final bool isLoading;
  final bool isRefreshing;
  final int unreadCount;
  final String? errorMessage;
  final List<AppNotification> notifications;
  final List<AppNotification> filteredNotifications;
  final String
  selectedFilter; // 'All', 'Unread', 'Orders', 'Approvals', 'Payments', 'Procurement', 'Account'

  const NotificationState({
    this.isLoading = false,
    this.isRefreshing = false,
    this.unreadCount = 0,
    this.errorMessage,
    this.notifications = const [],
    this.filteredNotifications = const [],
    this.selectedFilter = 'All',
  });

  NotificationState copyWith({
    bool? isLoading,
    bool? isRefreshing,
    int? unreadCount,
    String? errorMessage,
    List<AppNotification>? notifications,
    List<AppNotification>? filteredNotifications,
    String? selectedFilter,
  }) {
    return NotificationState(
      isLoading: isLoading ?? this.isLoading,
      isRefreshing: isRefreshing ?? this.isRefreshing,
      unreadCount: unreadCount ?? this.unreadCount,
      errorMessage: errorMessage,
      notifications: notifications ?? this.notifications,
      filteredNotifications:
          filteredNotifications ?? this.filteredNotifications,
      selectedFilter: selectedFilter ?? this.selectedFilter,
    );
  }
}

class NotificationNotifier extends StateNotifier<NotificationState> {
  final NotificationService _service;

  NotificationNotifier(this._service) : super(const NotificationState()) {
    loadNotifications();
  }

  /// Load notifications from backend GET /api/notifications
  Future<void> loadNotifications({bool isRefresh = false}) async {
    state = state.copyWith(
      isLoading: !isRefresh,
      isRefreshing: isRefresh,
      errorMessage: null,
    );

    try {
      final list = await _service.fetchNotifications(
        categoryFilter: state.selectedFilter,
      );
      final unread = list.where((n) => !n.isRead).length;

      state = state.copyWith(
        isLoading: false,
        isRefreshing: false,
        unreadCount: unread,
        notifications: list,
      );

      _applyFilters();
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        isRefreshing: false,
        errorMessage: 'Failed to load notifications.',
      );
    }
  }

  /// Mark single notification as read
  Future<void> markAsRead(String id) async {
    final updatedList = state.notifications.map((n) {
      if (n.id == id) {
        return n.copyWith(isRead: true);
      }
      return n;
    }).toList();

    final unread = updatedList.where((n) => !n.isRead).length;

    state = state.copyWith(notifications: updatedList, unreadCount: unread);

    _applyFilters();
    _service.markAsRead(id);
  }

  /// Mark all notifications as read
  Future<void> markAllAsRead() async {
    final updatedList = state.notifications
        .map((n) => n.copyWith(isRead: true))
        .toList();

    state = state.copyWith(notifications: updatedList, unreadCount: 0);

    _applyFilters();
    _service.markAllAsRead();
  }

  /// Change active filter tab
  void filterByCategory(String filter) {
    state = state.copyWith(selectedFilter: filter);
    _applyFilters();
  }

  void _applyFilters() {
    final filter = state.selectedFilter.toUpperCase();

    final filtered = state.notifications.where((n) {
      if (filter == 'ALL') return true;
      if (filter == 'UNREAD') return !n.isRead;
      if (filter == 'ORDERS' || filter == 'ORDER') {
        return n.category == NotificationCategory.orderUpdate;
      }
      if (filter == 'APPROVALS' || filter == 'APPROVAL') {
        return n.category == NotificationCategory.approvalUpdate;
      }
      if (filter == 'PAYMENTS' || filter == 'PAYMENT') {
        return n.category == NotificationCategory.paymentUpdate;
      }
      if (filter == 'PROCUREMENT') {
        return n.category == NotificationCategory.procurementUpdate;
      }
      if (filter == 'ACCOUNT') {
        return n.category == NotificationCategory.accountUpdate;
      }
      return true;
    }).toList();

    state = state.copyWith(filteredNotifications: filtered);
  }
}

final notificationServiceProvider = Provider<NotificationService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return NotificationService(apiClient);
});

final notificationProvider =
    StateNotifierProvider<NotificationNotifier, NotificationState>((ref) {
      final service = ref.watch(notificationServiceProvider);
      return NotificationNotifier(service);
    });
