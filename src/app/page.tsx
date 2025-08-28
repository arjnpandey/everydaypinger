'use client';
import { useEffect, useState } from 'react';


export default function Home() {
const [text, setText] = useState('');
const [tag, setTag] = useState('');
const [cooldown, setCooldown] = useState(0);
const [prompts, setPrompts] = useState<any[]>([]);
const [loading, setLoading] = useState(false);


async function load() {
const r = await fetch('/api/prompts');
const j = await r.json();
setPrompts(j.prompts || []);
}


useEffect(() => { load(); }, []);


async function addPrompt() {
setLoading(true);
await fetch('/api/prompts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, tag, cooldown }) });
setText(''); setTag(''); setCooldown(0);
await load();
setLoading(false);
}


return (
<main style={{ maxWidth: 720, margin: '40px auto', padding: 16 }}>
<h1>Memory Pinger</h1>
<p>Paste lines you want future-you to remember. One gets emailed daily.</p>


<div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
<textarea value={text} onChange={e=>setText(e.target.value)} rows={4} placeholder="Paste a quote or line..."/>
<div style={{ display: 'flex', gap: 8 }}>
<input value={tag} onChange={e=>setTag(e.target.value)} placeholder="Tag (optional)"/>
<input type="number" value={cooldown} onChange={e=>setCooldown(parseInt(e.target.value||'0'))} placeholder="Extra cooldown days"/>
<button disabled={loading || !text.trim()} onClick={addPrompt}>Add</button>
</div>
</div>


<h2 style={{ marginTop: 32 }}>Your prompts</h2>
<ul style={{ padding: 0, listStyle: 'none' }}>
{prompts.map((p:any)=> (
<li key={p.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 10 }}>
<div style={{ whiteSpace: 'pre-wrap' }}>{p.text}</div>
<small>Tag: {p.tag || '—'} · Sent: {p.timesSent} · Last: {p.lastSent ? new Date(p.lastSent).toLocaleString() : '—'}</small>
</li>
))}
</ul>
</main>
);
}