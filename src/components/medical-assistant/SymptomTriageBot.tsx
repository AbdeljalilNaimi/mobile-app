import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Bot, User, ShieldAlert, ShieldCheck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { CityHealthProvider } from "@/data/providers";
import { getVerifiedProviders } from "@/services/firestoreProviderService";
import { DoctorProfileCard } from "./DoctorProfileCard";
import { supabase } from "@/lib/supabaseClient";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

interface SymptomChip {
  emoji: string;
  label: string;
  query: string;
}

const SYMPTOM_CHIPS: Record<string, SymptomChip[]> = {
  fr: [
    { emoji: "🤒", label: "Fièvre", query: "J'ai de la fièvre, que dois-je faire ?" },
    { emoji: "🫀", label: "Douleur thoracique", query: "J'ai une douleur dans la poitrine" },
    { emoji: "🤕", label: "Maux de tête", query: "J'ai des maux de tête fréquents et intenses" },
    { emoji: "🤢", label: "Nausées / Vomissements", query: "J'ai des nausées et vomissements" },
    { emoji: "😮‍💨", label: "Difficultés respiratoires", query: "J'ai des difficultés à respirer" },
    { emoji: "💊", label: "Problème de médicament", query: "J'ai un problème avec mon médicament" },
    { emoji: "🦷", label: "Douleur dentaire", query: "J'ai une douleur dentaire intense" },
    { emoji: "👁️", label: "Problème de vision", query: "Ma vue a baissé récemment" },
    { emoji: "🤰", label: "Suivi grossesse", query: "Je cherche un suivi de grossesse" },
    { emoji: "🩸", label: "Don de sang", query: "Je souhaite faire un don de sang" },
    { emoji: "😰", label: "Stress / Anxiété", query: "Je souffre de stress et d'anxiété" },
    { emoji: "🏥", label: "Trouver un médecin", query: "Aidez-moi à trouver un médecin" },
  ],
  ar: [
    { emoji: "🤒", label: "حمى", query: "لدي حمى، ماذا أفعل؟" },
    { emoji: "🫀", label: "ألم في الصدر", query: "لدي ألم في الصدر" },
    { emoji: "🤕", label: "صداع", query: "أعاني من صداع متكرر وشديد" },
    { emoji: "🤢", label: "غثيان / قيء", query: "أعاني من غثيان وقيء" },
    { emoji: "😮‍💨", label: "صعوبات في التنفس", query: "أعاني من صعوبة في التنفس" },
    { emoji: "💊", label: "مشكلة دواء", query: "لدي مشكلة مع دوائي" },
    { emoji: "🦷", label: "ألم أسنان", query: "لدي ألم أسنان شديد" },
    { emoji: "👁️", label: "مشكلة في النظر", query: "تراجعت رؤيتي مؤخراً" },
    { emoji: "🤰", label: "متابعة الحمل", query: "أبحث عن متابعة الحمل" },
    { emoji: "🩸", label: "التبرع بالدم", query: "أريد التبرع بالدم" },
    { emoji: "😰", label: "توتر / قلق", query: "أعاني من التوتر والقلق" },
    { emoji: "🏥", label: "إيجاد طبيب", query: "ساعدني في إيجاد طبيب" },
  ],
  en: [
    { emoji: "🤒", label: "Fever", query: "I have a fever, what should I do?" },
    { emoji: "🫀", label: "Chest pain", query: "I have chest pain" },
    { emoji: "🤕", label: "Headache", query: "I have frequent and intense headaches" },
    { emoji: "🤢", label: "Nausea / Vomiting", query: "I have nausea and vomiting" },
    { emoji: "😮‍💨", label: "Breathing difficulties", query: "I have difficulty breathing" },
    { emoji: "💊", label: "Medication issue", query: "I have a problem with my medication" },
    { emoji: "🦷", label: "Toothache", query: "I have an intense toothache" },
    { emoji: "👁️", label: "Vision problem", query: "My vision has decreased recently" },
    { emoji: "🤰", label: "Pregnancy care", query: "I'm looking for pregnancy follow-up" },
    { emoji: "🩸", label: "Blood donation", query: "I would like to donate blood" },
    { emoji: "😰", label: "Stress / Anxiety", query: "I suffer from stress and anxiety" },
    { emoji: "🏥", label: "Find a doctor", query: "Help me find a doctor" },
  ],
};

interface SymptomTriageBotProps {
  resetKey?: number;
  onMessageSent?: (role: "user" | "assistant", content: string) => void;
  initialMessages?: { role: "user" | "assistant"; content: string }[];
}

export function SymptomTriageBot({ resetKey = 0, onMessageSent, initialMessages }: SymptomTriageBotProps) {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<TriageMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [providers, setProviders] = useState<CityHealthProvider[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Reset on resetKey change
  useEffect(() => {
    if (resetKey > 0) {
      setMessages([]);
      setInput("");
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [resetKey]);

  useEffect(() => {
    setIsLoadingProviders(true);
    getVerifiedProviders()
      .then(setProviders)
      .catch(console.error)
      .finally(() => setIsLoadingProviders(false));
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const simplifiedDoctors: SimplifiedDoctor[] = useMemo(() => {
    return providers.map((p) => ({ id: p.id, name: p.name, specialty: p.specialty, city: p.city, type: p.type }));
  }, [providers]);

  const t = useMemo(() => ({
    fr: {
      welcome: "Bonjour ! 👋 Décrivez vos symptômes et je vous orienterai vers le spécialiste le plus adapté.",
      welcomeSub: "Choisissez un symptôme courant ou décrivez le vôtre",
      noSpecialist: "Nous n'avons malheureusement pas de spécialiste en",
      noSpecialistSuffix: "inscrit sur la plateforme pour le moment.",
      recommended: "Spécialistes recommandés",
      placeholder: "Décrivez vos symptômes...",
      helper: "Entrée pour envoyer · Maj+Entrée pour nouvelle ligne",
      analyzing: "Analyse en cours...",
    },
    ar: {
      welcome: "مرحباً! 👋 صف أعراضك وسأوجهك إلى الأخصائي المناسب.",
      welcomeSub: "اختر عرضاً شائعاً أو صف أعراضك",
      noSpecialist: "للأسف لا يوجد لدينا أخصائي في",
      noSpecialistSuffix: "مسجل على المنصة حالياً.",
      recommended: "الأخصائيون الموصى بهم",
      placeholder: "صف أعراضك...",
      helper: "Enter للإرسال · Shift+Enter لسطر جديد",
      analyzing: "جاري التحليل...",
    },
    en: {
      welcome: "Hello! 👋 Describe your symptoms and I'll guide you to the right specialist.",
      welcomeSub: "Pick a common symptom or describe yours",
      noSpecialist: "Unfortunately, we don't have a specialist in",
      noSpecialistSuffix: "registered on the platform at this time.",
      recommended: "Recommended specialists",
      placeholder: "Describe your symptoms...",
      helper: "Enter to send · Shift+Enter for new line",
      analyzing: "Analyzing...",
    },
  })[language] || {
    welcome: "", welcomeSub: "", noSpecialist: "", noSpecialistSuffix: "", recommended: "", placeholder: "", helper: "", analyzing: "",
  }, [language]);

  const chips = SYMPTOM_CHIPS[language as keyof typeof SYMPTOM_CHIPS] || SYMPTOM_CHIPS.fr;
  const hasConversation = messages.length > 0;

  const handleChipClick = (query: string) => {
    setInput(query);
    setTimeout(() => {
      inputRef.current?.focus();
      // Auto-resize
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
        inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
      }
    }, 50);
  };

  const sendMessage = async (text?: string) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isLoading || isLoadingProviders) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("symptom-triage", {
        body: { userSymptoms: trimmed, availableDoctors: simplifiedDoctors, language },
      });

      if (error) {
        setMessages((prev) => [...prev, { role: "assistant", content: error.message || "Une erreur est survenue." }]);
        setIsLoading(false);
        return;
      }
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: data.analysis || "Analyse non disponible.",
        doctorIds: data.doctorIds || [],
        recommendedSpecialty: data.recommendedSpecialty || "",
        urgencyLevel: data.urgencyLevel || undefined,
      }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Erreur de connexion. Veuillez réessayer." }]);
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

  const getDoctorById = (id: string) => providers.find((p) => p.id === id);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 py-6 space-y-5">
          {/* Welcome state */}
          {!hasConversation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-6 sm:py-12"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-center mb-2">{t.welcome}</h2>
              <p className="text-sm text-muted-foreground text-center mb-6">{t.welcomeSub}</p>

              {/* 12 emoji symptom chips — 2 columns */}
              <div className="grid grid-cols-2 gap-2 w-full max-w-lg max-h-[340px] overflow-y-auto pr-1">
                {chips.map((chip, i) => (
                  <motion.button
                    key={chip.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.04 }}
                    onClick={() => handleChipClick(chip.query)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left",
                      "bg-card border border-border hover:border-primary",
                      "hover:bg-primary/5 transition-all duration-150",
                      "cursor-pointer group"
                    )}
                  >
                    <span className="text-[20px] leading-none shrink-0">{chip.emoji}</span>
                    <span className="text-[13px] font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                      {chip.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Chat messages */}
          <AnimatePresence mode="popLayout">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className={cn("max-w-[85%] sm:max-w-[75%] space-y-2.5", msg.role === "user" ? "order-1" : "")}>
                  <div className={cn(
                    "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-gradient-to-br from-teal-600 to-cyan-600 text-white rounded-br-md shadow-sm"
                      : "bg-muted/60 border border-border/30 rounded-bl-md"
                  )}>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:mb-2 prose-p:last:mb-0 prose-ul:mb-2 prose-li:mb-0.5">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
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
                        msg.urgencyLevel === "low" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
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
                    <div className="flex flex-col gap-2.5 mt-2">
                      <p className="text-xs font-semibold text-muted-foreground tracking-wide uppercase px-1">{t.recommended}</p>
                      {msg.doctorIds.map((id, idx) => {
                        const doc = getDoctorById(id);
                        if (!doc) return null;
                        return (
                          <motion.div key={id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                            <DoctorProfileCard id={doc.id} name={doc.name} specialty={doc.specialty} city={doc.city} language={language} image={doc.image} />
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* No specialist */}
                  {msg.role === "assistant" && msg.doctorIds && msg.doctorIds.length === 0 && msg.recommendedSpecialty && (
                    <div className="rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 p-3 text-xs text-muted-foreground">
                      {t.noSpecialist} <strong>{msg.recommendedSpecialty}</strong> {t.noSpecialistSuffix}
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 mt-1 order-2">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator — 3 bouncing dots */}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-card border border-border/30 rounded-2xl rounded-bl-md px-5 py-3.5">
                <div className="flex items-center gap-1.5">
                  <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground/50" style={{ animationDelay: "0ms" }} />
                  <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground/50" style={{ animationDelay: "150ms" }} />
                  <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground/50" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{t.analyzing}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-border/40 bg-background/95 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="flex gap-2.5 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              rows={1}
              className={cn(
                "w-full resize-none text-sm rounded-xl border border-border/60 bg-muted/30 px-4 py-3",
                "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/40",
                "transition-all duration-200 max-h-[120px]"
              )}
              disabled={isLoading || isLoadingProviders}
            />
          </div>
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading || isLoadingProviders}
            size="icon"
            className={cn(
              "shrink-0 rounded-xl h-11 w-11 transition-all duration-200",
              input.trim()
                ? "bg-gradient-to-br from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-lg shadow-teal-500/25"
                : "bg-muted text-muted-foreground shadow-none"
            )}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground/40 mt-1.5">
          {isLoadingProviders
            ? (language === "ar" ? "جاري تحميل الأطباء..." : language === "en" ? "Loading providers..." : "Chargement des prestataires...")
            : t.helper}
        </p>
      </div>
    </div>
  );
}
