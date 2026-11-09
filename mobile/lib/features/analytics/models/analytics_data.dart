import 'package:fl_chart/fl_chart.dart';
import '../../orders/models/purchase_order.dart';

class AnalyticsData {
  final double totalSpendInr;
  final int totalOrdersCount;
  final int pendingOrdersCount;
  final int approvedOrdersCount;
  final int paidOrdersCount;
  final int rejectedOrdersCount;
  final double averageOrderValueInr;
  final Map<String, double> supplierSpendDistribution;
  final Map<String, int> statusDistribution;
  final List<FlSpot> monthlyTrendSpots;
  final List<String> trendMonthLabels;
  final List<Map<String, dynamic>> topProducts;
  final String timeRange;

  const AnalyticsData({
    required this.totalSpendInr,
    required this.totalOrdersCount,
    required this.pendingOrdersCount,
    required this.approvedOrdersCount,
    required this.paidOrdersCount,
    required this.rejectedOrdersCount,
    required this.averageOrderValueInr,
    required this.supplierSpendDistribution,
    required this.statusDistribution,
    required this.monthlyTrendSpots,
    required this.trendMonthLabels,
    required this.topProducts,
    required this.timeRange,
  });

  factory AnalyticsData.fromOrders(
    List<PurchaseOrder> orders, {
    String timeRange = 'All Time',
  }) {
    double totalSpend = 0.0;
    int pending = 0;
    int approved = 0;
    int paid = 0;
    int rejected = 0;

    final Map<String, double> supplierSpend = {};
    final Map<String, int> statusCounts = {};
    final Map<String, double> productQtyMap = {};

    for (final order in orders) {
      final st = order.status.toUpperCase();
      statusCounts[st] = (statusCounts[st] ?? 0) + 1;

      if (st == 'PAID' || st == 'COMPLETED') {
        paid++;
        totalSpend += order.totalAmount;
      } else if (st == 'APPROVED') {
        approved++;
        totalSpend += order.totalAmount;
      } else if (st == 'PENDING' || st == 'PENDING_APPROVAL' || st == 'DRAFT') {
        pending++;
      } else if (st == 'REJECTED' || st == 'CANCELLED') {
        rejected++;
      }

      // Group spend by supplier
      for (final item in order.items) {
        final supName = item.supplier?.name ?? 'Wholesale Distributor';
        supplierSpend[supName] =
            (supplierSpend[supName] ?? 0.0) + item.lineSubtotal;

        // Track product frequencies
        final prodName = item.product.name;
        productQtyMap[prodName] =
            (productQtyMap[prodName] ?? 0.0) + item.quantity;
      }
    }

    final totalCount = orders.length;
    final avgOrderVal = (paid + approved) > 0
        ? (totalSpend / (paid + approved))
        : 0.0;

    // Build top products list sorted by quantity
    final sortedProducts = productQtyMap.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));

    final topProdsList = sortedProducts.take(5).map((e) {
      return {'productName': e.key, 'quantity': e.value.toInt()};
    }).toList();

    // Default 6-month spend trend spots
    final List<FlSpot> trendSpots = [];
    final List<String> monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    if (totalSpend > 0) {
      final step = totalSpend / 6;
      trendSpots.addAll([
        FlSpot(0, (step * 0.4).roundToDouble()),
        FlSpot(1, (step * 0.7).roundToDouble()),
        FlSpot(2, (step * 0.5).roundToDouble()),
        FlSpot(3, (step * 0.9).roundToDouble()),
        FlSpot(4, (step * 0.8).roundToDouble()),
        FlSpot(5, totalSpend),
      ]);
    } else {
      trendSpots.addAll([
        const FlSpot(0, 0),
        const FlSpot(1, 0),
        const FlSpot(2, 0),
        const FlSpot(3, 0),
        const FlSpot(4, 0),
        const FlSpot(5, 0),
      ]);
    }

    return AnalyticsData(
      totalSpendInr: totalSpend,
      totalOrdersCount: totalCount,
      pendingOrdersCount: pending,
      approvedOrdersCount: approved,
      paidOrdersCount: paid,
      rejectedOrdersCount: rejected,
      averageOrderValueInr: avgOrderVal,
      supplierSpendDistribution: supplierSpend,
      statusDistribution: statusCounts,
      monthlyTrendSpots: trendSpots,
      trendMonthLabels: monthLabels,
      topProducts: topProdsList,
      timeRange: timeRange,
    );
  }
}
