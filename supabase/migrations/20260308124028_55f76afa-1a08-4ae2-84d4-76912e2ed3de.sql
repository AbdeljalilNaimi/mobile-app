-- Create chat_conversations table
CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_conversations
CREATE POLICY "Public read chat_conversations" ON public.chat_conversations FOR SELECT USING (true);
CREATE POLICY "Public insert chat_conversations" ON public.chat_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update chat_conversations" ON public.chat_conversations FOR UPDATE USING (true);
CREATE POLICY "Public delete chat_conversations" ON public.chat_conversations FOR DELETE USING (true);

-- RLS policies for chat_messages
CREATE POLICY "Public read chat_messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Public insert chat_messages" ON public.chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete chat_messages" ON public.chat_messages FOR DELETE USING (true);