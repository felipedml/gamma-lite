// lib/providers/perplexity.ts
const PPLX_URL = "https://api.perplexity.ai/chat/completions";

export const PPLX_MODEL = "sonar-reasoning" as const;

export async function researchWithPerplexity(query: string) {
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) return null; // opcional

  const body = {
    model: PPLX_MODEL,
    messages: [
      {
        role: "system",
        content:
          "Você é um pesquisador. Traga fatos verificáveis e curtos, com fontes em markdown.",
      },
      { role: "user", content: query },
    ],
    temperature: 0.2,
  };

  const r = await fetch(PPLX_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!r.ok) return null;
  const json = await r.json();
  return json?.choices?.[0]?.message?.content ?? null;
}
