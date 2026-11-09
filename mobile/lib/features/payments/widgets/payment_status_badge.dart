import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../shared/widgets/app_status_badge.dart';

class PaymentStatusBadge extends StatelessWidget {
  final String status;

  const PaymentStatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final raw = status.toUpperCase();

    switch (raw) {
      case 'COMPLETED':
      case 'SUCCESS':
      case 'PAID':
        return const AppStatusBadge(
          label: 'Payment Confirmed',
          status: BadgeStatus.success,
          icon: LucideIcons.checkCircle,
        );
      case 'PENDING':
        return const AppStatusBadge(
          label: 'Pending Verification',
          status: BadgeStatus.warning,
          icon: LucideIcons.clock,
        );
      case 'PROCESSING':
        return const AppStatusBadge(
          label: 'Verifying Payment',
          status: BadgeStatus.info,
          icon: LucideIcons.refreshCw,
        );
      case 'FAILED':
        return const AppStatusBadge(
          label: 'Payment Failed',
          status: BadgeStatus.error,
          icon: LucideIcons.alertCircle,
        );
      case 'CANCELLED':
        return const AppStatusBadge(
          label: 'Checkout Cancelled',
          status: BadgeStatus.neutral,
          icon: LucideIcons.xCircle,
        );
      default:
        return AppStatusBadge(label: status, status: BadgeStatus.neutral);
    }
  }
}
