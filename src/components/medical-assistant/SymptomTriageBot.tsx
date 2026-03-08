import { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";

interface TriageMessage {
  role: "user" | "assistant";
  content: string;
  doctorIds?: string[];
  recommendedSpecialty?: string;
  urgencyLevel?: "low" | "medium" | "high";
  isError?: boolean;
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
    { emoji: "🤢", label: "Nausées", query: "J'ai des nausées et vomissements" },
    { emoji: "😮‍💨", label: "Respiration", query: "J'ai des difficultés à respirer" },
    { emoji: "💊", label: "Médicament", query: "J'ai un problème avec mon médicament" },
    { emoji: "🦷", label: "Dentaire", query: "J'ai une douleur dentaire intense" },
    { emoji: "👁️", label: "Vision", query: "Ma vue a baissé récemment" },
    { emoji: "🤰", label: "Grossesse", query: "Je cherche un suivi de grossesse" },
    { emoji: "🩸", label: "Don de sang", query: "Je souhaite faire un don de sang" },
    { emoji: "😰", label: "Stress", query: "Je souffre de stress et d'anxiété" },
    { emoji: "🏥", label: "Médecin", query: "Aidez-moi à trouver un médecin" },
  ],
  ar: [
    { emoji: "🤒", label: "حمى", query: "لدي حمى، ماذا أفعل؟" },
    { emoji: "🫀", label: "ألم الصدر", query: "لدي ألم في الصدر" },
    { emoji: "🤕", label: "صداع", query: "أعاني من صداع متكرر وشديد" },
    { emoji: "🤢", label: "غثيان", query: "أعاني من غثيان وقيء" },
    { emoji: "😮‍💨", label: "تنفس", query: "أعاني من صعوبة في التنفس" },
    { emoji: "💊", label: "دواء", query: "لدي مشكلة مع دوائي" },
    { emoji: "🦷", label: "أسنان", query: "لدي ألم أسنان شديد" },
    { emoji: "👁️", label: "نظر", query: "تراجعت رؤيتي مؤخراً" },
    { emoji: "🤰", label: "حمل", query: "أبحث عن متابعة الحمل" },
    { emoji: "🩸", label: "تبرع", query: "أريد التبرع بالدم" },
    { emoji: "😰", label: "قلق", query: "أعاني من التوتر والقلق" },
    { emoji: "🏥", label: "طبيب", query: "ساعدني في إيجاد طبيب" },
  ],
  en: [
    { emoji: "🤒", label: "Fever", query: "I have a fever, what should I do?" },
    { emoji: "🫀", label: "Chest pain", query: "I have chest pain" },
    { emoji: "🤕", label: "Headache", query: "I have frequent and intense headaches" },
    { emoji: "🤢", label: "Nausea", query: "I have nausea and vomiting" },
    { emoji: "😮‍💨", label: "Breathing", query: "I have difficulty breathing" },
    { emoji: "💊", label: "Medication", query: "I have a problem with my medication" },
    { emoji: "🦷", label: "Toothache", query: "I have an intense toothache" },
    { emoji: "👁️", label: "Vision", query: "My vision has decreased recently" },
    { emoji: "🤰", label: "Pregnancy", query: "I'm looking for pregnancy follow-up" },
    { emoji: "🩸", label: "Blood", query: "I would like to donate blood" },
    { emoji: "😰", label: "Stress", query: "I suffer from stress and anxiety" },
    { emoji: "🏥", label: "Doctor", query: "Help me find a doctor" },
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

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsForIndex, setSuggestionsForIndex] = useState<number | null>(null);

  useEffect(() => {
    if (resetKey > 0) {
      if (initialMessages && initialMessages.length > 0) {
        setMessages(initialMessages.map(m => ({ role: m.role, content: m.content })));
      } else {
        setMessages([]);
      }
      setInput("");
      setIsLoading(false);
      setSuggestions([]);
      setSuggestionsLoading(false);
      setSuggestionsForIndex(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [resetKey, initialMessages]);

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
  }, [messages, isLoading, suggestionsLoading, suggestions]);

  const simplifiedDoctors: SimplifiedDoctor[] = useMemo(() => {
    return providers.map((p) => ({ id: p.id, name: p.name, specialty: p.specialty, city: p.city, type: p.type }));
  }, [providers]);

  const t = useMemo(() => ({
    fr: {
      welcome: "Comment puis-je vous aider ?",
      welcomeSub: "Décrivez vos symptômes ou choisissez ci-dessous",
      noSpecialist: "Nous n'avons malheureusement pas de spécialiste en",
      noSpecialistSuffix: "inscrit sur la plateforme pour le moment.",
      recommended: "Spécialistes recommandés",
      placeholder: "Décrivez vos symptômes...",
      helper: "Entrée pour envoyer",
      analyzing: "Analyse en cours...",
    },
    ar: {
      welcome: "كيف يمكنني مساعدتك؟",
      welcomeSub: "صف أعراضك أو اختر من الأسفل",
      noSpecialist: "للأسف لا يوجد لدينا أخصائي في",
      noSpecialistSuffix: "مسجل على المنصة حالياً.",
      recommended: "الأخصائيون الموصى بهم",
      placeholder: "صف أعراضك...",
      helper: "Enter للإرسال",
      analyzing: "جاري التحليل...",
    },
    en: {
      welcome: "How can I help you?",
      welcomeSub: "Describe your symptoms or pick below",
      noSpecialist: "Unfortunately, we don't have a specialist in",
      noSpecialistSuffix: "registered on the platform at this time.",
      recommended: "Recommended specialists",
      placeholder: "Describe your symptoms...",
      helper: "Enter to send",
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
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
        inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
      }
    }, 50);
  };

  const fetchSuggestions = useCallback(async (allMessages: TriageMessage[]) => {
    setSuggestionsLoading(true);
    setSuggestions([]);
    const targetIndex = allMessages.length - 1;
    setSuggestionsForIndex(targetIndex);

    await new Promise(r => setTimeout(r, 500));

    try {
      const { data, error } = await supabase.functions.invoke("suggest-followups", {
        body: {
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
          language,
        },
      });

      if (error || !data?.suggestions) {
        setSuggestions(["En savoir plus", "Quand consulter ?", "Trouver un médecin"]);
      } else {
        setSuggestions((data.suggestions as string[]).slice(0, 3));
      }
    } catch {
      setSuggestions(["En savoir plus", "Quand consulter ?", "Trouver un médecin"]);
    } finally {
      setSuggestionsLoading(false);
    }
  }, [language]);

  const sendMessage = async (text?: string) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isLoading || isLoadingProviders) return;

    setSuggestions([]);
    setSuggestionsLoading(false);
    setSuggestionsForIndex(null);

    const userMsg: TriageMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    onMessageSent?.("user", trimmed);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("symptom-triage", {
        body: { userSymptoms: trimmed, availableDoctors: simplifiedDoctors, language },
      });

      if (error) {
        const errContent = error.message || "Une erreur est survenue.";
        const errMsg: TriageMessage = { role: "assistant", content: errContent, isError: true };
        setMessages((prev) => [...prev, errMsg]);
        onMessageSent?.("assistant", errContent);
        setIsLoading(false);
        return;
      }
      const assistantContent = data.analysis || "Analyse non disponible.";
      const assistantMsg: TriageMessage = {
        role: "assistant",
        content: assistantContent,
        doctorIds: data.doctorIds || [],
        recommendedSpecialty: data.recommendedSpecialty || "",
        urgencyLevel: data.urgencyLevel || undefined,
      };
      setMessages((prev) => {
        const updated = [...prev, assistantMsg];
        fetchSuggestions(updated);
        return updated;
      });
      onMessageSent?.("assistant", assistantContent);
    } catch {
      const fallback = "Erreur de connexion. Veuillez réessayer.";
      setMessages((prev) => [...prev, { role: "assistant", content: fallback, isError: true }]);
      onMessageSent?.("assistant", fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (question: string) => {
    setSuggestions([]);
    setSuggestionsLoading(false);
    setSuggestionsForIndex(null);
    sendMessage(question);
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

  const lastAssistantIndex = messages.length - 1;

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
        <div className="px-3 sm:px-6 py-4 space-y-3">
          {/* Welcome state */}
          {!hasConversation && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-4 sm:py-10"
            >
              {/* Animated bot icon */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mb-4 shadow-lg shadow-teal-500/20"
              >
                <Bot className="w-7 h-7 text-white" />
              </motion.div>

              <h2 className="text-lg sm:text-xl font-bold text-center mb-1">{t.welcome}</h2>
              <p className="text-xs text-muted-foreground/70 text-center mb-5">{t.welcomeSub}</p>

              {/* Symptom chips — 3 columns on mobile for compact layout */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 w-full max-w-md">
                {chips.map((chip, i) => (
                  <motion.button
                    key={chip.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.03 }}
                    onClick={() => handleChipClick(chip.query)}
                    className={cn(
                      "flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-center",
                      "bg-card border border-border/60 hover:border-primary/40",
                      "hover:bg-primary/5 active:scale-95 transition-all duration-150",
                      "cursor-pointer group"
                    )}
                  >
                    <span className="text-xl leading-none">{chip.emoji}</span>
                    <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors leading-tight">
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
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                )}

                <div className={cn("max-w-[88%] sm:max-w-[75%] space-y-2", msg.role === "user" ? "order-1" : "")}>
                  <div className={cn(
                    "rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                    msg.role === "user"
                      ? "bg-gradient-to-br from-teal-600 to-cyan-600 text-white rounded-br-sm shadow-sm"
                      : "bg-muted/50 border border-border/30 rounded-bl-sm"
                  )}>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:mb-1.5 prose-p:last:mb-0 prose-ul:mb-1.5 prose-li:mb-0.5 prose-p:text-[13px] prose-li:text-[13px]">
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
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold w-fit",
                        msg.urgencyLevel === "high" && "bg-destructive/10 text-destructive border border-destructive/20",
                        msg.urgencyLevel === "medium" && "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
                        msg.urgencyLevel === "low" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                      )}
                    >
                      {msg.urgencyLevel === "high" && <ShieldAlert className="w-3 h-3" />}
                      {msg.urgencyLevel === "medium" && <Shield className="w-3 h-3" />}
                      {msg.urgencyLevel === "low" && <ShieldCheck className="w-3 h-3" />}
                      {msg.urgencyLevel === "high" && (language === "ar" ? "عاجل" : language === "en" ? "High urgency" : "Urgence élevée")}
                      {msg.urgencyLevel === "medium" && (language === "ar" ? "متوسط" : language === "en" ? "Moderate" : "Modéré")}
                      {msg.urgencyLevel === "low" && (language === "ar" ? "منخفض" : language === "en" ? "Low urgency" : "Faible")}
                    </motion.div>
                  )}

                  {/* Doctor cards */}
                  {msg.role === "assistant" && msg.doctorIds && msg.doctorIds.length > 0 && (
                    <div className="flex flex-col gap-2 mt-1.5">
                      <p className="text-[10px] font-semibold text-muted-foreground tracking-wide uppercase px-0.5">{t.recommended}</p>
                      {msg.doctorIds.map((id, idx) => {
                        const doc = getDoctorById(id);
                        if (!doc) return null;
                        return (
                          <motion.div key={id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}>
                            <DoctorProfileCard id={doc.id} name={doc.name} specialty={doc.specialty} city={doc.city} language={language} image={doc.image} />
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* No specialist */}
                  {msg.role === "assistant" && msg.doctorIds && msg.doctorIds.length === 0 && msg.recommendedSpecialty && (
                    <div className="rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 p-2.5 text-[11px] text-muted-foreground">
                      {t.noSpecialist} <strong>{msg.recommendedSpecialty}</strong> {t.noSpecialistSuffix}
                    </div>
                  )}

                  {/* Follow-up suggestion chips */}
                  {msg.role === "assistant" && i === lastAssistantIndex && !msg.isError && suggestionsForIndex === i && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {suggestionsLoading ? (
                        <>
                          <Skeleton className="h-6 w-20 rounded-full" />
                          <Skeleton className="h-6 w-24 rounded-full" />
                          <Skeleton className="h-6 w-18 rounded-full" />
                        </>
                      ) : (
                        <AnimatePresence>
                          {suggestions.map((q, idx) => (
                            <motion.button
                              key={q}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.06 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleSuggestionClick(q)}
                              className={cn(
                                "px-3 py-1.5 text-[11px] rounded-full",
                                "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
                                "border border-blue-200/50 dark:border-blue-800/40",
                                "active:bg-blue-100 dark:active:bg-blue-900/40",
                                "transition-all duration-150 cursor-pointer"
                              )}
                            >
                              {q}
                            </motion.button>
                          ))}
                        </AnimatePresence>
                      )}
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-[8px] bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 mt-1 order-2">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-muted/50 border border-border/30 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-muted-foreground/50" style={{ animationDelay: "0ms" }} />
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-muted-foreground/50" style={{ animationDelay: "150ms" }} />
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-muted-foreground/50" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground/60">{t.analyzing}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input area — safe area aware */}
      <div className="shrink-0 border-t border-border/30 bg-background/98 backdrop-blur-lg px-3 sm:px-6 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              rows={1}
              className={cn(
                "w-full resize-none text-[13px] rounded-xl border border-border/50 bg-muted/20 px-3.5 py-2.5",
                "placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-500/30",
                "transition-all duration-200 max-h-[100px]"
              )}
              disabled={isLoading || isLoadingProviders}
            />
          </div>
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading || isLoadingProviders}
            size="icon"
            className={cn(
              "shrink-0 rounded-xl h-10 w-10 transition-all duration-200 active:scale-95",
              input.trim()
                ? "bg-gradient-to-br from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-md shadow-teal-500/20"
                : "bg-muted text-muted-foreground shadow-none"
            )}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        {isLoadingProviders && (
          <p className="text-[10px] text-center text-muted-foreground/40 mt-1">
            {language === "ar" ? "جاري تحميل الأطباء..." : language === "en" ? "Loading providers..." : "Chargement des prestataires..."}
          </p>
        )}
      </div>
    </div>
  );
}
