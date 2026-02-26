import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bot, AlertTriangle, Phone, Sparkles, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { SymptomTriageBot } from "@/components/medical-assistant/SymptomTriageBot";

export default function MedicalAssistantPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const t = useMemo(() => {
    const translations = {
      fr: {
        title: "Assistant Médical IA",
        subtitle: "Évaluation intelligente de vos symptômes",
        online: "En ligne",
        stats: "10k+ réponses",
        disclaimer: "Important : Cet assistant ne remplace pas un professionnel de santé. En cas d'urgence, appelez le 15 (SAMU).",
      },
      ar: {
        title: "المساعد الطبي الذكي",
        subtitle: "تقييم ذكي لأعراضك",
        online: "متصل",
        stats: "+10k إجابة",
        disclaimer: "هام: هذا المساعد لا يحل محل المتخصص الصحي. في حالة الطوارئ، اتصل بالإسعاف.",
      },
      en: {
        title: "AI Medical Assistant",
        subtitle: "Intelligent symptom assessment",
        online: "Online",
        stats: "10k+ answers",
        disclaimer: "Important: This assistant does not replace a healthcare professional. In case of emergency, call emergency services.",
      },
    };
    return translations[language as keyof typeof translations] || translations.fr;
  }, [language]);

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-b from-teal-50/30 via-background to-background pt-16",
      "dark:from-teal-950/10 dark:via-background dark:to-background",
      language === "ar" && "rtl"
    )}>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/40"
      >
        <div className="container mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="rounded-xl hover:bg-muted h-9 w-9"
              >
                <ArrowLeft className={cn("h-4 w-4", language === "ar" && "rotate-180")} />
              </Button>

              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-background"
                  />
                </motion.div>

                <div>
                  <h1 className="font-semibold text-base flex items-center gap-1.5">
                    {t.title}
                    <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                  </h1>
                  <p className="text-xs text-muted-foreground">{t.subtitle}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs px-2.5"
              >
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                {t.online}
              </Badge>
              <Badge variant="outline" className="hidden md:flex items-center gap-1 text-xs px-2.5">
                <Activity className="w-3 h-3" />
                {t.stats}
              </Badge>
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5 rounded-xl shadow-md shadow-destructive/20 h-9"
                onClick={() => window.location.href = "tel:15"}
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="font-semibold">15</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="container mx-auto px-4 py-3"
      >
        <Alert className="border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/10 rounded-xl">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-sm text-muted-foreground">
            {t.disclaimer}
          </AlertDescription>
        </Alert>
      </motion.div>

      {/* Triage Bot */}
      <main className="container mx-auto px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SymptomTriageBot />
        </motion.div>
      </main>
    </div>
  );
}
