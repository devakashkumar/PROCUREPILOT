import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../shared/components/app_bar_header.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/app_responsive_center.dart';
import '../../splash/presentation/widgets/orbital_ai_logo.dart';
import '../providers/procurement_provider.dart';
import '../widgets/chat_input_bar.dart';
import '../widgets/chat_message_bubble.dart';
import '../widgets/suggestion_chip.dart';

class ProcurementChatScreen extends ConsumerStatefulWidget {
  const ProcurementChatScreen({super.key});

  @override
  ConsumerState<ProcurementChatScreen> createState() =>
      _ProcurementChatScreenState();
}

class _ProcurementChatScreenState extends ConsumerState<ProcurementChatScreen>
    with SingleTickerProviderStateMixin {
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _inputController = TextEditingController();
  late AnimationController _logoAnimationController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  static const List<SuggestionChipItem> _suggestions = [
    SuggestionChipItem(
      label: 'Grocery Restocking',
      icon: LucideIcons.shoppingCart,
      promptText: '20 kg atta, 30 kg chawal and 15 litres sunflower oil',
    ),
    SuggestionChipItem(
      label: 'Buy Rice & Dal',
      icon: LucideIcons.box,
      promptText: 'Need 50 kg basmati rice and 25 kg toor dal under ₹5000',
    ),
    SuggestionChipItem(
      label: 'Purchase Cooking Oil',
      icon: LucideIcons.droplet,
      promptText: '20 litres sunflower oil best price',
    ),
    SuggestionChipItem(
      label: 'Monthly Inventory',
      icon: LucideIcons.package,
      promptText: 'Need 50 packets of biscuits under ₹10,000',
    ),
    SuggestionChipItem(
      label: 'Compare Suppliers',
      icon: LucideIcons.truck,
      promptText: 'Find the cheapest supplier for 100 kg rice',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _logoAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _scaleAnimation = Tween<double>(
      begin: 0.85,
      end: 1.0,
    ).animate(_logoAnimationController);
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(_logoAnimationController);
    _logoAnimationController.forward();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _inputController.dispose();
    _logoAnimationController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _handleSendMessage(String text) async {
    ref.read(procurementProvider.notifier).sendMessage(text);
    _scrollToBottom();
  }

  void _confirmClearChat() {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Clear Conversation?'),
        content: const Text(
          'Are you sure you want to clear this procurement session history?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              ref.read(procurementProvider.notifier).clearMessages();
              Navigator.pop(dialogContext);
            },
            child: const Text(
              'Clear',
              style: TextStyle(color: AppColors.error),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final state = ref.watch(procurementProvider);

    // Scroll to bottom when messages update
    ref.listen(procurementProvider, (previous, next) {
      if (next.messages.length != (previous?.messages.length ?? 0)) {
        _scrollToBottom();
      }
    });

    return Scaffold(
      appBar: ProcureAppBarHeader(
        title: 'AI Procurement Assistant',
        subtitle: 'Your intelligent purchasing partner',
        showAiBadge: true,
        actions: [
          Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: AppColors.secondary,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 4),
              Text(
                'AI Online',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: isDark
                      ? AppColors.textSecondaryDark
                      : AppColors.textSecondaryLight,
                ),
              ),
            ],
          ),
          IconButton(
            icon: const Icon(LucideIcons.trash2, size: 18),
            tooltip: 'Clear Chat',
            onPressed: state.messages.isEmpty ? null : _confirmClearChat,
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: AppResponsiveCenter(
              child: state.messages.isEmpty
                  ? _buildWelcomeState(theme, isDark)
                  : ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md,
                        vertical: AppSpacing.md,
                      ),
                      itemCount: state.messages.length,
                      itemBuilder: (context, index) {
                        final msg = state.messages[index];
                        return ChatMessageBubble(message: msg);
                      },
                    ),
            ),
          ),

          // Bottom Input Bar
          ChatInputBar(
            controller: _inputController,
            isLoading: state.isSending,
            onSend: _handleSendMessage,
          ),
        ],
      ),
    );
  }

  Widget _buildWelcomeState(ThemeData theme, bool isDark) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.lg,
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const SizedBox(height: AppSpacing.lg),

          // Logo Header
          OrbitalAiLogo(
            size: 80,
            scaleAnimation: _scaleAnimation,
            opacityAnimation: _fadeAnimation,
          ),

          const SizedBox(height: AppSpacing.lg),

          Text(
            'What does your business need today?',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
              letterSpacing: -0.3,
            ),
            textAlign: TextAlign.center,
          ),

          const SizedBox(height: AppSpacing.xs),

          Text(
            'Tell me what you want to purchase. I’ll find suitable products, compare suppliers and help optimize your budget.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: isDark
                  ? AppColors.textSecondaryDark
                  : AppColors.textSecondaryLight,
            ),
            textAlign: TextAlign.center,
          ),

          const SizedBox(height: AppSpacing.xl),

          // Suggestion Chips Container
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(
                      LucideIcons.sparkles,
                      size: 16,
                      color: AppColors.primary,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'Suggested Requirements',
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),
                Wrap(
                  spacing: AppSpacing.xs,
                  runSpacing: AppSpacing.xs,
                  children: _suggestions.map((item) {
                    return SuggestionChipWidget(
                      item: item,
                      onTap: (prompt) {
                        setState(() {
                          _inputController.text = prompt;
                        });
                      },
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
