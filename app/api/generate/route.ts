// app/api/generate/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

type Body = {
  topic: string;
  language?: string;
  research?: boolean;
  extraText?: string;
  template?: "statement" | "sidebar" | "imageFocus" | "clean";
  density?: "low" | "medium" | "high";
};

async function researchWithPerplexity(query: string): Promise<string> {
  const key = process.env.PPLX_API_KEY || process.env.PERPLEXITY_API_KEY;
  if (!key) return "";
  try {
    const r = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "sonar-reasoning",
        messages: [
          { role: "system", content: "Seja conciso. Liste fatos verificáveis com fontes." },
          { role: "user", content: query }
        ],
        temperature: 0.2,
      }),
    });
    const j = await r.json();
    const txt =
      j?.choices?.[0]?.message?.content?.trim?.() ||
      j?.choices?.[0]?.text?.trim?.() ||
      "";
    return txt;
  } catch {
    return "";
  }
}

export async function POST(req: Request) {
  try {
    const body: Body = await req.json();

    const topic = (body.topic || "").trim();
    if (!topic) {
      return NextResponse.json({ ok: false, error: "Informe o tema." }, { status: 400 });
    }

    const language = body.language || "pt-BR";
    const useResearch = !!body.research;
    const extra = (body.extraText || "").trim();
    const template = body.template || "clean";
    const density = body.density || "medium";

    const oiKey = process.env.OPENAI_API_KEY;
    if (!oiKey) {
      return NextResponse.json({ ok: false, error: "OPENAI_API_KEY ausente nas variáveis de ambiente." }, { status: 500 });
    }

    // Pesquisa opcional (Perplexity)
    let researchNotes = "";
    if (useResearch) {
      const r = await researchWithPerplexity(
        `Pesquise rapidamente sobre: ${topic}. Resuma em tópicos com 3-8 bullets e inclua fontes no final.`
      );
      if (r) {
        researchNotes = `\n\n### Notas de pesquisa (resumo com fontes)\n${r}\n`;
      }
    }

    const openai = new OpenAI({ apiKey: oiKey });

    const sys = [
      `Você é um gerador de apresentações em Markdown (para Reveal.js).`,
      `Idioma final: ${language}.`,
      `Escreva slides claros, objetivos e bem estruturados.`,
      `Use marcadores quando fizer sentido.`,
      `Quando pertinente a ilustrações, insira marcadores no formato [imagem: prompt descritivo].`,
      `Evite textos muito longos por slide.`,
      `Densidade de conteúdo: ${density}.`,
      `Template sugerido: ${template}.`
    ].join(" ");

    const usr = [
      `TEMA PRINCIPAL: ${topic}`,
      extra ? `\n\nTEXTO/NOTAS COMPLEMENTARES:\n${extra}` : "",
      researchNotes
    ].join("");

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: sys },
        {
          role: "user",
          content:
            usr +
            `\n\nFORMATO DE SAÍDA:\n` +
            `- Título inicial (#)\n` +
            `- Seções com '##' e bullets;\n` +
            `- Onde couber, inclua [imagem: descrição] para posterior geração de imagem;` +
            `- No fim, uma seção "Próximos passos".`
        }
      ]
    });

    const content =
      completion?.choices?.[0]?.message?.content?.trim?.() ||
      completion?.choices?.[0]?.message?.text?.trim?.() ||
      "";

    if (!content) {
      return NextResponse.json({ ok: false, error: "Falha ao gerar conteúdo." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, content });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || String(e) },
      { status: 500 }
    );
  }
}
