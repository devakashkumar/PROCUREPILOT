import { Variants, Transition } from "framer-motion";

export const easeOutExpo = [0.22, 1, 0.36, 1] as const;

export const durations = {
  fast: 0.18,
  base: 0.4,
  slow: 0.7,
} as const;

export const springPreset: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 30,
};

export const standardTransition: Transition = {
  duration: durations.base,
  ease: easeOutExpo,
};

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: standardTransition,
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: durations.fast, ease: easeOutExpo },
  },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { ...springPreset },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: durations.fast },
  },
};

export const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: standardTransition,
  },
  exit: {
    opacity: 0,
    x: 24,
    transition: { duration: durations.fast },
  },
};

export const blurInVariants: Variants = {
  hidden: { opacity: 0, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: durations.slow, ease: easeOutExpo },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};
