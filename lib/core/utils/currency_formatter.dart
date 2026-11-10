import 'package:intl/intl.dart';

class CurrencyConfig {
  final String code;
  final String symbol;
  final String locale;
  final double exchangeRateToUsd; // 1 USD = X Local

  const CurrencyConfig({
    required this.code,
    required this.symbol,
    required this.locale,
    required this.exchangeRateToUsd,
  });
}

abstract class CurrencyFormatter {
  static const Map<String, CurrencyConfig> supportedCurrencies = {
    'USD': CurrencyConfig(
      code: 'USD',
      symbol: '\$',
      locale: 'en_US',
      exchangeRateToUsd: 1.0,
    ),
    'INR': CurrencyConfig(
      code: 'INR',
      symbol: '₹',
      locale: 'en_IN',
      exchangeRateToUsd: 83.0,
    ),
    'EUR': CurrencyConfig(
      code: 'EUR',
      symbol: '€',
      locale: 'de_DE',
      exchangeRateToUsd: 0.92,
    ),
    'GBP': CurrencyConfig(
      code: 'GBP',
      symbol: '£',
      locale: 'en_GB',
      exchangeRateToUsd: 0.79,
    ),
    'AED': CurrencyConfig(
      code: 'AED',
      symbol: 'AED ',
      locale: 'ar_AE',
      exchangeRateToUsd: 3.67,
    ),
    'SGD': CurrencyConfig(
      code: 'SGD',
      symbol: 'S\$',
      locale: 'en_SG',
      exchangeRateToUsd: 1.35,
    ),
    'JPY': CurrencyConfig(
      code: 'JPY',
      symbol: '¥',
      locale: 'ja_JP',
      exchangeRateToUsd: 155.0,
    ),
  };

  static String activeCurrencyCode = 'USD'; // Default global currency

  static String format(
    double amount, {
    String? currencyCode,
    bool showDecimals = false,
  }) {
    final code = currencyCode ?? activeCurrencyCode;
    final config = supportedCurrencies[code] ?? supportedCurrencies['USD']!;

    final decimalDigits = showDecimals
        ? 2
        : (code == 'JPY' ? 0 : (amount % 1 == 0 ? 0 : 2));

    final formatter = NumberFormat.currency(
      locale: config.locale,
      symbol: config.symbol,
      decimalDigits: decimalDigits,
    );

    return formatter.format(amount);
  }

  static String formatINR(double amount, {bool showDecimals = false}) {
    return format(
      amount,
      currencyCode: activeCurrencyCode,
      showDecimals: showDecimals,
    );
  }

  static String formatCompact(double amount, {String? currencyCode}) {
    final code = currencyCode ?? activeCurrencyCode;
    final config = supportedCurrencies[code] ?? supportedCurrencies['USD']!;

    final formatter = NumberFormat.compactCurrency(
      locale: config.locale,
      symbol: config.symbol,
    );
    return formatter.format(amount);
  }

  static String formatCompactINR(double amount) {
    return formatCompact(amount);
  }
}
