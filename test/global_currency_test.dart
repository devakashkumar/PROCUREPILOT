import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:procurepilot/core/currency/currency_provider.dart';
import 'package:procurepilot/core/utils/currency_formatter.dart';

void main() {
  test('Global CurrencyFormatter supports multi-currency formatting', () {
    expect(CurrencyFormatter.format(100.0, currencyCode: 'USD'), '\$100');
    expect(
      CurrencyFormatter.format(100.0, currencyCode: 'EUR', showDecimals: true),
      '100,00 €',
    );
    expect(CurrencyFormatter.format(100.0, currencyCode: 'INR'), '₹100');
    expect(
      CurrencyFormatter.format(100.0, currencyCode: 'GBP', showDecimals: true),
      '£100.00',
    );
  });

  test('CurrencyNotifier updates active global currency state', () async {
    final container = ProviderContainer();
    addTearDown(container.dispose);

    final notifier = container.read(currencyProvider.notifier);
    await notifier.setCurrency('EUR');

    expect(container.read(currencyProvider), 'EUR');
    expect(CurrencyFormatter.activeCurrencyCode, 'EUR');
  });
}
