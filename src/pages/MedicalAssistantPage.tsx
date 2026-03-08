import { useMemo, useState, useCallback, useEffect } from "react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
        title: "Assistant Médical IA",
        online: "En ligne",
        disclaimer: "Ne remplace pas un avis médical. Urgence → appelez le",
        newConversation: "Nouvelle conversation",
        resetTitle: "Nouvelle conversation ?",
        resetDescription: "L'historique de cette session sera effacé.",
        cancel: "Annuler",
        confirm: "Confirmer",
        historyTitle: "Historique des conversations",
        emptyHistory: "Aucune conversation sauvegardée",
        deleteAll: "Effacer tout l'historique",
        deleteAllTitle: "Effacer l'historique ?",
        deleteAllDesc: "Toutes vos conversations seront supprimées définitivement.",
        guestBanner: "Connectez-vous pour sauvegarder vos conversations",
        login: "Se connecter",
        history: "Historique",
      },
      ar: {
        title: "المساعد الطبي الذكي",
        online: "متصل",
        disclaimer: "لا يحل محل الاستشارة الطبية. طوارئ → اتصل بـ",
        newConversation: "محادثة جديدة",
        resetTitle: "محادثة جديدة؟",
        resetDescription: "سيتم مسح سجل هذه الجلسة.",
        cancel: "إلغاء",
        confirm: "تأكيد",
        historyTitle: "سجل المحادثات",
        emptyHistory: "لا توجد محادثات محفوظة",
        deleteAll: "حذف كل السجل",
        deleteAllTitle: "حذف السجل؟",
        deleteAllDesc: "سيتم حذف جميع محادثاتك نهائياً.",
        guestBanner: "سجل الدخول لحفظ محادثاتك",
        login: "تسجيل الدخول",
        history: "السجل",
      },
      en: {
        title: "AI Medical Assistant",
        online: "Online",
        disclaimer: "Does not replace medical advice. Emergency → call",
        newConversation: "New conversation",
        resetTitle: "New conversation?",
        resetDescription: "This session's history will be cleared.",
        cancel: "Cancel",
        confirm: "Confirm",
        historyTitle: "Conversation history",
        emptyHistory: "No saved conversations",
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

            <div className="flex items-center gap-2">
              {/* History button — only if authenticated */}
              {isAuthed && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                        onClick={handleOpenHistory}
                      >
                        <History className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{t.history}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                      onClick={() => setShowResetDialog(true)}
                    >
                      <PenSquare className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{t.newConversation}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

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
          </div>

          {/* Disclaimer */}
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1.5 bg-amber-500/8 rounded-lg px-2 py-1 border border-amber-500/10">
            <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
            <span>{t.disclaimer} <strong>15</strong></span>
          </div>
        </div>
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
          <div className="shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-muted/50 border-t border-border/30 text-xs text-muted-foreground">
            <span>💾 {t.guestBanner}</span>
            <Link to="/citizen/login" className="text-primary font-medium hover:underline flex items-center gap-1">
              <LogIn className="w-3 h-3" />
              {t.login}
            </Link>
          </div>
        )}
      </main>

      {/* Reset confirmation dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t.resetTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.resetDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReset} className="bg-primary hover:bg-primary/90">
              {t.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* History drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-[75vh]">
          <DrawerHeader className="flex items-center justify-between pb-2">
            <DrawerTitle className="text-base font-bold">{t.historyTitle}</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">✕</Button>
            </DrawerClose>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-2">
            {isLoadingHistory ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Clock className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm">{t.emptyHistory}</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 transition-colors text-left group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {(conv.title || "…").slice(0, 35)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatRelativeDate(conv.updated_at)}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {conversations.length > 0 && (
            <div className="px-4 py-3 border-t border-border/30">
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 transition-colors mx-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t.deleteAll}
              </button>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      {/* Delete all confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteAllTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.deleteAllDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              {t.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
