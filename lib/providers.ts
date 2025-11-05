// lib/providers.ts
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function pplxChat(messages: {role:"user"|"system"|"assistant"; content:string}[]) {
  const res = await fetch("https://api.perplexity.ai/chat/completions",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":`Bearer ${process.env.PPLX_API_KEY!}`
    },
    body: JSON.stringify({
      model: "sonar-reasoning",
      messages,
      stream: false
    })
  });
  if(!res.ok) throw new Error("Perplexity API error");
  const json = await res.json();
  // compatível com OpenAI-style:
  return json.choices?.[0]?.message?.content as string;
}
