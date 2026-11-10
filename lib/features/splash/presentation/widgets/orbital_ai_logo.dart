import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_spacing.dart';

/// Animated Orbital AI Logo Widget for ProcurePilot
class OrbitalAiLogo extends StatefulWidget {
  final double size;
  final Animation<double> scaleAnimation;
  final Animation<double> opacityAnimation;

  const OrbitalAiLogo({
    super.key,
    this.size = 120.0,
    required this.scaleAnimation,
    required this.opacityAnimation,
  });

  @override
  State<OrbitalAiLogo> createState() => _OrbitalAiLogoState();
}

class _OrbitalAiLogoState extends State<OrbitalAiLogo>
    with SingleTickerProviderStateMixin {
  late AnimationController _rotationController;

  @override
  void initState() {
    super.initState();
    _rotationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 8),
    )..repeat();
  }

  @override
  void dispose() {
    _rotationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return FadeTransition(
      opacity: widget.opacityAnimation,
      child: ScaleTransition(
        scale: widget.scaleAnimation,
        child: SizedBox(
          width: widget.size * 1.5,
          height: widget.size * 1.5,
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Orbital Rotating Ring with AI Particle Node
              AnimatedBuilder(
                animation: _rotationController,
                builder: (context, child) {
                  return CustomPaint(
                    size: Size(widget.size * 1.4, widget.size * 1.4),
                    painter: _OrbitalPainter(
                      progress: _rotationController.value,
                      primaryColor: AppColors.primary,
                      accentColor: AppColors.secondary,
                      isDark: isDark,
                    ),
                  );
                },
              ),

              // Glowing Ambient Backdrop Shadow
              Container(
                width: widget.size * 0.8,
                height: widget.size * 0.8,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withValues(
                        alpha: isDark ? 0.45 : 0.25,
                      ),
                      blurRadius: 32,
                      spreadRadius: 8,
                    ),
                    BoxShadow(
                      color: AppColors.secondary.withValues(
                        alpha: isDark ? 0.2 : 0.15,
                      ),
                      blurRadius: 24,
                      spreadRadius: -2,
                    ),
                  ],
                ),
              ),

              // Central Brand Icon Container
              Container(
                width: widget.size,
                height: widget.size,
                decoration: BoxDecoration(
                  gradient: AppColors.aiGradient,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
                  border: Border.all(
                    color: AppColors.secondary.withValues(alpha: 0.3),
                    width: 1.5,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.2),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Center(
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      Icon(
                        LucideIcons.sparkles,
                        size: widget.size * 0.48,
                        color: Colors.white,
                      ),
                      Positioned(
                        right: widget.size * 0.2,
                        bottom: widget.size * 0.2,
                        child: Container(
                          width: 12,
                          height: 12,
                          decoration: BoxDecoration(
                            color: AppColors.secondary,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.secondary.withValues(
                                  alpha: 0.8,
                                ),
                                blurRadius: 6,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Custom painter for the orbital ring and orbiting AI particle
class _OrbitalPainter extends CustomPainter {
  final double progress;
  final Color primaryColor;
  final Color accentColor;
  final bool isDark;

  _OrbitalPainter({
    required this.progress,
    required this.primaryColor,
    required this.accentColor,
    required this.isDark,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 4;

    // Track Ring Paint
    final trackPaint = Paint()
      ..color = (isDark ? primaryColor : primaryColor.withValues(alpha: 0.3))
          .withValues(alpha: 0.2)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    canvas.drawCircle(center, radius, trackPaint);

    // Glowing Arc Segment Paint
    final angle = progress * 2 * math.pi;
    final arcPaint = Paint()
      ..shader = SweepGradient(
        colors: [
          primaryColor.withValues(alpha: 0.0),
          primaryColor,
          accentColor,
        ],
        stops: const [0.0, 0.7, 1.0],
        transform: GradientRotation(angle),
      ).createShader(Rect.fromCircle(center: center, radius: radius))
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 2.5;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      angle - math.pi / 2,
      math.pi * 0.8,
      false,
      arcPaint,
    );

    // Orbiting AI Particle Node
    final particleAngle = angle + math.pi * 0.3;
    final particleOffset = Offset(
      center.dx + radius * math.cos(particleAngle),
      center.dy + radius * math.sin(particleAngle),
    );

    // Glow effect for particle
    final particleGlowPaint = Paint()
      ..color = accentColor.withValues(alpha: 0.6)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 6);
    canvas.drawCircle(particleOffset, 5, particleGlowPaint);

    // Particle core
    final particlePaint = Paint()..color = accentColor;
    canvas.drawCircle(particleOffset, 3.5, particlePaint);
  }

  @override
  bool shouldRepaint(covariant _OrbitalPainter oldDelegate) {
    return oldDelegate.progress != progress || oldDelegate.isDark != isDark;
  }
}
