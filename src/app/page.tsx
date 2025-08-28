'use client'
import { useEffect, useMemo, useState } from 'react'

type Prompt = { id: number; text: string; tag?: string | null; cooldown: number; timesSent: number; lastSent?: string | null }

export default function Home() {
  const [text, setText] = useState('')
  const [tag, setTag] = useState('')
  const [cooldown, setCooldown] = useState<number>(0)
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'unsent' | 'recent'>('all')

  const filtered = useMemo(() => {
    let list = prompts
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(p => p.text.toLowerCase().includes(q) || (p.tag || '').toLowerCase().includes(q))
    }
    if (filter === 'unsent') list = list.filter(p => !p.lastSent)
    if (filter === 'recent') list = [...list].sort((a,b) => // FIX: replace toSorted
      (b.lastSent ? new Date(b.lastSent).getTime() : 0) - (a.lastSent ? new Date(a.lastSent).getTime() : 0)
    )
    return list
  }, [prompts, query, filter])

  async function load() {
    const r = await fetch('/api/prompts')
    if (!r.ok) { console.error('GET /api/prompts', r.status); return }
    const j = await r.json()
    setPrompts(j.prompts || [])
  }
  useEffect(() => { load() }, [])

  async function addPrompt() {
    setLoading(true)
    const r = await fetch('/api/prompts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, tag: tag || null, cooldown }) })
    if (!r.ok) { console.error('POST /api/prompts', r.status); setLoading(false); return }
    setText(''); setTag(''); setCooldown(0)
    await load()
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      <section className="card p-6 md:p-8">
        {/* <p className="mt-2 text-neutral-600 dark:text-neutral-300">We’ll email you one randomly chosen (but least-recent) line every day. Paste more below.</p> */}

        <div className="mt-6 grid gap-3">
          <textarea className="textarea" placeholder="Paste a quote, note, or reminder…" value={text} onChange={e=>setText(e.target.value)} />
          <div className="flex flex-col sm:flex-row gap-3">
            <input className="input sm:max-w-xs" placeholder="Tag (optional)" value={tag} onChange={e=>setTag(e.target.value)} />
            <div className="flex items-center gap-2">
              <label className="text-sm text-neutral-500">Cooldown days</label>
              <input type="number" className="input w-28" value={cooldown} min={0} onChange={e=>setCooldown(parseInt(e.target.value || '0'))} />
            </div>
            <button className="btn w-full sm:w-auto" disabled={loading || !text.trim()} onClick={addPrompt}>{loading ? 'Adding…' : 'Add to memory'}</button>
          </div>
        </div>
      </section>

      <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <input className="input" placeholder="Search…" value={query} onChange={e=>setQuery(e.target.value)} />
        <div className="flex items-center gap-2">
          <FilterChip active={filter==='all'} onClick={()=>setFilter('all')}>All</FilterChip>
          <FilterChip active={filter==='unsent'} onClick={()=>setFilter('unsent')}>Unsent</FilterChip>
          <FilterChip active={filter==='recent'} onClick={()=>setFilter('recent')}>Most recent</FilterChip>
        </div>
      </section>

      <section className="grid gap-3">
        {filtered.length === 0 && (<div className="text-sm text-neutral-500">No prompts yet. Add your first one above.</div>)}
        {filtered.map(p => (
          <article key={p.id} className="card p-4 md:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 w-full">
                <p className="whitespace-pre-wrap leading-relaxed">{p.text}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                  <span className="badge">Sent {p.timesSent}×</span>
                  <span className="badge">{p.lastSent ? `Last: ${new Date(p.lastSent).toLocaleString()}` : 'Never sent'}</span>
                  <span className="badge">Cooldown: {p.cooldown || 0}d</span>
                  {p.tag && <span className="badge">#{p.tag}</span>}
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

function FilterChip({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick?: ()=>void }) {
  return (
    <button onClick={onClick} className={'rounded-xl px-3 py-1.5 text-sm border transition ' + (active ? 'bg-black text-white border-black' : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600')}>
      {children}
    </button>
  )
}
