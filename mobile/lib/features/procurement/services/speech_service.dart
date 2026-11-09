import 'package:flutter/foundation.dart';
import 'package:speech_to_text/speech_recognition_error.dart';
import 'package:speech_to_text/speech_recognition_result.dart';
import 'package:speech_to_text/speech_to_text.dart';

enum SpeechState {
  uninitialized,
  initializing,
  available,
  listening,
  processing,
  error,
  unavailable,
}

class SpeechService {
  late final SpeechToText _speechToText;
  SpeechState _state = SpeechState.uninitialized;
  String? _lastError;
  bool _isAvailable = false;

  SpeechService({SpeechToText? speechToText}) {
    _speechToText = speechToText ?? SpeechToText();
  }

  SpeechState get state => _state;
  bool get isListening => _speechToText.isListening;
  bool get isAvailable => _isAvailable;
  String? get lastError => _lastError;

  /// Initialize speech recognition engine and check microphone permissions
  Future<bool> initialize({
    Function(SpeechRecognitionError)? onError,
    Function(String)? onStatus,
  }) async {
    if (_isAvailable && _state == SpeechState.available) return true;

    _state = SpeechState.initializing;
    try {
      _isAvailable = await _speechToText.initialize(
        onError: (SpeechRecognitionError error) {
          _state = SpeechState.error;
          _lastError = error.errorMsg;
          if (onError != null) onError(error);
        },
        onStatus: (String status) {
          if (onStatus != null) onStatus(status);
        },
        debugLogging: kDebugMode,
      );

      if (_isAvailable) {
        _state = SpeechState.available;
      } else {
        _state = SpeechState.unavailable;
        _lastError = 'Speech recognition unavailable on this device.';
      }
      return _isAvailable;
    } catch (e) {
      _state = SpeechState.error;
      _lastError = e.toString();
      return false;
    }
  }

  /// Start listening for voice input in specified locale (e.g. en_IN or hi_IN)
  Future<bool> startListening({
    required ValueChanged<String> onResult,
    String localeId = 'en_IN',
    Duration listenFor = const Duration(seconds: 30),
    Duration pauseFor = const Duration(seconds: 5),
  }) async {
    if (!_isAvailable) {
      final initialized = await initialize();
      if (!initialized) return false;
    }

    if (_speechToText.isListening) {
      await stopListening();
    }

    _state = SpeechState.listening;
    _lastError = null;

    try {
      await _speechToText.listen(
        onResult: (SpeechRecognitionResult result) {
          onResult(result.recognizedWords);
          if (result.finalResult) {
            _state = SpeechState.available;
          }
        },
        listenOptions: SpeechListenOptions(
          localeId: localeId,
          listenFor: listenFor,
          pauseFor: pauseFor,
          partialResults: true,
          cancelOnError: true,
          listenMode: ListenMode.dictation,
        ),
      );
      return true;
    } catch (e) {
      _state = SpeechState.error;
      _lastError = 'Failed to start speech recognition: $e';
      return false;
    }
  }

  /// Stop listening and commit current recognized words
  Future<void> stopListening() async {
    if (_speechToText.isListening) {
      _state = SpeechState.processing;
      await _speechToText.stop();
      _state = SpeechState.available;
    }
  }

  /// Cancel listening session
  Future<void> cancelListening() async {
    if (_speechToText.isListening) {
      await _speechToText.cancel();
      _state = SpeechState.available;
    }
  }

  /// Clean up resources
  void dispose() {
    if (_speechToText.isListening) {
      _speechToText.stop();
    }
  }
}
