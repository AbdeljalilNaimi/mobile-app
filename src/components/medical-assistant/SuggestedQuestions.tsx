import { motion } from "framer-motion";

interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

export function SuggestedQuestions({ questions, onSelect }: SuggestedQuestionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-wrap gap-1.5 mt-2"
    >
      {questions.slice(0, 3).map((question, index) => (
        <motion.button
          key={question}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + index * 0.08 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(question)}
          className="px-2.5 py-1 text-[11px] rounded-full border border-border bg-background text-foreground hover:bg-muted transition-colors"
        >
          {question}
        </motion.button>
      ))}
    </motion.div>
  );
}
