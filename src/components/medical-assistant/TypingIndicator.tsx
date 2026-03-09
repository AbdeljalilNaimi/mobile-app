import { motion } from "framer-motion";
import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2"
    >
      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
        <Bot className="w-3 h-3 text-foreground" />
      </div>
      <div className="bg-muted/50 border border-border rounded-2xl rounded-tl-sm px-3.5 py-2.5 flex items-center gap-1">
        <motion.span
          className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
        />
        <motion.span
          className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
        />
        <motion.span
          className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
        />
      </div>
    </motion.div>
  );
}
