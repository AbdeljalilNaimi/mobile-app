import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Bot, User, ShieldAlert, ShieldCheck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { CityHealthProvider } from "@/data/providers";
import { getVerifiedProviders } from "@/services/firestoreProviderService";
import { DoctorProfileCard } from "./DoctorProfileCard";
import { supabase } from "@/lib/supabaseClient";

interface TriageMessage {
  role: "user" | "assistant";
  content: string;
  doctorIds?: string[];
  recommendedSpecialty?: string;
  urgencyLevel?: "low" | "medium" | "high";
}

interface SimplifiedDoctor {
  id: string;
  name: string;
  specialty?: string;
  city: string;
  type: string;
}

export function SymptomTriageBot() {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<TriageMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [providers, setProviders] = useState<CityHealthProvider[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoadingProviders(true);
    getVerifiedProviders()
      .then(setProviders)
      .catch(console.error)
      .finally(() => setIsLoadingProviders(false));
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const simplifiedDoctors: SimplifiedDoctor[] = useMemo(() => {
    return providers.map(p => ({ id: p.id, name: p.name, specialty: p.specialty, city: p.city, type: p.type }));
  }, [providers]);

  const t = useMemo(() => ({
    fr: {
      welcome: "Bonjour ! 👋 Décrivez vos symptômes et je vous orienterai vers le spécialiste le plus adapté parmi les professionnels inscrits sur CityHealth.",
      noSpecialist: "Nous n'avons malheureusement pas de spécialiste en",
      noSpecialistSuffix: "inscrit sur la plateforme pour le moment.",
      recommended: "Spécialistes recommandés :",
      send: "Envoyer",
      placeholder: "Décrivez vos symptômes en détail...",
      helper: "Appuyez sur Entrée pour envoyer · Shift+Entrée pour un retour à la ligne",
    },
    ar: {
      welcome: "مرحباً! 👋 صف أعراضك وسأوجهك إلى الأخصائي المناسب من بين المهنيين المسجلين على CityHealth.",
      noSpecialist: "للأسف لا يوجد لدينا أخصائي في",
      noSpecialistSuffix: "مسجل على المنصة حالياً.",
      recommended: "الأخصائيون الموصى بهم:",
      send: "إرسال",
      placeholder: "صف أعراضك بالتفصيل...",
      helper: "اضغط Enter للإرسال · Shift+Enter لسطر جديد",
    },
    en: {
      welcome: "Hello! 👋 Describe your symptoms and I'll guide you to the most suitable specialist among professionals registered on CityHealth.",
      noSpecialist: "Unfortunately, we don't have a specialist in",
      noSpecialistSuffix: "registered on the platform at this time.",
      recommended: "Recommended specialists:",
      send: "Send",
      placeholder: "Describe your symptoms in detail...",
      helper: "Press Enter to send · Shift+Enter for a new line",
    },
  }[language] || {
    welcome: "", noSpecialist: "", noSpecialistSuffix: "", recommended: "", send: "Envoyer", placeholder: "", helper: "",
  }), [language]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: "assistant", content: t.welcome }]);
    }
  }, []);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || isLoadingProviders) return;

    setMessages(prev => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("symptom-triage", {
        body: {
          userSymptoms: trimmed,
          availableDoctors: simplifiedDoctors,
          language,
        },
      });

      if (error) {
        setMessages(prev => [...prev, { role: "assistant", content: error.message || "Une erreur est survenue." }]);
        setIsLoading(false);
        return;
      }
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.analysis || "Analyse non disponible.",
        doctorIds: data.doctorIds || [],
        recommendedSpecialty: data.recommendedSpecialty || "",
        urgencyLevel: data.urgencyLevel || undefined,
      }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Erreur de connexion. Veuillez réessayer." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getDoctorById = (id: string) => providers.find(p => p.id === id);

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md overflow-hidden shadow-2xl shadow-black/5">
        {/* Messages */}
        <ScrollArea
          className="h-[calc(100vh-320px)] min-h-[400px]"
          ref={scrollRef as any}
        >
          <div className="px-6 py-6 space-y-6">
            <AnimatePresence mode="popLayout">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  {/* Bot avatar */}
                  {msg.role === "assistant" && (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shrink-0 mt-1 shadow-md shadow-teal-500/20">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div className={cn(
                    "max-w-[80%] space-y-3",
                    msg.role === "user" ? "order-1" : ""
                  )}>
                    {/* Message bubble */}
                    <div className={cn(
                      "rounded-2xl px-5 py-4 text-base leading-relaxed",
                      msg.role === "user"
                        ? "bg-gradient-to-br from-teal-600 to-cyan-600 text-white rounded-br-md shadow-md shadow-teal-500/15"
                        : "bg-muted/70 border border-border/40 rounded-bl-md"
                    )}>
                      {msg.content}
                    </div>

                    {/* Urgency badge */}
                    {msg.role === "assistant" && msg.urgencyLevel && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold w-fit",
                          msg.urgencyLevel === "high" && "bg-destructive/10 text-destructive border border-destructive/20",
                          msg.urgencyLevel === "medium" && "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
                          msg.urgencyLevel === "low" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
                        )}
                      >
                        {msg.urgencyLevel === "high" && <ShieldAlert className="w-3.5 h-3.5" />}
                        {msg.urgencyLevel === "medium" && <Shield className="w-3.5 h-3.5" />}
                        {msg.urgencyLevel === "low" && <ShieldCheck className="w-3.5 h-3.5" />}
                        {msg.urgencyLevel === "high" && (language === "ar" ? "عاجل" : language === "en" ? "High urgency" : "Urgence élevée")}
                        {msg.urgencyLevel === "medium" && (language === "ar" ? "متوسط" : language === "en" ? "Moderate" : "Modéré")}
                        {msg.urgencyLevel === "low" && (language === "ar" ? "منخفض" : language === "en" ? "Low urgency" : "Faible")}
                      </motion.div>
                    )}

                    {/* Doctor cards */}
                    {msg.role === "assistant" && msg.doctorIds && msg.doctorIds.length > 0 && (
                      <div className="flex flex-col gap-3 mt-3">
                        <p className="text-xs font-semibold text-muted-foreground tracking-wide uppercase px-1">{t.recommended}</p>
                        {msg.doctorIds.map((id, idx) => {
                          const doc = getDoctorById(id);
                          if (!doc) return null;
                          return (
                            <motion.div
                              key={id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                            >
                              <DoctorProfileCard
                                id={doc.id}
                                name={doc.name}
                                specialty={doc.specialty}
                                city={doc.city}
                                language={language}
                                image={doc.image}
                              />
                            </motion.div>
                          );
                        })}
                      </div>
                    )}

                    {/* No specialist message */}
                    {msg.role === "assistant" && msg.doctorIds && msg.doctorIds.length === 0 && msg.recommendedSpecialty && (
                      <div className="rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 p-4 text-sm text-muted-foreground">
                        {t.noSpecialist} <strong>{msg.recommendedSpecialty}</strong> {t.noSpecialistSuffix}
                      </div>
                    )}
                  </div>

                  {/* User avatar */}
                  {msg.role === "user" && (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1 order-2">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shrink-0 shadow-md shadow-teal-500/20">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-muted/70 border border-border/40 rounded-2xl rounded-bl-md px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="flex gap-1">
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }} className="w-2 h-2 rounded-full bg-teal-500" />
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 rounded-full bg-teal-500" />
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 rounded-full bg-teal-500" />
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
                      {language === "ar" ? "جاري التحليل..." : language === "en" ? "Analyzing..." : "Analyse en cours..."}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="p-5 border-t border-border/50 bg-gradient-to-t from-muted/50 to-transparent">
          <div className="flex gap-3 items-end">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              className="min-h-[56px] max-h-[140px] resize-none text-base rounded-xl border-border/60 bg-background/80 backdrop-blur-sm shadow-sm focus:shadow-md transition-shadow"
              rows={1}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading || isLoadingProviders}
              size="icon"
              className={cn(
                "shrink-0 rounded-xl h-14 w-14 shadow-lg transition-all duration-200",
                input.trim()
                  ? "bg-gradient-to-br from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-teal-500/25"
                  : "bg-muted text-muted-foreground shadow-none"
              )}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
          <p className="text-[11px] text-center text-muted-foreground/50 mt-2.5 tracking-wide">
            {isLoadingProviders
              ? (language === "ar" ? "جاري تحميل الأطباء..." : language === "en" ? "Loading verified providers..." : "Chargement des prestataires vérifiés...")
              : t.helper}
          </p>
        </div>
      </div>
    </div>
  );
}
