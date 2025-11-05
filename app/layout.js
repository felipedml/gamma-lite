import './globals.css';

export const metadata = {
  title: 'Gamma-lite',
  description: 'Gerador de slides com OpenAI + Reveal.js'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
