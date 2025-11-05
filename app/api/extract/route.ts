// app/api/extract/route.ts
import { NextResponse } from "next/server";
import Busboy from "busboy";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";

export const runtime = "nodejs";
export const maxDuration = 60; // segundos

function parseMultipart(req: Request): Promise<{ buffer: Buffer; filename: string }> {
  return new Promise((resolve, reject) => {
    const bb = Busboy({
      headers: Object.fromEntries(req.headers),
      limits: { files: 1, fileSize: 200 * 1024 * 1024 }, // 200MB
    });

    let fileBuffer: Buffer[] = [];
    let filename = "upload";

    bb.on("file", (_name, file, info) => {
      filename = info.filename ?? "upload";
      file.on("data", (d) => fileBuffer.push(d));
    });

    bb.on("finish", () => {
      resolve({ buffer: Buffer.concat(fileBuffer), filename });
    });

    bb.on("error", reject);

    // @ts-ignore
    req.body?.pipe(bb);
  });
}

async function extractText(buffer: Buffer, filename: string) {
  const lower = filename.toLowerCase();

  if (lower.endsWith(".txt") || lower.endsWith(".md")) {
    return buffer.toString("utf-8");
  }
  if (lower.endsWith(".docx")) {
    const r = await mammoth.extractRawText({ buffer });
    return r.value || "";
  }
  if (lower.endsWith(".pdf")) {
    const r = await pdfParse(buffer);
    return r.text || "";
  }

  // fallback simples
  return buffer.toString("utf-8");
}

export async function POST(req: Request) {
  try {
    const { buffer, filename } = await parseMultipart(req);
    const text = await extractText(buffer, filename);
    return NextResponse.json({ ok: true, text, filename });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Falha no upload" },
      { status: 400 }
    );
  }
}
