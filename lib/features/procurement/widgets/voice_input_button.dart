import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../services/speech_service.dart';
import 'language_selector.dart';

class VoiceInputButton extends StatefulWidget {
  final ValueChanged<String> onSpeechResult;
  final String selectedLocaleId;
  final ValueChanged<String>? onLanguageChanged;

  const VoiceInputButton({
    super.key,
    required this.onSpeechResult,
    this.selectedLocaleId = 'en_IN',
    this.onLanguageChanged,
  });

  @override
  State<VoiceInputButton> createState() => _VoiceInputButtonState();
}

class _VoiceInputButtonState extends State<VoiceInputButton>
    with SingleTickerProviderStateMixin {
  late SpeechService _speechService;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  bool _isListening = false;
  bool _isInitializing = false;
  String _liveTranscription = '';
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _speechService = SpeechService();

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.35).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _speechService.dispose();
    super.dispose();
  }

  Future<void> _toggleListening() async {
    if (_isListening) {
      await _stopListening();
      return;
    }

    setState(() {
      _isInitializing = true;
      _errorMessage = null;
      _liveTranscription = '';
    });

    final success = await _speechService.startListening(
      localeId: widget.selectedLocaleId,
      onResult: (words) {
        if (mounted) {
          setState(() {
            _liveTranscription = words;
          });
          widget.onSpeechResult(words);
        }
      },
    );

    if (!mounted) return;

    if (success) {
      setState(() {
        _isListening = true;
        _isInitializing = false;
      });
      _pulseController.repeat(reverse: true);
      _showVoiceBottomSheet();
    } else {
      setState(() {
        _isListening = false;
        _isInitializing = false;
        _errorMessage =
            _speechService.lastError ?? 'Speech recognition failed to start.';
      });
      _showErrorSnackBar(_errorMessage!);
    }
  }

  Future<void> _stopListening() async {
    _pulseController.stop();
    await _speechService.stopListening();
    if (mounted) {
      setState(() {
        _isListening = false;
      });
    }
  }

  void _showErrorSnackBar(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(LucideIcons.alertCircle, color: Colors.white, size: 18),
            const SizedBox(width: AppSpacing.sm),
            Expanded(child: Text(msg)),
          ],
        ),
        backgroundColor: AppColors.error,
        action: SnackBarAction(
          label: 'Retry',
          textColor: Colors.white,
          onPressed: _toggleListening,
        ),
      ),
    );
  }

  void _showVoiceBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (bottomSheetContext) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            final theme = Theme.of(context);
            final isDark = theme.brightness == Brightness.dark;

            return Container(
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(
                color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(AppSpacing.radiusXl),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.3),
                    blurRadius: 16,
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Top Handle Bar
                  Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: isDark
                          ? AppColors.borderDark
                          : AppColors.borderLight,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),

                  const SizedBox(height: AppSpacing.md),

                  // Language Selector Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Speak Requirements',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (widget.onLanguageChanged != null) ...[
                        LanguageSelector(
                          selectedLocaleId: widget.selectedLocaleId,
                          onLanguageChanged: (locale) {
                            widget.onLanguageChanged!(locale);
                            setModalState(() {});
                          },
                        ),
                      ],
                    ],
                  ),

                  const SizedBox(height: AppSpacing.xl),

                  // Animated Pulsing Mic Circle
                  AnimatedBuilder(
                    animation: _pulseAnimation,
                    builder: (context, child) {
                      return Transform.scale(
                        scale: _isListening ? _pulseAnimation.value : 1.0,
                        child: Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            gradient: AppColors.aiGradient,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primary.withValues(
                                  alpha: _isListening ? 0.6 : 0.3,
                                ),
                                blurRadius: _isListening ? 24 : 8,
                                spreadRadius: _isListening ? 4 : 0,
                              ),
                            ],
                          ),
                          child: const Icon(
                            LucideIcons.mic,
                            size: 36,
                            color: Colors.white,
                          ),
                        ),
                      );
                    },
                  ),

                  const SizedBox(height: AppSpacing.lg),

                  // Status Text
                  Text(
                    _isListening ? 'Listening...' : 'Tap microphone to speak',
                    style: theme.textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),

                  const SizedBox(height: AppSpacing.xs),

                  Text(
                    'Speak item names, quantities, or budget naturally.',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: isDark
                          ? AppColors.textSecondaryDark
                          : AppColors.textSecondaryLight,
                    ),
                    textAlign: TextAlign.center,
                  ),

                  const SizedBox(height: AppSpacing.lg),

                  // Live Transcription Card
                  Container(
                    width: double.infinity,
                    constraints: const BoxConstraints(
                      minHeight: 60,
                      maxHeight: 120,
                    ),
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: isDark
                          ? AppColors.surfaceVariantDark
                          : AppColors.surfaceVariantLight,
                      borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
                      border: Border.all(
                        color: isDark
                            ? AppColors.borderDark
                            : AppColors.borderLight,
                      ),
                    ),
                    child: SingleChildScrollView(
                      child: Text(
                        _liveTranscription.isNotEmpty
                            ? _liveTranscription
                            : 'Listening for speech input...',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          fontStyle: _liveTranscription.isEmpty
                              ? FontStyle.italic
                              : FontStyle.normal,
                          color: _liveTranscription.isEmpty
                              ? (isDark
                                    ? AppColors.textMutedDark
                                    : AppColors.textMutedLight)
                              : (isDark
                                    ? AppColors.textPrimaryDark
                                    : AppColors.textPrimaryLight),
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: AppSpacing.xl),

                  // Action Buttons
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {
                            _stopListening();
                            Navigator.pop(bottomSheetContext);
                          },
                          child: const Text('Cancel'),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            _stopListening();
                            Navigator.pop(bottomSheetContext);
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                          ),
                          child: const Text('Done & Review'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isInitializing) {
      return const SizedBox(
        width: 20,
        height: 20,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
        ),
      );
    }

    return IconButton(
      icon: Icon(
        _isListening ? LucideIcons.micOff : LucideIcons.mic,
        size: 20,
        color: _isListening ? AppColors.error : AppColors.primary,
      ),
      tooltip: _isListening ? 'Stop Listening' : 'Speak Requirements',
      onPressed: _toggleListening,
    );
  }
}
