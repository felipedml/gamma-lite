import OpenAI from "openai";

/**
 * Cliente OpenAI para texto e imagens.
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Chamada à Perplexity Sonar. Ajuste a URL se o serviço mudar.
 * Lança erro se a chave não estiver definida ou se a resposta falhar.
 */
export async function pplxChat(messages: { role: "system" | "user" | "assistant"; content: string }[]) {
  const key = process.env.PPLX_API_KEY;
  if (!key) {
    throw new Error("PPLX_API_KEY não configurada");
  }
  const resp = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify({
      model: "sonar-reasoning",
      messages,
      stream: false
    })
  });
  if (!resp.ok) {
    throw new Error("Erro da Perplexity API");
  }
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || "";
}
