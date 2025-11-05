export const runtime = 'nodejs'; // evita Edge para não estourar limite

function extractJSON(text) {
  // tenta parse direto; se falhar, tenta extrair bloco ```json ...```
  try { return JSON.parse(text); } catch {}
  const m = text.match(/```json\s*([\s\S]*?)```/i);
  if (m) { try { return JSON.parse(m[1]); } catch {} }
  return null;
}

export async function POST(req) {
  try {
    const { topic, slidesCount = 8, language = 'pt-BR', tone = 'didático', model = 'gpt-4o-mini' } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY ausente' }), { status: 500 });
    }

    const sys = [
      `Você é um escritor de apresentações.`,
      `Objetivo: produzir JSON estrito para slides de uma apresentação didática.`,
      `Formato JSON: { "title": string, "slides": [ { "title": string, "bullets": string[], "notes": string? } ] }`,
      `Regras:`,
      `- Use o idioma: ${language}`,
      `- Tom: ${tone}`,
      `- Número alvo de slides (sem contar capa): ${slidesCount}`,
      `- Não inclua texto fora do JSON.`
    ].join('\n');

    const user = [
      `Tema ou conteúdo base:`,
      `${topic}`,
      ``,
      `Instruções:`,
      `1) Defina um título curto e forte para a apresentação.`,
      `2) Gere ~${slidesCount} slides: cada um com título e 3–6 bullets claros.`,
      `3) Opcional: "notes" com lembretes do apresentador.`,
      `4) Evite parágrafos longos; priorize bullets objetivos.`
    ].join('\n');

    // Para máxima compatibilidade, chamamos a REST API via fetch.
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: user }
        ]
      })
    });

    if (!resp.ok) {
      const detail = await resp.text();
      return new Response(JSON.stringify({ error: 'OpenAI error', detail }), { status: 500 });
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content ?? '';
    const json = extractJSON(content);

    if (!json || !Array.isArray(json.slides)) {
      return new Response(JSON.stringify({ error: 'Falha ao parsear JSON gerado.' }), { status: 500 });
    }

    return new Response(JSON.stringify({ outline: json }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || 'Erro desconhecido' }), { status: 500 });
  }
}
