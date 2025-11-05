import { NextRequest, NextResponse } from "next/server";
import Busboy from "busboy";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Processa o corpo multipart/form-data e retorna buffer e nome.
 */
function parseMultipart(req: NextRequest): Promise<{ buffer: Buffer; filename: string }> {
  return new Promise((resolve, reject) => {
    const bb = Busboy({
      headers: Object.fromEntries(req.headers),
      limits: { files: 1, fileSize: 200 * 1024 * 1024 }, // até 200 MB
    });
    let fileBuffer: Buffer[] = [];
    let filename = "upload";
    bb.on("file", (_name, file, info) => {
      filename = info.filename || "upload";
      file.on("data", (d) => fileBuffer.push(d));
    });
    bb.on("finish", () => {
      resolve({ buffer: Buffer.concat(fileBuffer), filename });
    });
    bb.on("error", reject);
    // @ts-ignore
    req.body.pipe(bb);
  });
}

async function extractText(buffer: Buffer, filename: string) {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".txt") || lower.endsWith(".md")) {
    return buffer.toString("utf-8");
  }
  if (lower.endsWith(".docx")) {
    const res = await mammoth.extractRawText({ buffer });
    return res.value || "";
  }
  if (lower.endsWith(".pdf")) {
    const res = await pdfParse(buffer);
    return res.text || "";
  }
  return buffer.toString("utf-8");
}

export async function POST(req: NextRequest) {
  try {
    const { buffer, filename } = await parseMultipart(req);
    const text = await extractText(buffer, filename);
    return NextResponse.json({ ok: true, text, filename });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Falha no upload" },
      { status: 400 }
    );
  }
}
