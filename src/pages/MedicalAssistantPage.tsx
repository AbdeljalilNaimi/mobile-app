import { useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Bot, AlertTriangle, Phone, Sparkles, PenSquare, History, ChevronRight, Clock, Trash2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { SymptomTriageBot } from "@/components/medical-assistant/SymptomTriageBot";
import { useChatHistory } from "@/hooks/useChatHistory";

export default function MedicalAssistantPage() {
  const { language } = useLanguage();
  const [resetKey, setResetKey] = useState(0);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [initialMessages, setInitialMessages] = useState<{ role: "user" | "assistant"; content: string }[] | undefined>();

  const {
    conversations,
    isLoadingHistory,
    isAuthenticated,
    loadConversations,
    loadConversation,
    saveMessage,
    deleteAllHistory,
    startNewConversation,
  } = useChatHistory();

  const isAuthed = isAuthenticated();

  const handleConfirmReset = useCallback(() => {
    setResetKey((k) => k + 1);
    setShowResetDialog(false);
    startNewConversation();
    setInitialMessages(undefined);
  }, [startNewConversation]);

  const handleOpenHistory = useCallback(() => {
    loadConversations();
    setDrawerOpen(true);
  }, [loadConversations]);

  const handleSelectConversation = useCallback(async (id: string) => {
    const msgs = await loadConversation(id);
    if (msgs.length > 0) {
      setInitialMessages(msgs);
      setResetKey((k) => k + 1);
    }
    setDrawerOpen(false);
  }, [loadConversation]);

  const handleDeleteAll = useCallback(async () => {
    await deleteAllHistory();
    setShowDeleteDialog(false);
  }, [deleteAllHistory]);

  const handleMessageSent = useCallback((role: "user" | "assistant", content: string) => {
    if (isAuthed) {
      saveMessage(role, content);
    }
  }, [isAuthed, saveMessage]);

  const formatRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return language === "ar" ? "اليوم" : language === "en" ? "Today" : "Aujourd'hui";
    if (diffDays === 1) return language === "ar" ? "أمس" : language === "en" ? "Yesterday" : "Hier";
    if (language === "ar") return `منذ ${diffDays} أيام`;
    if (language === "en") return `${diffDays} days ago`;
    return `Il y a ${diffDays} jours`;
  };

  const t = useMemo(() => {
    const translations = {
      fr: {
        title: "Assistant Médical",
        subtitle: "IA",
        online: "En ligne",
        disclaimer: "Ne remplace pas un avis médical",
        emergency: "Urgence →",
        newConversation: "Nouvelle conversation",
        resetTitle: "Nouvelle conversation ?",
        resetDescription: "L'historique de cette session sera effacé.",
        cancel: "Annuler",
        confirm: "Confirmer",
        historyTitle: "Historique",
        emptyHistory: "Aucune conversation sauvegardée",
        emptyHistorySub: "Vos futures conversations apparaîtront ici",
        deleteAll: "Effacer tout l'historique",
        deleteAllTitle: "Effacer l'historique ?",
        deleteAllDesc: "Toutes vos conversations seront supprimées définitivement.",
        guestBanner: "Connectez-vous pour sauvegarder vos conversations",
        login: "Se connecter",
        history: "Historique",
      },
      ar: {
        title: "المساعد الطبي",
        subtitle: "ذكي",
        online: "متصل",
        disclaimer: "لا يحل محل الاستشارة الطبية",
        emergency: "طوارئ →",
        newConversation: "محادثة جديدة",
        resetTitle: "محادثة جديدة؟",
        resetDescription: "سيتم مسح سجل هذه الجلسة.",
        cancel: "إلغاء",
        confirm: "تأكيد",
        historyTitle: "السجل",
        emptyHistory: "لا توجد محادثات محفوظة",
        emptyHistorySub: "ستظهر محادثاتك المستقبلية هنا",
        deleteAll: "حذف كل السجل",
        deleteAllTitle: "حذف السجل؟",
        deleteAllDesc: "سيتم حذف جميع محادثاتك نهائياً.",
        guestBanner: "سجل الدخول لحفظ محادثاتك",
        login: "تسجيل الدخول",
        history: "السجل",
      },
      en: {
        title: "Medical Assistant",
        subtitle: "AI",
        online: "Online",
        disclaimer: "Does not replace medical advice",
        emergency: "Emergency →",
        newConversation: "New conversation",
        resetTitle: "New conversation?",
        resetDescription: "This session's history will be cleared.",
        cancel: "Cancel",
        confirm: "Confirm",
        historyTitle: "History",
        emptyHistory: "No saved conversations",
        emptyHistorySub: "Your future conversations will appear here",
        deleteAll: "Clear all history",
        deleteAllTitle: "Clear history?",
        deleteAllDesc: "All your conversations will be permanently deleted.",
        guestBanner: "Sign in to save your conversations",
        login: "Sign in",
        history: "History",
      },
    };
    return translations[language as keyof typeof translations] || translations.fr;
  }, [language]);

  return (
    <div className={cn(
      "flex flex-col bg-background",
      "h-[calc(100dvh-4rem-env(safe-area-inset-bottom,8px))]",
      language === "ar" && "rtl"
    )}>
      {/* Compact Header — optimized for mobile */}
      <motion.header
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="shrink-0 bg-background/95 backdrop-blur-xl z-10"
      >
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-sm">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border-[1.5px] border-background" />
              </div>
              <div className="leading-tight">
                <h1 className="font-bold text-[13px] flex items-center gap-1">
                  {t.title}
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-teal-500/10 to-cyan-500/10 text-teal-600 dark:text-teal-400">
                    {t.subtitle}
                  </span>
                </h1>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{t.online}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {isAuthed && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-[10px] text-muted-foreground hover:text-foreground active:scale-95 transition-all"
                  onClick={handleOpenHistory}
                >
                  <History className="w-[18px] h-[18px]" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-[10px] text-muted-foreground hover:text-foreground active:scale-95 transition-all"
                onClick={() => setShowResetDialog(true)}
              >
                <PenSquare className="w-[18px] h-[18px]" />
              </Button>

              <Button
                variant="destructive"
                size="sm"
                className="gap-1 rounded-[10px] shadow-sm h-8 text-xs px-2.5 active:scale-95 transition-all"
                onClick={() => window.location.href = "tel:15"}
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="font-bold">15</span>
              </Button>
            </div>
          </div>

          {/* Minimal disclaimer bar */}
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70 mt-1 px-0.5">
            <AlertTriangle className="w-2.5 h-2.5 text-amber-500/70 shrink-0" />
            <span>{t.disclaimer} · <button onClick={() => window.location.href = "tel:15"} className="text-destructive font-semibold">{t.emergency} 15</button></span>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      </motion.header>

      {/* Chat */}
      <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-hidden">
          <SymptomTriageBot
            resetKey={resetKey}
            onMessageSent={handleMessageSent}
            initialMessages={initialMessages}
          />
        </div>

        {/* Guest banner */}
        {!isAuthed && (
          <div className="shrink-0 flex items-center justify-center gap-2 px-4 py-1.5 bg-muted/30 border-t border-border/20 text-[11px] text-muted-foreground">
            <span>💾 {t.guestBanner}</span>
            <Link to="/citizen/login" className="text-primary font-semibold hover:underline flex items-center gap-0.5">
              <LogIn className="w-3 h-3" />
              {t.login}
            </Link>
          </div>
        )}
      </main>

      {/* Reset confirmation dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">{t.resetTitle}</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">{t.resetDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReset} className="bg-primary hover:bg-primary/90 rounded-xl">
              {t.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* History drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-[70vh] rounded-t-[20px]">
          <DrawerHeader className="flex items-center justify-between pb-1 px-4">
            <DrawerTitle className="text-[15px] font-bold">{t.historyTitle}</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground">✕</Button>
            </DrawerClose>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-3 pb-2">
            {isLoadingHistory ? (
              <div className="space-y-2 px-1">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[52px] rounded-xl" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5 opacity-40" />
                </div>
                <p className="text-sm font-medium">{t.emptyHistory}</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">{t.emptyHistorySub}</p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 active:bg-muted/70 transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-[10px] bg-muted/60 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-muted-foreground/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate">
                        {(conv.title || "…").slice(0, 35)}
                      </p>
                      <p className="text-[11px] text-muted-foreground/60">
                        {formatRelativeDate(conv.updated_at)}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {conversations.length > 0 && (
            <div className="px-4 py-2.5 border-t border-border/20">
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-1.5 text-xs text-destructive/80 hover:text-destructive transition-colors mx-auto active:scale-95"
              >
                <Trash2 className="w-3 h-3" />
                {t.deleteAll}
              </button>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      {/* Delete all confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">{t.deleteAllTitle}</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">{t.deleteAllDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl">
              {t.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
