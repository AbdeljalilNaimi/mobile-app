import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEFAULTS = ["En savoir plus", "Quand consulter ?", "Trouver un médecin"];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, language } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ suggestions: DEFAULTS }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lang = language === "ar" ? "arabe" : language === "en" ? "anglais" : "français";

    const systemPrompt = `You are a medical assistant helper. Based on the conversation so far, generate exactly 3 short follow-up questions the patient might want to ask next. 
Return ONLY a JSON array of 3 strings in ${lang}. 
Maximum 8 words per question. No numbering, no explanation.
Example: ["Quels médicaments puis-je prendre ?", "Dois-je consulter un médecin ?", "Combien de temps cela dure-t-il ?"]`;

    const conversationMessages = (messages || []).slice(-6).map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationMessages,
          { role: "user", content: "Generate 3 follow-up questions now." },
        ],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ suggestions: DEFAULTS }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Try to parse JSON array from response
    try {
      const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length >= 1) {
        return new Response(JSON.stringify({ suggestions: parsed.slice(0, 3) }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch {
      console.error("Failed to parse suggestions JSON:", content);
    }

    return new Response(JSON.stringify({ suggestions: DEFAULTS }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("suggest-followups error:", e);
    return new Response(JSON.stringify({ suggestions: DEFAULTS }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
