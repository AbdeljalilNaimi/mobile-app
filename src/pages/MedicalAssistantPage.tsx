import { useMemo } from "react";
import { motion } from "framer-motion";
import { Bot, AlertTriangle, Phone, Sparkles, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { SymptomTriageBot } from "@/components/medical-assistant/SymptomTriageBot";

export default function MedicalAssistantPage() {
  const { language } = useLanguage();

  const t = useMemo(() => {
    const translations = {
      fr: {
        title: "Assistant Médical IA",
        online: "En ligne",
        disclaimer: "Ne remplace pas un avis médical. Urgence →",
      },
      ar: {
        title: "المساعد الطبي الذكي",
        online: "متصل",
        disclaimer: "لا يحل محل الاستشارة الطبية. طوارئ →",
      },
      en: {
        title: "AI Medical Assistant",
        online: "Online",
        disclaimer: "Does not replace medical advice. Emergency →",
      },
    };
    return translations[language as keyof typeof translations] || translations.fr;
  }, [language]);

  return (
    <div className={cn(
      "flex flex-col bg-background",
      "h-[calc(100vh-4rem-env(safe-area-inset-bottom,8px))]",
      language === "ar" && "rtl"
    )}>
      {/* Compact Header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="shrink-0 border-b border-border/40 bg-background/90 backdrop-blur-xl"
      >
        <div className="px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md shadow-teal-500/20">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background" />
              </div>
              <div>
                <h1 className="font-semibold text-sm flex items-center gap-1">
                  {t.title}
                  <Sparkles className="w-3 h-3 text-teal-500" />
                </h1>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{t.online}</span>
                </div>
              </div>
            </div>

            <Button
              variant="destructive"
              size="sm"
              className="gap-1 rounded-lg shadow-md shadow-destructive/20 h-8 text-xs px-3"
              onClick={() => window.location.href = "tel:15"}
            >
              <Phone className="w-3 h-3" />
              <span className="font-bold">15</span>
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1.5 bg-amber-500/8 rounded-lg px-2 py-1 border border-amber-500/10">
            <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
            <span>{t.disclaimer} <strong>15</strong></span>
          </div>
        </div>
      </motion.header>

      {/* Chat — fills remaining height */}
      <main className="flex-1 min-h-0 overflow-hidden">
        <SymptomTriageBot />
      </main>
    </div>
  );
}
