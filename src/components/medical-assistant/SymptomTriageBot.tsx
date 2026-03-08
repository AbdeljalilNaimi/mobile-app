import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Send, Loader2, Bot, User, ShieldAlert, ShieldCheck, Shield, Thermometer, Heart, Brain, AlertCircle, Wind, Pill, Eye, Smile, Baby, Droplets, MapPin, FileText, Mic } from "lucide-react";
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
      greeting: "Bonjour 👋",
      welcome: "Comment puis-je vous aider ?",
      welcomeSub: "Décrivez vos symptômes ou choisissez ci-dessous",
      noSpecialist: "Nous n'avons malheureusement pas de spécialiste en",
      noSpecialistSuffix: "inscrit sur la plateforme pour le moment.",
      recommended: "Spécialistes recommandés",
      placeholder: "Écrivez vos symptômes...",
      analyzing: "Analyse en cours...",
    },
    ar: {
      greeting: "مرحباً 👋",
      welcome: "كيف يمكنني مساعدتك؟",
      welcomeSub: "صف أعراضك أو اختر من الأسفل",
      noSpecialist: "للأسف لا يوجد لدينا أخصائي في",
      noSpecialistSuffix: "مسجل على المنصة حالياً.",
      recommended: "الأخصائيون الموصى بهم",
      placeholder: "اكتب أعراضك...",
      analyzing: "جاري التحليل...",
    },
    en: {
      greeting: "Hello 👋",
      welcome: "How can I help you?",
      welcomeSub: "Describe your symptoms or pick below",
      noSpecialist: "Unfortunately, we don't have a specialist in",
      noSpecialistSuffix: "registered on the platform at this time.",
      recommended: "Recommended specialists",
      placeholder: "Write your symptoms...",
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

  const handleChipClick = (query: string) => {
    sendMessage(query);
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
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
        <div className="px-4 py-4" style={{ minHeight: "100%" }}>
          {/* Welcome state */}
          {!hasConversation && (
            <div className="flex flex-col items-center pt-8 sm:pt-16 animate-in fade-in duration-500">
              <p className="text-sm mb-1" style={{ color: "#9CA3AF" }}>{t.greeting}</p>
              <h2 className="text-[22px] font-bold text-center mb-1 text-foreground">{t.welcome}</h2>
              <p className="text-[13px] text-center mb-6" style={{ color: "#9CA3AF" }}>{t.welcomeSub}</p>

              {/* 2-column pill chip layout */}
              <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                {chips.map((chip) => {
                  const IconComponent = chip.icon;
                  return (
                    <button
                      key={chip.label}
                      onClick={() => handleChipClick(chip.query)}
                      className="flex items-center gap-2.5 h-11 px-3 rounded-[10px] bg-white text-left transition-all duration-150 active:scale-[0.98] hover:shadow-sm"
                      style={{ border: "1px solid #E5E7EB" }}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: "#EFF6FF" }}
                      >
                        <IconComponent className="w-3.5 h-3.5" style={{ color: "#1D4ED8" }} />
                      </div>
                      <span className="text-[13px] font-medium text-foreground truncate">{chip.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chat messages — 12px gap */}
          {hasConversation && (
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn("flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  {/* AI avatar */}
                  {msg.role === "assistant" && (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1"
                      style={{ backgroundColor: "#1D4ED8" }}
                    >
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                  )}

                  <div className={cn("max-w-[85%] sm:max-w-[70%] space-y-1.5", msg.role === "user" ? "order-1" : "")}>
                    {/* Message bubble */}
                    <div
                      className="px-3.5 py-2.5 text-[13px] leading-relaxed"
                      style={msg.role === "user" ? {
                        backgroundColor: "#1D4ED8",
                        color: "white",
                        borderRadius: "18px 18px 4px 18px",
                      } : {
                        backgroundColor: "white",
                        border: "1px solid #E5E7EB",
                        borderRadius: "18px 18px 18px 4px",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                      }}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:mb-1.5 prose-p:last:mb-0 prose-ul:mb-1.5 prose-li:mb-0.5 prose-p:text-[13px] prose-li:text-[13px]">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>

                    {/* Timestamp */}
                    {msg.timestamp && (
                      <p className={cn("text-[12px] px-1", msg.role === "user" ? "text-right" : "text-left")} style={{ color: "#9CA3AF" }}>
                        {msg.timestamp}
                      </p>
                    )}

                    {/* Urgency badge */}
                    {msg.role === "assistant" && msg.urgencyLevel && (
                      <div
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
                      </div>
                    )}

                    {/* Doctor cards */}
                    {msg.role === "assistant" && msg.doctorIds && msg.doctorIds.length > 0 && (
                      <div className="flex flex-col gap-2 mt-1.5">
                        <p className="text-[10px] font-semibold tracking-wide uppercase px-0.5" style={{ color: "#9CA3AF" }}>{t.recommended}</p>
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
                      <div className="rounded-[10px] p-2.5 text-[11px]" style={{ border: "1px dashed #FCD34D", backgroundColor: "#FFFBEB", color: "#92400E" }}>
                        {t.noSpecialist} <strong>{msg.recommendedSpecialty}</strong> {t.noSpecialistSuffix}
                      </div>
                    )}

                    {/* Follow-up suggestion chips */}
                    {msg.role === "assistant" && i === lastAssistantIndex && !msg.isError && suggestionsForIndex === i && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {suggestionsLoading ? (
                          <>
                            <Skeleton className="h-7 w-24 rounded-full" />
                            <Skeleton className="h-7 w-28 rounded-full" />
                            <Skeleton className="h-7 w-20 rounded-full" />
                          </>
                        ) : (
                          suggestions.map((q, idx) => (
                            <button
                              key={q}
                              onClick={() => handleSuggestionClick(q)}
                              className="px-3 py-1.5 text-[11px] rounded-full transition-all duration-150 active:scale-95 cursor-pointer animate-in fade-in duration-500"
                              style={{
                                backgroundColor: "#EFF6FF",
                                color: "#1D4ED8",
                                border: "1px solid #BFDBFE",
                                animationDelay: `${idx * 100}ms`,
                              }}
                            >
                              {q}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* User avatar — hidden, user messages don't need one */}
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex items-center gap-2 animate-in fade-in duration-300">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#1D4ED8" }}
                  >
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div
                    className="px-4 py-3"
                    style={{
                      backgroundColor: "white",
                      border: "1px solid #E5E7EB",
                      borderRadius: "18px 18px 18px 4px",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span className="typing-dot w-2 h-2 rounded-full" style={{ backgroundColor: "#9CA3AF", animationDelay: "0ms" }} />
                      <span className="typing-dot w-2 h-2 rounded-full" style={{ backgroundColor: "#9CA3AF", animationDelay: "150ms" }} />
                      <span className="typing-dot w-2 h-2 rounded-full" style={{ backgroundColor: "#9CA3AF", animationDelay: "300ms" }} />
                    </div>
                  </div>
                  <span className="text-[11px]" style={{ color: "#9CA3AF" }}>{t.analyzing}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input bar — 52px, stuck to bottom */}
      <div className="shrink-0 px-4 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]" style={{ backgroundColor: "#F8F9FA" }}>
        <div
          className="flex items-end gap-2 h-[52px] px-3 rounded-2xl bg-white transition-shadow duration-200"
          style={{ border: "1px solid #E5E7EB", boxShadow: input ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}
        >
          {/* Microphone placeholder */}
          <button className="shrink-0 h-full flex items-center" disabled>
            <Mic className="w-5 h-5" style={{ color: "#D1D5DB" }} />
          </button>

          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={t.placeholder}
            rows={1}
            className="flex-1 resize-none text-[14px] bg-transparent py-3.5 placeholder:text-gray-400 focus:outline-none max-h-[100px] leading-normal"
            disabled={isLoading || isLoadingProviders}
          />

          {/* Send button */}
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading || isLoadingProviders}
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center mb-1.5 transition-all duration-200 active:scale-90"
            style={{
              backgroundColor: input.trim() ? "#1D4ED8" : "#E5E7EB",
              cursor: input.trim() ? "pointer" : "default",
            }}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4" style={{ color: input.trim() ? "white" : "#9CA3AF" }} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
