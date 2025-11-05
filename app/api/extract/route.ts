// app/api/extract/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Utilitário simples para ler todo o corpo multipart/form-data
async function readFormData(req: Request) {
  const form = await req.formData();
  const files: File[] = [];
  for (const [key, value] of form.entries()) {
    if (value instanceof File) files.push(value);
  }
  return files;
}

// Extração por tipo
async function extractFromPdf(buf: Buffer) {
  const pdfParse = (await import("pdf-parse")).default; // dynamic import
  const res = await pdfParse(buf);
  return res.text || "";
}

async function extractFromDocx(buf: Buffer) {
  const mammoth = await import("mammoth"); // dynamic import
  const { value } = await mammoth.extractRawText({ buffer: buf });
  return value || "";
}

async function extractFromTxt(buf: Buffer) {
  return buf.toString("utf8");
}

export async function POST(req: Request) {
  try {
    const files = await readFormData(req);
    if (!files.length) {
      return NextResponse.json(
        { ok: false, error: "Nenhum arquivo recebido." },
        { status: 400 }
      );
    }

    const results: { name: string; text: string }[] = [];

    for (const file of files) {
      const ab = await file.arrayBuffer();
      const buf = Buffer.from(ab);
      const lower = file.name.toLowerCase();

      let text = "";
      if (lower.endsWith(".pdf")) {
        text = await extractFromPdf(buf);
      } else if (lower.endsWith(".docx")) {
        text = await extractFromDocx(buf);
      } else if (lower.endsWith(".txt") || file.type === "text/plain") {
        text = await extractFromTxt(buf);
      } else {
        // tenta por MIME se extensão não ajudar
        if (file.type === "application/pdf") text = await extractFromPdf(buf);
        else if (
          file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
          text = await extractFromDocx(buf);
        else text = await extractFromTxt(buf);
      }

      // higieniza um pouco
      text = text.replace(/\u0000/g, "").trim();
      results.push({ name: file.name, text });
    }

    // concatena tudo (UploadBox usa isso)
    const joined = results.map(r => `# ${r.name}\n\n${r.text}`).join("\n\n---\n\n");
    return NextResponse.json({ ok: true, text: joined });
  } catch (e: any) {
    console.error("extract error:", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Falha ao extrair texto." },
      { status: 500 }
    );
  }
}
