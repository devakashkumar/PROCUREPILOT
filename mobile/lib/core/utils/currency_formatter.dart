import 'package:intl/intl.dart';

abstract class CurrencyFormatter {
  static final NumberFormat _inrFormatter = NumberFormat.currency(
    locale: 'en_IN',
    symbol: '₹',
    decimalDigits: 2,
  );

  static final NumberFormat _inrCompactFormatter = NumberFormat.compactCurrency(
    locale: 'en_IN',
    symbol: '₹',
    decimalDigits: 1,
  );

  static String formatINR(double amount, {bool showDecimals = false}) {
    final formatter = showDecimals
        ? _inrFormatter
        : NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);
    return formatter.format(amount);
  }

  static String formatCompactINR(double amount) {
    return _inrCompactFormatter.format(amount);
  }
}
