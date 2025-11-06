// global.d.ts — declarações mínimas para módulos sem tipos

declare module "pdf-parse" {
  // assinatura simplificada: retorna { text: string }
  const pdfParse: (input: Buffer | Uint8Array) => Promise<{ text: string }>;
  export default pdfParse;
}

declare module "mammoth" {
  // assinatura simplificada: retorna { value: string }
  const mammoth: {
    extractRawText: (opts: { buffer: Buffer }) => Promise<{ value: string }>;
  };
  export default mammoth;
}
