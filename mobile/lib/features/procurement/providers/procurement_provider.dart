import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_exception.dart';
import '../../../providers/network_provider.dart';
import '../models/chat_message.dart';

class ProcurementState {
  final List<ChatMessage> messages;
  final bool isSending;
  final String? errorMessage;

  const ProcurementState({
    this.messages = const [],
    this.isSending = false,
    this.errorMessage,
  });

  ProcurementState copyWith({
    List<ChatMessage>? messages,
    bool? isSending,
    String? errorMessage,
  }) {
    return ProcurementState(
      messages: messages ?? this.messages,
      isSending: isSending ?? this.isSending,
      errorMessage: errorMessage,
    );
  }

  bool get isEmpty => messages.isEmpty;
}

class ProcurementNotifier extends StateNotifier<ProcurementState> {
  final ApiClient _apiClient;

  ProcurementNotifier(this._apiClient) : super(const ProcurementState());

  /// Send user prompt to backend AI analysis endpoint
  Future<void> sendMessage(String text) async {
    final trimmedText = text.trim();
    if (trimmedText.isEmpty || state.isSending) return;

    final userMessage = ChatMessage.user(trimmedText);
    final typingMessage = ChatMessage.typing();

    final updatedMessages = List<ChatMessage>.from(state.messages)
      ..add(userMessage)
      ..add(typingMessage);

    state = state.copyWith(
      messages: updatedMessages,
      isSending: true,
      errorMessage: null,
    );

    try {
      final responseData = await _apiClient.post(
        '/api/procurement/analyze',
        data: {'prompt': trimmedText, 'storeName': 'Sharma Kirana Store'},
      );

      final Map<String, dynamic> body = responseData is Map<String, dynamic>
          ? responseData
          : <String, dynamic>{};

      final dynamic data = body['data'] ?? body;
      final Map<String, dynamic> dataMap = data is Map<String, dynamic>
          ? data
          : <String, dynamic>{};

      final analysisData = ProcurementAnalysisData.fromJson(dataMap);

      final aiMessage = ChatMessage.ai(
        analysisData.message.isNotEmpty
            ? analysisData.message
            : "I've analyzed your purchasing requirement.",
        structuredData: analysisData,
      );

      // Remove typing indicator and append real AI message
      final finalMessages = List<ChatMessage>.from(state.messages)
        ..removeWhere((m) => m.isTyping)
        ..add(userMessage)
        ..add(aiMessage);

      state = state.copyWith(messages: finalMessages, isSending: false);
    } on ApiException catch (e) {
      final errorAiMessage = ChatMessage.ai(
        'Sorry, I couldn\'t process your request (${e.message}). Please verify your connection and try again.',
      );

      final finalMessages = List<ChatMessage>.from(state.messages)
        ..removeWhere((m) => m.isTyping)
        ..add(userMessage)
        ..add(errorAiMessage);

      state = state.copyWith(
        messages: finalMessages,
        isSending: false,
        errorMessage: e.message,
      );
    } catch (_) {
      final errorAiMessage = ChatMessage.ai(
        'An unexpected error occurred while processing your procurement request. Please try again.',
      );

      final finalMessages = List<ChatMessage>.from(state.messages)
        ..removeWhere((m) => m.isTyping)
        ..add(userMessage)
        ..add(errorAiMessage);

      state = state.copyWith(messages: finalMessages, isSending: false);
    }
  }

  /// Clear active chat messages
  void clearMessages() {
    state = const ProcurementState(messages: []);
  }
}

final procurementProvider =
    StateNotifierProvider<ProcurementNotifier, ProcurementState>((ref) {
      final apiClient = ref.watch(apiClientProvider);
      return ProcurementNotifier(apiClient);
    });
