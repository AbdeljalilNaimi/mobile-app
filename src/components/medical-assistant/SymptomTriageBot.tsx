import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Send, Loader2, Bot, ShieldAlert, ShieldCheck, Shield, Thermometer, Heart, Brain, AlertCircle, Wind, Pill, Eye, Smile, Baby, Droplets, MapPin, FileText } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { CityHealthProvider } from "@/data/providers";
import { getVerifiedProviders } from "@/services/firestoreProviderService";
import { DoctorProfileCard } from "./DoctorProfileCard";
import { supabase } from "@/integrations/supabase/client";
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
  timestamp?: string;
}

interface SimplifiedDoctor {
  id: string;
  name: string;
  specialty?: string;
  city: string;
  type: string;
}

interface SymptomChipData {
  icon: typeof Thermometer;
  label: string;
  query: string;
}

const SYMPTOM_CHIPS: Record<string, SymptomChipData[]> = {
  fr: [
    { icon: Thermometer, label: "Fièvre", query: "J'ai de la fièvre, que dois-je faire ?" },
    { icon: Heart, label: "Douleur thoracique", query: "J'ai une douleur dans la poitrine" },
    { icon: Brain, label: "Maux de tête", query: "J'ai des maux de tête fréquents et intenses" },
    { icon: AlertCircle, label: "Nausées", query: "J'ai des nausées et vomissements" },
    { icon: Wind, label: "Difficultés resp.", query: "J'ai des difficultés à respirer" },
    { icon: Pill, label: "Médicaments", query: "J'ai un problème avec mon médicament" },
    { icon: Eye, label: "Problème vision", query: "Ma vue a baissé récemment" },
    { icon: Smile, label: "Santé mentale", query: "Je souffre de stress et d'anxiété" },
    { icon: Baby, label: "Suivi grossesse", query: "Je cherche un suivi de grossesse" },
    { icon: Droplets, label: "Don de sang", query: "Je souhaite faire un don de sang" },
    { icon: MapPin, label: "Trouver médecin", query: "Aidez-moi à trouver un médecin" },
    { icon: FileText, label: "Résultats d'analyse", query: "J'ai besoin d'aide pour comprendre mes résultats d'analyse" },
  ],
  ar: [
    { icon: Thermometer, label: "حمى", query: "لدي حمى، ماذا أفعل؟" },
    { icon: Heart, label: "ألم الصدر", query: "لدي ألم في الصدر" },
    { icon: Brain, label: "صداع", query: "أعاني من صداع متكرر وشديد" },
    { icon: AlertCircle, label: "غثيان", query: "أعاني من غثيان وقيء" },
    { icon: Wind, label: "صعوبة تنفس", query: "أعاني من صعوبة في التنفس" },
    { icon: Pill, label: "أدوية", query: "لدي مشكلة مع دوائي" },
    { icon: Eye, label: "مشكلة نظر", query: "تراجعت رؤيتي مؤخراً" },
    { icon: Smile, label: "صحة نفسية", query: "أعاني من التوتر والقلق" },
    { icon: Baby, label: "متابعة حمل", query: "أبحث عن متابعة الحمل" },
    { icon: Droplets, label: "تبرع بالدم", query: "أريد التبرع بالدم" },
    { icon: MapPin, label: "إيجاد طبيب", query: "ساعدني في إيجاد طبيب" },
    { icon: FileText, label: "نتائج تحاليل", query: "أحتاج مساعدة لفهم نتائج تحاليلي" },
  ],
  en: [
    { icon: Thermometer, label: "Fever", query: "I have a fever, what should I do?" },
    { icon: Heart, label: "Chest pain", query: "I have chest pain" },
    { icon: Brain, label: "Headache", query: "I have frequent and intense headaches" },
    { icon: AlertCircle, label: "Nausea", query: "I have nausea and vomiting" },
    { icon: Wind, label: "Breathing issues", query: "I have difficulty breathing" },
    { icon: Pill, label: "Medication", query: "I have a problem with my medication" },
    { icon: Eye, label: "Vision problem", query: "My vision has decreased recently" },
    { icon: Smile, label: "Mental health", query: "I suffer from stress and anxiety" },
    { icon: Baby, label: "Pregnancy care", query: "I'm looking for pregnancy follow-up" },
    { icon: Droplets, label: "Blood donation", query: "I would like to donate blood" },
    { icon: MapPin, label: "Find a doctor", query: "Help me find a doctor" },
    { icon: FileText, label: "Test results", query: "I need help understanding my test results" },
  ],
};

interface SymptomTriageBotProps {
  resetKey?: number;
  onMessageSent?: (role: "user" | "assistant", content: string) => void;
  initialMessages?: { role: "user" | "assistant"; content: string }[];
  autoSendSymptom?: string | null;
}

export function SymptomTriageBot({ resetKey = 0, onMessageSent, initialMessages, autoSendSymptom }: SymptomTriageBotProps) {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<TriageMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [providers, setProviders] = useState<CityHealthProvider[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const autoSentRef = useRef(false);

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

  const SYMPTOM_KEY_QUERIES: Record<string, Record<string, string>> = useMemo(() => ({
    headache: { fr: "J'ai des maux de tête fréquents et intenses", ar: "أعاني من صداع متكرر وشديد", en: "I have frequent and intense headaches" },
    nausea: { fr: "J'ai des nausées et vomissements", ar: "أعاني من غثيان وقيء", en: "I have nausea and vomiting" },
    fever: { fr: "J'ai de la fièvre, que dois-je faire ?", ar: "لدي حمى، ماذا أفعل؟", en: "I have a fever, what should I do?" },
    fatigue: { fr: "Je souffre de fatigue intense et persistante", ar: "أعاني من إرهاق شديد ومستمر", en: "I suffer from intense and persistent fatigue" },
    allergy: { fr: "J'ai des symptômes d'allergie (éternuements, démangeaisons)", ar: "أعاني من أعراض حساسية (عطس، حكة)", en: "I have allergy symptoms (sneezing, itching)" },
    breathing: { fr: "J'ai des difficultés à respirer", ar: "أعاني من صعوبة في التنفس", en: "I have difficulty breathing" },
    chestPain: { fr: "J'ai une douleur dans la poitrine", ar: "لدي ألم في الصدر", en: "I have chest pain" },
  }), []);

  useEffect(() => {
    if (autoSendSymptom && !autoSentRef.current && !isLoadingProviders && providers.length >= 0) {
      autoSentRef.current = true;
      const keyMatch = SYMPTOM_KEY_QUERIES[autoSendSymptom];
      if (keyMatch) {
        const query = keyMatch[language] || keyMatch.fr;
        setTimeout(() => sendMessage(query), 300);
        return;
      }
      const allChips = Object.values(SYMPTOM_CHIPS).flat();
      const match = allChips.find(c => c.label.toLowerCase() === autoSendSymptom.toLowerCase());
      const query = match?.query || autoSendSymptom;
      setTimeout(() => sendMessage(query), 300);
    }
  }, [autoSendSymptom, isLoadingProviders, providers]);

  const simplifiedDoctors: SimplifiedDoctor[] = useMemo(() => {
    return providers.map((p) => ({ id: p.id, name: p.name, specialty: p.specialty, city: p.city, type: p.type }));
  }, [providers]);

  const t = useMemo(() => ({
    fr: {
      greeting: "Bonjour",
      welcome: "Comment puis-je vous aider ?",
      welcomeSub: "Décrivez vos symptômes ou choisissez ci-dessous",
      noSpecialist: "Nous n'avons malheureusement pas de spécialiste en",
      noSpecialistSuffix: "inscrit sur la plateforme pour le moment.",
      recommended: "Spécialistes recommandés",
      placeholder: "Décrivez vos symptômes...",
      analyzing: "Analyse en cours...",
    },
    ar: {
      greeting: "مرحباً",
      welcome: "كيف يمكنني مساعدتك؟",
      welcomeSub: "صف أعراضك أو اختر من الأسفل",
      noSpecialist: "للأسف لا يوجد لدينا أخصائي في",
      noSpecialistSuffix: "مسجل على المنصة حالياً.",
      recommended: "الأخصائيون الموصى بهم",
      placeholder: "اكتب أعراضك...",
      analyzing: "جاري التحليل...",
    },
    en: {
      greeting: "Hello",
      welcome: "How can I help you?",
      welcomeSub: "Describe your symptoms or pick below",
      noSpecialist: "Unfortunately, we don't have a specialist in",
      noSpecialistSuffix: "registered on the platform at this time.",
      recommended: "Recommended specialists",
      placeholder: "Describe your symptoms...",
      analyzing: "Analyzing...",
    },
  })[language] || {
    greeting: "", welcome: "", welcomeSub: "", noSpecialist: "", noSpecialistSuffix: "", recommended: "", placeholder: "", analyzing: "",
  }, [language]);

  const chips = SYMPTOM_CHIPS[language as keyof typeof SYMPTOM_CHIPS] || SYMPTOM_CHIPS.fr;
  const hasConversation = messages.length > 0;

  const getTimeString = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
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

    const userMsg: TriageMessage = { role: "user", content: trimmed, timestamp: getTimeString() };
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
        const errMsg: TriageMessage = { role: "assistant", content: errContent, isError: true, timestamp: getTimeString() };
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
        timestamp: getTimeString(),
      };
      setMessages((prev) => {
        const updated = [...prev, assistantMsg];
        fetchSuggestions(updated);
        return updated;
      });
      onMessageSent?.("assistant", assistantContent);
    } catch {
      const fallback = "Erreur de connexion. Veuillez réessayer.";
      setMessages((prev) => [...prev, { role: "assistant", content: fallback, isError: true, timestamp: getTimeString() }]);
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
    <div className="h-full flex flex-col w-full">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain scrollbar-hide">
        <div className="px-4 py-4" style={{ minHeight: "100%" }}>
          {/* Welcome state — clean & minimal */}
          {!hasConversation && (
            <div className="flex flex-col items-center pt-10 sm:pt-16 animate-in fade-in duration-500">
              <p className="text-xs text-muted-foreground mb-0.5">{t.greeting}</p>
              <h2 className="text-lg font-semibold text-center mb-0.5 text-foreground">{t.welcome}</h2>
              <p className="text-[11px] text-center mb-6 text-muted-foreground">{t.welcomeSub}</p>

              {/* Clean 2-column chips */}
              <div className="grid grid-cols-2 gap-1.5 w-full max-w-sm">
                {chips.map((chip) => {
                  const IconComponent = chip.icon;
                  return (
                    <button
                      key={chip.label}
                      onClick={() => sendMessage(chip.query)}
                      className="flex items-center gap-2 h-10 px-3 rounded-lg border border-border bg-background text-left transition-colors hover:bg-muted active:scale-[0.98]"
                    >
                      <IconComponent className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                      <span className="text-[12px] text-foreground truncate">{chip.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chat messages */}
          {hasConversation && (
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn("flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 bg-muted">
                      <Bot className="w-3 h-3 text-foreground" />
                    </div>
                  )}

                  <div className={cn("max-w-[85%] sm:max-w-[70%] space-y-1.5", msg.role === "user" ? "order-1" : "")}>
                    {msg.role === "user" ? (
                      <div
                        className="px-3.5 py-2.5 text-[13px] leading-relaxed bg-primary text-primary-foreground"
                        style={{ borderRadius: "18px 18px 4px 18px" }}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    ) : (
                      <div
                        className="px-3.5 py-2.5 text-[13px] leading-relaxed bg-muted/50 border border-border"
                        style={{ borderRadius: "18px 18px 18px 4px" }}
                      >
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:mb-1.5 prose-p:last:mb-0 prose-ul:mb-1.5 prose-li:mb-0.5 prose-p:text-[13px] prose-li:text-[13px]">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    )}

                    {msg.timestamp && (
                      <p className={cn("text-[10px] px-1 text-muted-foreground", msg.role === "user" ? "text-right" : "text-left")}>
                        {msg.timestamp}
                      </p>
                    )}

                    {/* Urgency badge */}
                    {msg.role === "assistant" && msg.urgencyLevel && (
                      <div
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium w-fit",
                          msg.urgencyLevel === "high" && "bg-destructive/10 text-destructive",
                          msg.urgencyLevel === "medium" && "bg-amber-500/10 text-amber-700 dark:text-amber-400",
                          msg.urgencyLevel === "low" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        )}
                      >
                        {msg.urgencyLevel === "high" && <ShieldAlert className="w-2.5 h-2.5" />}
                        {msg.urgencyLevel === "medium" && <Shield className="w-2.5 h-2.5" />}
                        {msg.urgencyLevel === "low" && <ShieldCheck className="w-2.5 h-2.5" />}
                        {msg.urgencyLevel === "high" && (language === "ar" ? "عاجل" : language === "en" ? "High urgency" : "Urgence élevée")}
                        {msg.urgencyLevel === "medium" && (language === "ar" ? "متوسط" : language === "en" ? "Moderate" : "Modéré")}
                        {msg.urgencyLevel === "low" && (language === "ar" ? "منخفض" : language === "en" ? "Low urgency" : "Faible")}
                      </div>
                    )}

                    {/* Doctor cards */}
                    {msg.role === "assistant" && msg.doctorIds && msg.doctorIds.length > 0 && (
                      <div className="flex flex-col gap-2 mt-1.5">
                        <p className="text-[10px] font-medium tracking-wide uppercase px-0.5 text-muted-foreground">{t.recommended}</p>
                        {msg.doctorIds.map((id, idx) => {
                          const doc = getDoctorById(id);
                          if (!doc) return null;
                          return (
                            <div key={id} className="animate-in fade-in slide-in-from-bottom-1 duration-300" style={{ animationDelay: `${idx * 80}ms` }}>
                              <DoctorProfileCard id={doc.id} name={doc.name} specialty={doc.specialty} city={doc.city} language={language} image={doc.image} />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* No specialist */}
                    {msg.role === "assistant" && msg.doctorIds && msg.doctorIds.length === 0 && msg.recommendedSpecialty && (
                      <div className="rounded-lg p-2.5 text-[11px] border border-dashed border-border bg-muted/30 text-muted-foreground">
                        {t.noSpecialist} <strong className="text-foreground">{msg.recommendedSpecialty}</strong> {t.noSpecialistSuffix}
                      </div>
                    )}

                    {/* Suggestion chips — neutral */}
                    {msg.role === "assistant" && i === lastAssistantIndex && !msg.isError && suggestionsForIndex === i && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {suggestionsLoading ? (
                          <>
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <Skeleton className="h-6 w-28 rounded-full" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                          </>
                        ) : (
                          suggestions.map((q, idx) => (
                            <button
                              key={q}
                              onClick={() => handleSuggestionClick(q)}
                              className="px-2.5 py-1 text-[11px] rounded-full border border-border bg-background text-foreground hover:bg-muted transition-colors active:scale-95 animate-in fade-in duration-300"
                              style={{ animationDelay: `${idx * 80}ms` }}
                            >
                              {q}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator — minimal */}
              {isLoading && (
                <div className="flex items-center gap-2 animate-in fade-in duration-300">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-muted">
                    <Bot className="w-3 h-3 text-foreground" />
                  </div>
                  <div className="px-3.5 py-2.5 bg-muted/50 border border-border" style={{ borderRadius: "18px 18px 18px 4px" }}>
                    <div className="flex items-center gap-1">
                      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-muted-foreground/40" style={{ animationDelay: "0ms" }} />
                      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-muted-foreground/40" style={{ animationDelay: "150ms" }} />
                      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-muted-foreground/40" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{t.analyzing}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input bar — clean */}
      <div className="shrink-0 px-3 py-2 pb-[calc(3rem+env(safe-area-inset-bottom,0px))] border-t border-border bg-background">
        <div className={cn(
          "flex items-center gap-2 min-h-[44px] px-3 rounded-xl border border-border bg-muted/30 transition-colors",
          input && "border-primary/40 bg-background"
        )}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={t.placeholder}
            rows={1}
            className="flex-1 resize-none text-sm bg-transparent py-2.5 placeholder:text-muted-foreground/50 focus:outline-none max-h-[72px] leading-normal text-foreground"
            disabled={isLoading || isLoadingProviders}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading || isLoadingProviders}
            className={cn(
              "shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90",
              input.trim()
                ? "bg-primary text-primary-foreground"
                : "bg-transparent text-muted-foreground/30"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
