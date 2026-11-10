/// Detected item requirement parsed from AI backend analysis
class ProcuredItem {
  final String name;
  final double quantity;
  final String unit;
  final double? estimatedPrice;

  const ProcuredItem({
    required this.name,
    required this.quantity,
    required this.unit,
    this.estimatedPrice,
  });

  factory ProcuredItem.fromJson(Map<String, dynamic> json) {
    return ProcuredItem(
      name: json['name'] as String? ?? json['item'] as String? ?? 'Item',
      quantity: ((json['quantity'] ?? json['qty'] ?? 1.0) as num).toDouble(),
      unit: json['unit'] as String? ?? 'units',
      estimatedPrice: json['estimatedPrice'] != null
          ? ((json['estimatedPrice']) as num).toDouble()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'quantity': quantity,
      'unit': unit,
      if (estimatedPrice != null) 'estimatedPrice': estimatedPrice,
    };
  }
}

/// Structured procurement analysis response returned by AI backend
class ProcurementAnalysisData {
  final String requestId;
  final String message;
  final List<ProcuredItem> detectedItems;
  final double? estimatedBudget;
  final String confidence;

  const ProcurementAnalysisData({
    required this.requestId,
    required this.message,
    required this.detectedItems,
    this.estimatedBudget,
    this.confidence = 'HIGH',
  });

  factory ProcurementAnalysisData.fromJson(Map<String, dynamic> json) {
    final rawItems =
        json['detectedItems'] ?? json['items'] ?? json['requirements'] ?? [];
    final List<ProcuredItem> itemsList = rawItems is List
        ? rawItems
              .map(
                (e) =>
                    ProcuredItem.fromJson(Map<String, dynamic>.from(e as Map)),
              )
              .toList()
        : [];

    return ProcurementAnalysisData(
      requestId: json['requestId'] as String? ?? json['id'] as String? ?? '',
      message: json['message'] as String? ?? 'Analysis completed.',
      detectedItems: itemsList,
      estimatedBudget: json['estimatedBudget'] != null
          ? ((json['estimatedBudget']) as num).toDouble()
          : null,
      confidence: json['confidence'] as String? ?? 'HIGH',
    );
  }
}

/// Domain model representing an in-memory chat message in ProcurePilot AI
class ChatMessage {
  final String id;
  final String text;
  final bool isUser;
  final DateTime timestamp;
  final ProcurementAnalysisData? structuredData;
  final bool isTyping;

  const ChatMessage({
    required this.id,
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.structuredData,
    this.isTyping = false,
  });

  factory ChatMessage.user(String text) {
    return ChatMessage(
      id: 'msg_${DateTime.now().millisecondsSinceEpoch}',
      text: text,
      isUser: true,
      timestamp: DateTime.now(),
    );
  }

  factory ChatMessage.ai(
    String text, {
    ProcurementAnalysisData? structuredData,
  }) {
    return ChatMessage(
      id: 'msg_${DateTime.now().millisecondsSinceEpoch}',
      text: text,
      isUser: false,
      timestamp: DateTime.now(),
      structuredData: structuredData,
    );
  }

  factory ChatMessage.typing() {
    return ChatMessage(
      id: 'typing_indicator',
      text: '',
      isUser: false,
      timestamp: DateTime.now(),
      isTyping: true,
    );
  }
}
