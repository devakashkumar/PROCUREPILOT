import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:procurepilot/features/payments/presentation/payment_screen.dart';
import 'package:procurepilot/features/payments/presentation/payment_status_screen.dart';
import 'package:procurepilot/features/payments/services/payment_service.dart';

void main() {
  test('PaymentData model parsing and USD conversion', () {
    final json = {
      'paymentId': 'pay_98124',
      'paypalOrderId': 'PAYPAL-ORD-7712',
      'approvalUrl': 'https://www.sandbox.paypal.com/checkoutnow?token=7712',
      'amountInr': 6400.0,
      'exchangeRate': 83.0,
      'status': 'COMPLETED',
    };

    final payment = PaymentData.fromJson(json);
    expect(payment.paymentId, 'pay_98124');
    expect(payment.amountInr, 6400.0);
    expect(payment.amountUsd, closeTo(77.11, 0.1));
    expect(payment.status, 'COMPLETED');
  });

  testWidgets('PaymentScreen renders secure checkout UI', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(home: PaymentScreen(orderId: 'po_89420')),
      ),
    );
    await tester.pump(const Duration(seconds: 1));
    expect(find.byType(PaymentScreen), findsOneWidget);
  });

  testWidgets('PaymentStatusScreen renders status verification UI', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(home: PaymentStatusScreen(paymentId: 'pay_98124')),
      ),
    );
    await tester.pump(const Duration(seconds: 1));
    expect(find.byType(PaymentStatusScreen), findsOneWidget);
  });
}
