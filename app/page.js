'use client';

import { useRef, useState } from 'react';
import { buildRevealHTML } from '@/lib/revealTemplate';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [slidesCount, setSlidesCount] = useState(8);
  const [language, setLanguage] = useState('pt-BR');
  const [tone, setTone] = useState('didático');
  const [model, setModel] = useState('gpt-4o-mini');
  const [loading, setLoading] = useState(false);
  const [outline, setOutline] = useState(null);
  const [html, setHtml] = useState('');
  const iframeRef = useRef(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return alert('Descreva o tema/assunto.');
    setLoading(true);
    setOutline(null);
    setHtml('');

    try {
      const resp = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, slidesCount: Number(slidesCount), language, tone, model })
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || 'Falha na geração');

      setOutline(data.outline);
      const htmlStr = buildRevealHTML({
        title: data.outline.title || 'Apresentação',
        slides: data.outline.slides,
        theme: 'black'
      });
      setHtml(htmlStr);
      // Preview no iframe
      if (iframeRef.current) iframeRef.current.srcdoc = htmlStr;
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!html) return;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safe = (outline?.title || 'apresentacao').toLowerCase().replace(/[^\w]+/g,'-');
    a.href = url;
    a.download = `${safe}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="container">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
        <div>
          <div className="headerTitle">Gamma-lite</div>
          <div className="sub">Gerador de slides (OpenAI + Reveal.js). Sem banco, sem auth, deploy instantâneo no Vercel.</div>
        </div>
        <span className="badge">Zero-setup</span>
      </div>

      <div className="spacer" />

      <div className="panel">
        <label className="label">Tema / Conteúdo (cole um resumo, tópicos ou texto base)</label>
        <textarea
          className="textarea"
          rows={5}
          placeholder="Ex.: Aula sobre o romance O cortiço (Aluísio Azevedo): naturalismo, enredo, narrador, personagens, crítica social..."
          value={topic}
          onChange={e => setTopic(e.target.value)}
        />
        <div className="spacer" />
        <div className="row">
          <div>
            <label className="label">Nº de slides (corpo)</label>
            <input className="input" type="number" min="3" max="25" value={slidesCount}
                   onChange={e=>setSlidesCount(e.target.value)} />
          </div>
          <div>
            <label className="label">Idioma</label>
            <select className="select" value={language} onChange={e=>setLanguage(e.target.value)}>
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
            </select>
          </div>
          <div>
            <label className="label">Tom</label>
            <select className="select" value={tone} onChange={e=>setTone(e.target.value)}>
              <option>didático</option>
              <option>executivo</option>
              <option>inspirador</option>
              <option>científico</option>
            </select>
          </div>
        </div>

        <div className="spacer" />
        <div className="row">
          <div>
            <label className="label">Modelo</label>
            <select className="select" value={model} onChange={e=>setModel(e.target.value)}>
              <option value="gpt-4o-mini">gpt-4o-mini (custo baixo)</option>
              <option value="gpt-4o">gpt-4o</option>
              <option value="gpt-4.1">gpt-4.1</option>
              <option value="o4-mini">o4-mini (reasoning)</option>
            </select>
            <div className="small">Use o que sua conta permitir. Só precisa do <code>OPENAI_API_KEY</code>.</div>
          </div>
          <div style={{alignSelf:'end'}}>
            <button className="btn" disabled={loading} onClick={handleGenerate}>
              {loading ? 'Gerando…' : 'Gerar apresentação'}
            </button>
          </div>
          <div style={{alignSelf:'end'}}>
            <button className="btn" disabled={!html} onClick={handleDownload}>Baixar .html</button>
          </div>
        </div>
      </div>

      <div className="spacer" />

      <div className="panel">
        <div className="label">Pré-visualização</div>
        <div className="iframeWrap">
          <iframe ref={iframeRef} title="preview" />
        </div>
      </div>

      {!!outline && (
        <>
          <div className="spacer" />
          <div className="panel">
            <div className="label">Roteiro (JSON)</div>
            <pre style={{whiteSpace:'pre-wrap',overflow:'auto',background:'#0b0f12',padding:'12px',borderRadius:10,border:'1px solid #1e2630'}}>
{JSON.stringify(outline, null, 2)}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
