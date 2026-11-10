import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:procurepilot/features/notifications/models/app_notification.dart';
import 'package:procurepilot/features/notifications/presentation/notification_screen.dart';
import 'package:procurepilot/features/notifications/providers/notification_provider.dart';

void main() {
  test('AppNotification model parsing and NotificationNotifier filtering', () {
    final json = {
      'id': 'notif_1',
      'title': 'Purchase Order Approved',
      'message': 'Order #PO-89420 was approved.',
      'category': 'APPROVAL_UPDATE',
      'isRead': false,
      'createdAt': '2026-05-24T10:35:00.000Z',
      'orderId': 'po_89420',
    };

    final notif = AppNotification.fromJson(json);
    expect(notif.id, 'notif_1');
    expect(notif.category, NotificationCategory.approvalUpdate);
    expect(notif.isRead, isFalse);
    expect(notif.orderId, 'po_89420');

    final container = ProviderContainer();
    addTearDown(container.dispose);

    final notifier = container.read(notificationProvider.notifier);
    expect(container.read(notificationProvider).selectedFilter, 'All');

    notifier.filterByCategory('Unread');
    expect(container.read(notificationProvider).selectedFilter, 'Unread');
  });

  testWidgets('NotificationScreen renders notification center UI', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      const ProviderScope(child: MaterialApp(home: NotificationScreen())),
    );
    await tester.pump(const Duration(seconds: 1));
    expect(find.byType(NotificationScreen), findsOneWidget);
  });
}
