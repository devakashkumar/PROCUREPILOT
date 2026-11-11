import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:procurepilot/app/app.dart';

void main() {
  testWidgets('App initialization smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: ProcurePilotApp()));
    await tester.pump(const Duration(seconds: 3));
    expect(find.byType(ProcurePilotApp), findsOneWidget);
  });
}
