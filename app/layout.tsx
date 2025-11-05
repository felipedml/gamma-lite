// app/layout.tsx
import "./globals.css";
import Image from "next/image";

export const metadata = {
  title: "Gamma-lite — Pembroke Collins",
  description: "Gerador de slides com IA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh antialiased">
        <header className="sticky top-0 z-50 bg-[var(--pc-surface)]/90 backdrop-blur border-b border-black/5">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
            <Image
              src="/pembroke-collins-logo.png"
              alt="Pembroke Collins"
              width={140}
              height={40}
              priority
            />
            <div className="ml-auto text-sm text-black/50">
              Gamma-lite
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
