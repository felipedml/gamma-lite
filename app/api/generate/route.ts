// app/api/generate/route.ts
import { NextResponse } from "next/server";
import { generateSlidesWithOpenAI } from "@/lib/providers/openai";
import { researchWithPerplexity } from "@/lib/providers/perplexity";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { topic, language = "pt-BR", research = false, extraText } =
      await req.json();

    let context = "";
    if (research) {
      const r = await researchWithPerplexity(
        `Faça um sumário com fontes sobre: ${topic}`
      );
      if (r) context = `\n\n=== CONTEXTO (PPLX) ===\n${r}\n`;
    }

    const finalPrompt = [
      `Gere uma apresentação estruturada em markdown para Reveal.js.`,
      `Idioma: ${language}`,
      `Regras:`,
      `- 1 título de capa`,
      `- 7 a 12 seções curtas (##), cada uma com bullets (•) claros e objetivos`,
      `- Inclua sugestões visuais curtas entre [imagem: ...] quando fizer sentido`,
      `- Feche com 1 slide de síntese/CTA`,
      `Tema: ${topic}`,
      extraText ? `Material do usuário:\n${extraText}` : "",
      context,
    ]
      .filter(Boolean)
      .join("\n");

    const content = await generateSlidesWithOpenAI(finalPrompt);

    return NextResponse.json({ ok: true, content });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Erro desconhecido" },
      { status: 500 }
    );
  }
}
