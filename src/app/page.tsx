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
  const [activeTab, setActiveTab] = useState<'add' | 'browse'>('add')
  const [deletingId, setDeletingId] = useState<number | null>(null)

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

  async function deletePrompt(id: number) {
    setDeletingId(id)
    const r = await fetch(`/api/prompts?id=${id}`, { method: 'DELETE' })
    if (!r.ok) { console.error('DELETE /api/prompts', r.status); setDeletingId(null); return }
    await load()
    setDeletingId(null)
  }

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setActiveTab('add')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'add'
              ? 'border-black text-black dark:border-white dark:text-white'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
          }`}
        >
          Add Quote
        </button>
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'browse'
              ? 'border-black text-black dark:border-white dark:text-white'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
          }`}
        >
          Browse Quotes
        </button>
      </div>

      {/* Add Quote Tab */}
      {activeTab === 'add' && (
        <section className="card p-6 md:p-8">
          <div className="mt-6 grid gap-3">
            <textarea className="textarea" placeholder="paste commonplace..." value={text} onChange={e=>setText(e.target.value)} />
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="btn w-full sm:w-auto" disabled={loading || !text.trim()} onClick={addPrompt}>{loading ? 'Adding…' : 'Add to memory'}</button>
            </div>
          </div>
        </section>
      )}

      {/* Browse Quotes Tab */}
      {activeTab === 'browse' && (
        <>
          <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <input className="input" placeholder="Search quotes..." value={query} onChange={e=>setQuery(e.target.value)} />
            <div className="flex items-center gap-2">
              <FilterChip active={filter==='all'} onClick={()=>setFilter('all')}>All</FilterChip>
              <FilterChip active={filter==='unsent'} onClick={()=>setFilter('unsent')}>Unsent</FilterChip>
              <FilterChip active={filter==='recent'} onClick={()=>setFilter('recent')}>Most recent</FilterChip>
            </div>
          </section>

          <section className="grid gap-3">
            {filtered.length === 0 && (
              <div className="text-center py-8">
                <div className="text-sm text-neutral-500">
                  {query.trim() ? 'No quotes match your search.' : 'No quotes yet. Add your first one in the "Add Quote" tab.'}
                </div>
              </div>
            )}
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
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this quote? This action cannot be undone.')) {
                        deletePrompt(p.id)
                      }
                    }}
                    disabled={deletingId === p.id}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-50"
                    title="Delete quote"
                  >
                    {deletingId === p.id ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </article>
            ))}
          </section>
        </>
      )}
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
