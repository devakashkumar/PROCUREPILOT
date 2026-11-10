import { motion } from "framer-motion";

export function TopLoader({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-transparent">
      <motion.div
        className="h-full bg-accent"
        initial={{ width: "0%" }}
        animate={{ width: "85%" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
}
