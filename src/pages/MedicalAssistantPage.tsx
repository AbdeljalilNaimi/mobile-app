import { useMemo, useState, useCallback } from "react";
import { Bot, AlertTriangle, Phone, PenSquare, History, ChevronRight, Clock, Trash2, LogIn, X } from "lucide-react";
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
  const [showGuestBanner, setShowGuestBanner] = useState(true);
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
        online: "En ligne",
        disclaimer: "Cet assistant ne remplace pas un avis médical professionnel",
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
        guestBanner: "Connectez-vous pour sauvegarder",
        login: "Se connecter →",
      },
      ar: {
        title: "المساعد الطبي",
        online: "متصل",
        disclaimer: "هذا المساعد لا يحل محل الاستشارة الطبية المهنية",
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
        login: "تسجيل الدخول →",
      },
      en: {
        title: "Medical Assistant",
        online: "Online",
        disclaimer: "This assistant does not replace professional medical advice",
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
        login: "Sign in →",
      },
    };
    return translations[language as keyof typeof translations] || translations.fr;
  }, [language]);

  return (
    <div className={cn(
      "flex flex-col overflow-hidden h-[100dvh] bg-muted",
      language === "ar" && "rtl"
    )}>
      {/* Header — 56px */}
      <header className="shrink-0 h-14 bg-card border-b border-border">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div className="leading-tight">
              <h1 className="font-bold text-[15px] text-foreground">{t.title}</h1>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[12px] text-muted-foreground">{t.online}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {isAuthed && (
              <button
                onClick={handleOpenHistory}
                className="h-9 w-9 flex items-center justify-center rounded-lg transition-colors hover:bg-muted active:scale-95"
              >
                <History className="w-[18px] h-[18px] text-muted-foreground" />
              </button>
            )}

            <button
              onClick={() => setShowResetDialog(true)}
              className="h-9 w-9 flex items-center justify-center rounded-lg transition-colors hover:bg-muted active:scale-95"
            >
              <PenSquare className="w-[18px] h-[18px] text-muted-foreground" />
            </button>

            <button
              onClick={() => window.location.href = "tel:15"}
              className="flex items-center gap-1 h-7 px-2.5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold transition-all active:scale-95"
            >
              <span>🚨</span>
              <span>15</span>
            </button>
          </div>
        </div>
      </header>

      {/* Disclaimer — 32px */}
      <div className="shrink-0 h-8 flex items-center justify-center px-4 bg-muted">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3 shrink-0 text-muted-foreground" />
          <span className="text-[11px] italic text-muted-foreground">{t.disclaimer}</span>
        </div>
      </div>

      {/* Chat area */}
      <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-hidden bg-card mx-0">
          <SymptomTriageBot
            resetKey={resetKey}
            onMessageSent={handleMessageSent}
            initialMessages={initialMessages}
          />
        </div>

        {/* Guest sign-in banner */}
        {!isAuthed && showGuestBanner && (
          <div className="shrink-0 mx-4 mb-2 mt-1 rounded-[10px] px-3.5 py-2.5 flex items-center justify-between bg-primary/10">
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <span>💾</span>
              <span>{t.guestBanner}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/citizen/login" className="text-[13px] font-bold text-primary hover:underline">
                {t.login}
              </Link>
              <button onClick={() => setShowGuestBanner(false)} className="p-0.5 rounded hover:bg-muted">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
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
            <DrawerTitle className="text-[15px] font-bold">{t.historyTitle}</DrawerTitle>
            <DrawerClose asChild>
              <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
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
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-muted">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">{t.emptyHistory}</p>
                <p className="text-xs mt-0.5 text-muted-foreground">{t.emptyHistorySub}</p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted active:bg-muted/80 transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary/10">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate text-foreground">
                        {(conv.title || "…").slice(0, 35)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatRelativeDate(conv.updated_at)}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground/50" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {conversations.length > 0 && (
            <div className="px-4 py-2.5 border-t border-border">
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-1.5 text-xs mx-auto active:scale-95 transition-all text-destructive"
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