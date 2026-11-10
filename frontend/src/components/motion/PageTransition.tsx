import { motion } from "framer-motion";
import { ReactNode } from "react";
import { easeOutExpo } from "../../lib/motion.js";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: easeOutExpo }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
