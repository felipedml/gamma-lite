// lib/images.ts
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// Modelo de imagens
const IMAGE_MODEL = "gpt-image-1";

type Options = { maxImages?: number };

// Procura pelos marcadores [imagem: ...] e cria imagens; substitui por ![...](url)
export async function renderImagesOnMarkdown(md: string, opts: Options = {}) {
  const max = Math.max(1, Math.min(opts.maxImages ?? 8, 20));
  const regex = /\[imagem:\s*([^\]]+?)\s*\]/gi;

  const found: { full: string; prompt: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(md)) !== null) {
    found.push({ full: m[0], prompt: m[1] });
    if (found.length >= max) break;
  }
  if (!found.length) return md;

  // Gera imagens em paralelo (base64) e usa data URLs (evita storage pago)
  const images = await Promise.all(
    found.map(async (f) => {
      const r = await client.images.generate({
        model: IMAGE_MODEL,
        prompt: f.prompt,
        size: "1024x1024",
        // quality: "high" // opcional
      });
      const b64 = r.data?.[0]?.b64_json;
      if (!b64) return { marker: f.full, md: f.full };
      const url = `data:image/png;base64,${b64}`;
      const alt = f.prompt.slice(0, 80);
      return { marker: f.full, md: `![${alt}](${url})` };
    })
  );

  let out = md;
  for (const im of images) {
    out = out.replace(im.marker, im.md);
  }
  return out;
}
