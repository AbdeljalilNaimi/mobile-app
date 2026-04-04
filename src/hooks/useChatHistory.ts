import { useState, useCallback, useRef } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/apiClient";
import { auth } from "@/lib/firebase";

interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

export function useChatHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const savingRef = useRef(false);

  const getUserId = (): string | null => auth.currentUser?.uid ?? null;
  const isAuthenticated = (): boolean => !!auth.currentUser;

  const loadConversations = useCallback(async () => {
    const uid = getUserId();
    if (!uid) return;
    setIsLoadingHistory(true);
    try {
      const data = await apiGet<Conversation[]>("/chat/conversations/" + uid);
      setConversations(data || []);
    } catch {
      // silent
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const loadConversation = useCallback(async (id: string): Promise<ChatMsg[]> => {
    try {
      const data = await apiGet<ChatMsg[]>("/chat/conversations/" + id + "/messages");
      if (data) {
        setCurrentConversationId(id);
        return data;
      }
    } catch {
      // silent
    }
    return [];
  }, []);

  const createConversation = useCallback(async (firstMessage: string): Promise<string | null> => {
    const uid = getUserId();
    if (!uid || !isAuthenticated()) return null;
    try {
      const conv = await apiPost<Conversation>("/chat/conversations", {
        user_id: uid,
        title: firstMessage.slice(0, 60),
      });
      setCurrentConversationId(conv.id);
      await loadConversations();
      return conv.id;
    } catch {
      return null;
    }
  }, [loadConversations]);

  const saveMessages = useCallback(async (
    conversationId: string,
    messages: ChatMsg[]
  ) => {
    if (savingRef.current) return;
    savingRef.current = true;
    try {
      await apiPost("/chat/conversations/" + conversationId + "/messages", { messages });
    } catch {
      // silent
    } finally {
      savingRef.current = false;
    }
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    try {
      await apiDelete("/chat/conversations/" + id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (currentConversationId === id) setCurrentConversationId(null);
    } catch {
      // silent
    }
  }, [currentConversationId]);

  const updateConversationTitle = useCallback(async (id: string, title: string) => {
    try {
      await apiPatch("/chat/conversations/" + id, { title });
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title } : c))
      );
    } catch {
      // silent
    }
  }, []);

  return {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    isLoadingHistory,
    loadConversations,
    loadConversation,
    createConversation,
    saveMessages,
    deleteConversation,
    updateConversationTitle,
    isAuthenticated,
  };
}
