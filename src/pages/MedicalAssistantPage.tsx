import { useMemo, useState, useCallback, useEffect } from "react";
import { Bot, AlertTriangle, PenSquare, History, ChevronRight, Clock, Trash2, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [resetKey, setResetKey] = useState(0);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showGuestBanner, setShowGuestBanner] = useState(true);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [initialMessages, setInitialMessages] = useState<{ role: "user" | "assistant"; content: string }[] | undefined>();

  const [capturedSymptom] = useState(() => searchParams.get("symptom"));

  useEffect(() => {
    if (searchParams.get("symptom")) {
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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
        online: "En ligne",
        disclaimer: "Ne remplace pas un avis médical professionnel",
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
        emergency: "Urgence",
      },
      ar: {
        title: "المساعد الطبي",
        online: "متصل",
        disclaimer: "لا يحل محل الاستشارة الطبية المهنية",
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
        emergency: "طوارئ",
      },
      en: {
        title: "Medical Assistant",
        online: "Online",
        disclaimer: "Does not replace professional medical advice",
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
        emergency: "Emergency",
      },
    };
    return translations[language as keyof typeof translations] || translations.fr;
  }, [language]);

  return (
    <div className={cn(
      "flex flex-col overflow-hidden h-[100dvh] bg-background",
      language === "ar" && "rtl"
    )}>
      {/* Clean header */}
      <header className="shrink-0 h-14 border-b border-border bg-background">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bot className="w-5 h-5 text-primary" />
            <div className="leading-tight">
              <h1 className="font-semibold text-sm text-foreground">{t.title}</h1>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] text-muted-foreground">{t.online}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            {isAuthed && (
              <button
                onClick={handleOpenHistory}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
              >
                <History className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <button
              onClick={() => setShowResetDialog(true)}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
            >
              <PenSquare className="w-4 h-4 text-muted-foreground" />
            </button>
            <a
              href="tel:15"
              className="ml-1 flex items-center gap-1 h-7 px-2.5 rounded-full text-[11px] font-semibold bg-destructive/10 text-destructive transition-colors hover:bg-destructive/15"
            >
              15
            </a>
          </div>
        </div>
      </header>

      {/* Professional disclaimer banner */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-800/40">
        <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
        </div>
        <p className="text-[11px] font-medium text-amber-700 dark:text-amber-300">{t.disclaimer}</p>
      </div>

      {/* Chat area */}
      <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-hidden">
          <SymptomTriageBot
            resetKey={resetKey}
            onMessageSent={handleMessageSent}
            initialMessages={initialMessages}
            autoSendSymptom={capturedSymptom}
          />
        </div>

        {/* Guest sign-in banner — minimal */}
        {!isAuthed && showGuestBanner && (
          <div className="shrink-0 mx-3 mb-1 rounded-lg px-3 py-2 flex items-center justify-between bg-muted/60 border border-border">
            <span className="text-[11px] text-muted-foreground">{t.guestBanner}</span>
            <div className="flex items-center gap-2">
              <Link to="/citizen/login" className="text-[11px] font-semibold text-primary hover:underline">
                {t.login} →
              </Link>
              <button onClick={() => setShowGuestBanner(false)} className="p-0.5 rounded hover:bg-muted">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
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
            <AlertDialogAction onClick={handleConfirmReset} className="rounded-xl bg-primary text-primary-foreground">
              {t.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* History drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-[70vh] rounded-t-[20px]">
          <DrawerHeader className="flex items-center justify-between pb-1 px-4">
            <DrawerTitle className="text-sm font-semibold">{t.historyTitle}</DrawerTitle>
            <DrawerClose asChild>
              <button className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </DrawerClose>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-3 pb-2">
            {isLoadingHistory ? (
              <div className="space-y-2 px-1">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 rounded-lg" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Clock className="w-5 h-5 text-muted-foreground mb-2" />
                <p className="text-xs font-medium text-muted-foreground">{t.emptyHistory}</p>
                <p className="text-[10px] mt-0.5 text-muted-foreground">{t.emptyHistorySub}</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate text-foreground">
                        {(conv.title || "…").slice(0, 35)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatRelativeDate(conv.updated_at)}
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground/40" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {conversations.length > 0 && (
            <div className="px-4 py-2 border-t border-border">
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-1 text-[11px] mx-auto text-destructive hover:underline"
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
            <AlertDialogAction onClick={handleDeleteAll} className="rounded-xl bg-destructive text-destructive-foreground">
              {t.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
