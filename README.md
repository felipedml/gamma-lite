# Gamma-lite

Gerador de slides com **OpenAI** + **Reveal.js**.  
Sem banco, sem autenticação, sem serviços externos além da sua **OPENAI_API_KEY**.

## Como usar (Vercel)

1. Faça upload deste projeto para o seu repositório.
2. No Vercel, crie um projeto a partir do repositório.
3. Em **Settings → Environment Variables**, adicione:
   - `OPENAI_API_KEY` = sua chave da OpenAI
4. Deploy.

## Desenvolvimento local

```bash
cp .env.example .env
# edite .env com sua OPENAI_API_KEY
pnpm i   # ou npm i / yarn
pnpm dev # ou npm run dev
Abra http://localhost:3000

Observações
O endpoint /api/generate chama a API Chat Completions e exige JSON estrito.

A UI gera um .html autônomo com Reveal.js (CDN) pronto para apresentar.

markdown
Copiar código

---

# ✅ Passo a passo (rapidíssimo)

1) No repositório **gamma-lite**, clique em **Add file → Upload files** e envie os arquivos/pastas conforme acima.  
2) Faça o **Commit** na branch `main`.  
3) No **Vercel**:
   - Import this repository → **Framework: Next.js** (auto)
   - **Environment Variable**: `OPENAI_API_KEY` = *sua chave*
   - Deploy.
4) Acesse a URL do projeto. Escreva o tema, escolha o modelo e **Gerar apresentação**.  
5) Use **Baixar .html** para salvar um arquivo Reveal.js “stand-alone”.

Se quiser, depois incrementamos com:
- Temas Reveal.js alternáveis (black/white/league/…)
- Exportação **.pptx** via uma rota server-side
- Upload de texto/arquivo base
- “Templates” pedagógicos (ENEM, ABNT etc.)

Se travar em algum ponto do upload ou do deploy, me diga **o que aparece na tela** e eu corrijo na hora.
::contentReference[oaicite:0]{index=0}

<!-- touch: forçar deploy -->
