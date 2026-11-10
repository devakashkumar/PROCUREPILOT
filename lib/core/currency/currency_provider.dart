import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/currency_formatter.dart';

class CurrencyNotifier extends StateNotifier<String> {
  static const String _prefKey = 'procurepilot_active_currency';

  CurrencyNotifier() : super('USD') {
    _loadSavedCurrency();
  }

  Future<void> _loadSavedCurrency() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final saved = prefs.getString(_prefKey);
      if (saved != null &&
          CurrencyFormatter.supportedCurrencies.containsKey(saved)) {
        state = saved;
        CurrencyFormatter.activeCurrencyCode = saved;
      }
    } catch (_) {}
  }

  Future<void> setCurrency(String code) async {
    if (!CurrencyFormatter.supportedCurrencies.containsKey(code)) return;
    state = code;
    CurrencyFormatter.activeCurrencyCode = code;

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_prefKey, code);
    } catch (_) {}
  }
}

final currencyProvider = StateNotifierProvider<CurrencyNotifier, String>((ref) {
  return CurrencyNotifier();
});
