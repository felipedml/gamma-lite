// global.d.ts — declarações mínimas para módulos sem tipos

// pdf-parse: import default, retorna { text }
declare module "pdf-parse" {
  const pdfParse: (input: Buffer | Uint8Array) => Promise<{ text: string }>;
  export default pdfParse;
}

// mammoth: export NOMEADO extractRawText (sem default)
declare module "mammoth" {
  export function extractRawText(opts: { buffer: Buffer }): Promise<{ value: string }>;
}
