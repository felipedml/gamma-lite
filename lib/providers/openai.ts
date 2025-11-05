// lib/providers/openai.ts
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Único modelo de conteúdo: gpt-4.1-mini
export const CONTENT_MODEL = "gpt-4.1-mini" as const;

export async function generateSlidesWithOpenAI(prompt: string) {
  const res = await openai.chat.completions.create({
    model: CONTENT_MODEL,
    messages: [
      {
        role: "system",
        content:
          "Você é um gerador de apresentações enxutas, com títulos curtos, bullets claros e exemplos concretos.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.6,
  });

  return res.choices?.[0]?.message?.content ?? "";
}
