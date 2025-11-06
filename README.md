#Gamma-lite — Pembroke Collins

Gerador de slides em Next.js + Reveal.js, com conteúdo feito por OpenAI (gpt-4.1-mini) e enriquecimento opcional por Perplexity Sonar (sonar-reasoning).
Sem banco de dados e sem autenticação. Exporta HTML stand-alone (abre offline).

##✨ Recursos

Prompt simples (“tema”) + texto/arquivos base (upload até 200 MB, parsing server-side).

Densidade (mais texto × mais imagens) e templates (statement, sidebar, image-focus, clean).

Paleta e logomarca Pembroke Collins (configuráveis).

Gera Markdown + Reveal HTML pronto para apresentar/baixar.

Providers fixos (sem escolha na UI):

Texto: OpenAI gpt-4.1-mini

Pesquisa/Contexto (toggle “Usar pesquisa”): Perplexity sonar-reasoning

Imagens (opcional): OpenAI image API (quando template pedir imagem)

##🚀 Deploy na Vercel (zero backend extra)

Importe este repositório na Vercel.

Em Settings → Environment Variables, crie:

# Obrigatórias
OPENAI_API_KEY=...           # sua chave OpenAI
PPLX_API_KEY=...             # sua chave Perplexity

# Opcionais (branding/UX)
NEXT_PUBLIC_APP_TITLE=Gamma-lite – Pembroke Collins
NEXT_PUBLIC_BRAND_PRIMARY=#6B6B6B            # cinza Pembroke
BRAND_LOGO_URL=/Pembroke Collins logo.png    # já em /public

# Limites/ajustes
MAX_UPLOAD_MB=200


Framework Preset: Next.js (auto).

Build & Output: padrão da Vercel para Next 14.

Deploy. (Se fizer ajustes, use Redeploy → Use latest commit from Git.)

Dica: o arquivo da logo já está em /public/Pembroke Collins logo.png.
Quer outra cor? mude NEXT_PUBLIC_BRAND_PRIMARY.

##🧑‍💻 Desenvolvimento local
# 1) preparar variáveis
cp .env.example .env
# edite .env com suas chaves OPENAI e PPLX

# 2) instalar e rodar
npm i                 # (ou pnpm i / yarn)
npm run dev           # http://localhost:3000

##🗂️ Estrutura relevante
app/
  page.tsx               # UI principal (tema, upload, densidade, templates, gerar)
  layout.tsx             # wrapper + Tailwind + brand
  api/
    extract/route.ts     # extrai texto dos arquivos enviados
    generate/route.ts    # gera markdown + slides
    presentation/generate/route.ts  # baixa HTML Reveal
components/
  UploadBox.tsx
  TemplatePicker.tsx
  DensityControl.tsx
lib/
  providers/
    openai.ts            # client OpenAI (gpt-4.1-mini / images)
    perplexity.ts        # client Perplexity (sonar-reasoning)
  templates.ts           # catálogo de templates (statement/sidebar/…)
  images.ts              # geração/placeholder de imagens
  revealTemplate.js      # monta HTML Reveal a partir dos slides
public/
  Pembroke Collins logo.png

🔧 Como funciona (resumo)

/api/extract: recebe os uploads, extrai texto (PDF/DOCX/TXT etc.) e devolve ao front.

/api/generate: monta o prompt com tema + texto extra + (opcional) pesquisa Perplexity, chama OpenAI (gpt-4.1-mini) e devolve markdown + schema de slides.

/api/presentation/generate: converte os slides em Reveal HTML via lib/revealTemplate.js e retorna um .html “stand-alone”.

##🧪 Uso rápido

Digite o tema (ex.: “Aula: O Cortiço (Aluísio Azevedo)”).

(Opcional) Anexe arquivos/cole notas.

Escolha template + densidade e Usar pesquisa (se quiser Perplexity).

Clique Gerar apresentação → visualize → Baixar HTML.

##🔒 Privacidade

Não há banco nem contas de usuário.

Arquivos são processados na request e descartados.

Só suas chaves de API são usadas (OpenAI e Perplexity).

##❗Troubleshooting

Build usa código antigo: faça um commit leve (ex.: edite README) e na Vercel use Redeploy → Use latest commit from Git.

404 de logo: confirme BRAND_LOGO_URL apontando para um arquivo em /public.

Upload muito grande: ajuste MAX_UPLOAD_MB ou reduza o arquivo.

Erros de provider: verifique OPENAI_API_KEY / PPLX_API_KEY em Settings → Environment Variables.

##📄 Licenças & créditos

Reveal.js (MIT) • Next.js (MIT) • Tailwind CSS (MIT)

Conteúdos gerados por OpenAI/Perplexity (use com responsabilidade)

*_Pembroke Collins – Books & Education • Gamma-lite_*

<!-- touch: forçar deploy -->
