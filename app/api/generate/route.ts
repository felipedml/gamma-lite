// app/api/generate/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

// ---------- Tipos ----------
type Body = {
  topic: string;
  language?: string;
  research?: boolean;
  extraText?: string;
  template?: "statement" | "sidebar" | "imageFocus" | "clean";
  density?: "low" | "medium" | "high";
};

// ---------- OpenAI ----------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// ---------- Perplexity (opcional) ----------
async function researchWithPerplexity(query: string): Promise<string> {
  const key = process.env.PPLX_API_KEY || process.env.PERPLEXITY_API_KEY;
  if (!key) return "";

  try {
    const r = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "sonar-reasoning-pro",
        messages: [
          {
            role: "system",
            content:
              "Responda em markdown conciso, com bullets quando fizer sentido. Foque em fatos verificáveis.",
          },
          { role: "user", content: query },
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    });

    if (!r.ok) return "";
    const json = await r.json();
    // Em Perplexity, normalmente vem como string em message.content
    const msg = json?.choices?.[0]?.message;
    if (!msg) return "";

    if (typeof msg.content === "string") return msg.content.trim();

    if (Array.isArray(msg.content)) {
      const textPart = msg.content.find((p: any) => p?.type === "text");
      return (textPart?.text || "").trim();
    }

    return "";
  } catch {
    return "";
  }
}

// ---------- Util: extrair texto de ChatCompletion ----------
function getMessageText(choice: any): string {
  const msg = choice?.message;
  if (!msg) return "";

  // SDK v4: normalmente `content` é string
  if (typeof msg.content === "string") {
    return (msg.content as string).trim();
  }

  // fallback caso seja “content parts”
  if (Array.isArray(msg.content)) {
    const textPart = (msg.content as any[]).find((p) => p?.type === "text");
    if (textPart?.text) return String(textPart.text).trim();
  }

  // compat (alguns exemplos antigos usavam message.text — não existe no tipo)
  if ((msg as any).text) {
    return String((msg as any).text).trim();
  }

  return "";
}

// ---------- Handler ----------
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const topic = (body.topic || "").trim();
    if (!topic) {
      return NextResponse.json(
        { error: "Informe o campo 'topic'." },
        { status: 400 }
      );
    }

    const language = body.language || "pt-BR";
    const density = body.density || "medium";
    const template = body.template || "clean";
    const extraText = body.extraText?.trim() || "";

    // Pesquisa opcional
    let research = "";
    if (body.research) {
      research = await researchWithPerplexity(
        `Faça um breve levantamento factual sobre: ${topic}.`
      );
    }

    // Prompt
    const system =
      "Você é um gerador de conteúdo para slides (markdown). Seja direto, separe tópicos em bullets, sem rodeios, sem introduções desnecessárias.";
    const user = [
      `Tema: ${topic}`,
      `Idioma: ${language}`,
      `Densidade: ${density} (low/medium/high)`,
      `Template sugerido: ${template}`,
      extraText ? `Observações: ${extraText}` : "",
      research ? `Pesquisa (referência):\n${research}` : "",
      "",
      "Produza Markdown bem formatado. Use títulos e listas curtas (5–8 itens).",
    ]
      .filter(Boolean)
      .join("\n");

    // Chamada OpenAI (Chat Completions)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const content =
      getMessageText(completion.choices?.[0]) ||
      ""; // <-- sem `.message.text`, somente via helper

    if (!content) {
      return NextResponse.json(
        { error: "Não houve conteúdo retornado pelo modelo." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        markdown: content,
        meta: { template, density, language, usedResearch: !!research },
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Erro inesperado" },
      { status: 500 }
    );
  }
}
