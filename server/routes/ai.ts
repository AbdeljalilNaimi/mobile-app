import { Router } from "express";

const router = Router();

const AI_API_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-2.5-flash";

async function callAI(messages: Array<{ role: string; content: string }>, model?: string): Promise<string> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const res = await fetch(AI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || DEFAULT_MODEL,
      messages,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI API error: ${err}`);
  }

  const data = (await res.json()) as any;
  return data.choices?.[0]?.message?.content || "";
}

// POST /api/ai/chat — general chat completions
router.post("/chat", async (req, res) => {
  try {
    const { messages, model, systemPrompt } = req.body;
    const allMessages = systemPrompt
      ? [{ role: "system", content: systemPrompt }, ...messages]
      : messages;
    const content = await callAI(allMessages, model);
    res.json({ content });
  } catch (err: any) {
    console.error("AI chat error:", err.message);
    res.status(500).json({ error: err.message || "AI request failed" });
  }
});

// POST /api/ai/symptom-triage — symptom analysis
router.post("/symptom-triage", async (req, res) => {
  try {
    const { symptoms, language = "fr" } = req.body;
    const systemPrompt = language === "ar"
      ? "أنت مساعد طبي متخصص في تصنيف الأعراض. قدم تحليلاً دقيقاً ومفيداً للأعراض المذكورة باللغة العربية."
      : language === "en"
      ? "You are a medical assistant specializing in symptom triage. Provide accurate and helpful analysis."
      : "Tu es un assistant médical spécialisé dans le triage des symptômes. Fournis une analyse précise et utile des symptômes mentionnés en français.";
    const content = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: symptoms },
    ]);
    res.json({ content });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "AI request failed" });
  }
});

// POST /api/ai/suggest-followups — suggest follow-up questions
router.post("/suggest-followups", async (req, res) => {
  try {
    const { conversation, language = "fr" } = req.body;
    const systemPrompt = `Generate 3 relevant follow-up questions based on the conversation in ${language}. Return as a JSON array of strings.`;
    const content = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(conversation) },
    ]);
    try {
      const questions = JSON.parse(content);
      res.json({ questions });
    } catch {
      res.json({ questions: [content] });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "AI request failed" });
  }
});

// POST /api/ai/map-bot — location/provider search assistant
router.post("/map-bot", async (req, res) => {
  try {
    const { query, language = "fr" } = req.body;
    const systemPrompt = language === "ar"
      ? "أنت مساعد للعثور على مقدمي الرعاية الصحية في الجزائر."
      : language === "en"
      ? "You are an assistant for finding healthcare providers in Algeria."
      : "Tu es un assistant pour trouver des prestataires de santé en Algérie.";
    const content = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: query },
    ]);
    res.json({ content });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "AI request failed" });
  }
});

export default router;
