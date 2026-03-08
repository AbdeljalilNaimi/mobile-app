import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
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
      const { data } = await supabase
        .from("chat_conversations")
        .select("*")
        .eq("user_id", uid)
        .order("updated_at", { ascending: false })
        .limit(50);
      if (data) setConversations(data);
    } catch {
      // silent
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const loadConversation = useCallback(async (id: string): Promise<ChatMsg[]> => {
    try {
      const { data } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });
      if (data) {
        setCurrentConversationId(id);
        return data as ChatMsg[];
      }
    } catch {
      // silent
    }
    return [];
  }, []);

  const saveMessage = useCallback(async (role: "user" | "assistant", content: string) => {
    const uid = getUserId();
    if (!uid || savingRef.current) return;
    savingRef.current = true;

    try {
      let convId = currentConversationId;

      if (!convId) {
        const title = role === "user" ? content.slice(0, 40) : "Conversation";
        const { data } = await supabase
          .from("chat_conversations")
          .insert({ user_id: uid, title })
          .select("id")
          .single();
        if (data) {
          convId = data.id;
          setCurrentConversationId(convId);
        } else {
          return;
        }
      }

      await supabase.from("chat_messages").insert({
        conversation_id: convId,
        role,
        content,
      });

      await supabase
        .from("chat_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", convId);
    } catch {
      // silent — don't interrupt chat
    } finally {
      savingRef.current = false;
    }
  }, [currentConversationId]);

  const deleteAllHistory = useCallback(async () => {
    const uid = getUserId();
    if (!uid) return;
    try {
      await supabase.from("chat_conversations").delete().eq("user_id", uid);
      setConversations([]);
      setCurrentConversationId(null);
    } catch {
      // silent
    }
  }, []);

  const startNewConversation = useCallback(() => {
    setCurrentConversationId(null);
  }, []);

  return {
    conversations,
    currentConversationId,
    isLoadingHistory,
    isAuthenticated,
    loadConversations,
    loadConversation,
    saveMessage,
    deleteAllHistory,
    startNewConversation,
  };
}
