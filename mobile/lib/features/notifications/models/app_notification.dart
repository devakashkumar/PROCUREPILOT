/// Notification Category Types supported by ProcurePilot AI backend
enum NotificationCategory {
  orderUpdate,
  approvalUpdate,
  paymentUpdate,
  procurementUpdate,
  accountUpdate,
  general,
}

class AppNotification {
  final String id;
  final String title;
  final String message;
  final NotificationCategory category;
  final bool isRead;
  final DateTime createdAt;
  final String? orderId;
  final String? paymentId;

  const AppNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.category,
    required this.isRead,
    required this.createdAt,
    this.orderId,
    this.paymentId,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    final catString = (json['category'] ?? json['type'] ?? 'GENERAL')
        .toString()
        .toUpperCase();
    NotificationCategory cat;

    if (catString.contains('ORDER')) {
      cat = NotificationCategory.orderUpdate;
    } else if (catString.contains('APPROV')) {
      cat = NotificationCategory.approvalUpdate;
    } else if (catString.contains('PAY')) {
      cat = NotificationCategory.paymentUpdate;
    } else if (catString.contains('PROCURE') || catString.contains('AI')) {
      cat = NotificationCategory.procurementUpdate;
    } else if (catString.contains('ACCOUNT') || catString.contains('USER')) {
      cat = NotificationCategory.accountUpdate;
    } else {
      cat = NotificationCategory.general;
    }

    return AppNotification(
      id:
          (json['id'] ??
                  json['_id'] ??
                  'notif_${DateTime.now().millisecondsSinceEpoch}')
              .toString(),
      title: json['title'] as String? ?? 'ProcurePilot Notification',
      message: json['message'] as String? ?? json['body'] as String? ?? '',
      category: cat,
      isRead: json['isRead'] as bool? ?? json['read'] as bool? ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      orderId: json['orderId'] as String? ?? json['orderRef'] as String?,
      paymentId: json['paymentId'] as String? ?? json['paymentRef'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'message': message,
      'category': category.name,
      'isRead': isRead,
      'createdAt': createdAt.toIso8601String(),
      'orderId': orderId,
      'paymentId': paymentId,
    };
  }

  AppNotification copyWith({
    String? id,
    String? title,
    String? message,
    NotificationCategory? category,
    bool? isRead,
    DateTime? createdAt,
    String? orderId,
    String? paymentId,
  }) {
    return AppNotification(
      id: id ?? this.id,
      title: title ?? this.title,
      message: message ?? this.message,
      category: category ?? this.category,
      isRead: isRead ?? this.isRead,
      createdAt: createdAt ?? this.createdAt,
      orderId: orderId ?? this.orderId,
      paymentId: paymentId ?? this.paymentId,
    );
  }
}
