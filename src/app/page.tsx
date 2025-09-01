'use client'
import { useEffect, useMemo, useState } from 'react'

type Prompt = { 
  id: number; 
  text?: string; 
  photoUrl?: string;
  promptType: 'TEXT' | 'PHOTO';
  tag?: string | null; 
  cooldown: number; 
  timesSent: number; 
  lastSent?: string | null 
}

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
  
  // Photo upload states
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploadMode, setUploadMode] = useState<'text' | 'photo'>('text')

  const filtered = useMemo(() => {
    let list = prompts
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(p => p.text?.toLowerCase().includes(q) || (p.tag || '').toLowerCase().includes(q))
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
    
    if (uploadMode === 'photo' && photoFile) {
      // Handle photo upload
      const formData = new FormData()
      formData.append('photo', photoFile)
      formData.append('tag', tag || '')
      formData.append('cooldown', cooldown.toString())
      
      const r = await fetch('/api/prompts', { 
        method: 'POST', 
        body: formData 
      })
      
      if (!r.ok) { 
        console.error('POST /api/prompts', r.status); 
        setLoading(false); 
        return 
      }
      
      // Reset photo states
      setPhotoFile(null)
      setPhotoPreview(null)
    } else {
      // Handle text upload (existing logic)
      const r = await fetch('/api/prompts', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ text, tag: tag || null, cooldown }) 
      })
      
      if (!r.ok) { 
        console.error('POST /api/prompts', r.status); 
        setLoading(false); 
        return 
      }
      
      setText('')
    }
    
    setTag('')
    setCooldown(0)
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

  // Photo handling functions
  const handlePhotoDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handlePhotoSelect(files[0])
    }
  }

  const handlePhotoSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setPhotoPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('add')}
          className={`tab-button ${
            activeTab === 'add' ? 'tab-button-active' : 'tab-button-inactive'
          }`}
        >
          Add Quote
        </button>
        <button
          onClick={() => setActiveTab('browse')}
          className={`tab-button ${
            activeTab === 'browse' ? 'tab-button-active' : 'tab-button-inactive'
          }`}
        >
          Browse Quotes
        </button>
      </div>

      {/* Tab Content Container - Fixed Width */}
      <div className="w-full">
        {/* Add Quote Tab */}
        {activeTab === 'add' && (
          <section className="card p-8">
            <h2 className="text-xl font-semibold mb-4">Add New Quote</h2>
            
            {/* Upload Mode Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setUploadMode('text')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  uploadMode === 'text'
                    ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Text Quote
              </button>
              <button
                onClick={() => setUploadMode('photo')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  uploadMode === 'photo'
                    ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Photo Quote
              </button>
            </div>

            <div className="space-y-4">
              {uploadMode === 'text' ? (
                // Text input mode
                <div>
                  <label htmlFor="quote-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quote Text
                  </label>
                  <textarea 
                    id="quote-text"
                    className="textarea" 
                    placeholder="Paste your quote here..." 
                    value={text} 
                    onChange={e=>setText(e.target.value)} 
                  />
                </div>
              ) : (
                // Photo upload mode
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload Photo
                  </label>
                  
                  {!photoPreview ? (
                    <div
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                      onDrop={handlePhotoDrop}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <div className="space-y-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Drop your photo here, or{' '}
                            <label className="text-blue-600 hover:text-blue-500 cursor-pointer">
                              browse
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handlePhotoSelect(e.target.files[0])}
                              />
                            </label>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <button
                          onClick={removePhoto}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                          title="Remove photo"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Common fields for both modes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tag" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tag (optional)
                  </label>
                  <input
                    id="tag"
                    type="text"
                    className="input"
                    placeholder="e.g., motivation, wisdom"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="cooldown" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cooldown (days)
                  </label>
                  <input
                    id="cooldown"
                    type="number"
                    min="0"
                    className="input"
                    value={cooldown}
                    onChange={(e) => setCooldown(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <button 
                className="btn w-full sm:w-auto" 
                disabled={loading || (uploadMode === 'text' ? !text.trim() : !photoFile)} 
                onClick={addPrompt}
              >
                {loading ? 'Adding…' : `Add ${uploadMode === 'text' ? 'Quote' : 'Photo'} to Memory`}
              </button>
            </div>
          </section>
        )}

        {/* Browse Quotes Tab */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="w-full md:w-96">
                <input 
                  className="input" 
                  placeholder="Search quotes..." 
                  value={query} 
                  onChange={e=>setQuery(e.target.value)} 
                />
              </div>
              <div className="flex items-center gap-2">
                <FilterChip active={filter==='all'} onClick={()=>setFilter('all')}>All</FilterChip>
                <FilterChip active={filter==='unsent'} onClick={()=>setFilter('unsent')}>Unsent</FilterChip>
                <FilterChip active={filter==='recent'} onClick={()=>setFilter('recent')}>Most Recent</FilterChip>
              </div>
            </section>

            <section className="space-y-4">
              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400">
                    {query.trim() ? 'No quotes match your search.' : 'No quotes yet. Add your first one in the "Add Quote" tab.'}
                  </div>
                </div>
              )}
              {filtered.map(p => (
                <article key={p.id} className="card p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      {p.promptType === 'PHOTO' ? (
                        <div className="space-y-3">
                          <img 
                            src={p.photoUrl} 
                            alt="Quote" 
                            className="w-full max-w-md rounded-lg object-cover"
                          />
                          <div className="text-sm text-gray-600 dark:text-gray-400 italic">
                            Photo Quote
                          </div>
                        </div>
                      ) : (
                        <blockquote className="text-gray-800 dark:text-gray-200 leading-relaxed">
                          "{p.text}"
                        </blockquote>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="badge">Sent {p.timesSent}×</span>
                        <span className="badge">
                          {p.lastSent ? `Last: ${new Date(p.lastSent).toLocaleDateString()}` : 'Never sent'}
                        </span>
                        <span className="badge">Cooldown: {p.cooldown || 0}d</span>
                        {p.tag && <span className="badge">#{p.tag}</span>}
                        <span className="badge">{p.promptType}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this quote? This action cannot be undone.')) {
                          deletePrompt(p.id)
                        }
                      }}
                      disabled={deletingId === p.id}
                      className="delete-btn"
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
          </div>
        )}
      </div>
    </div>
  )
}

function FilterChip({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick?: ()=>void }) {
  return (
    <button 
      onClick={onClick} 
      className={`rounded-md px-3 py-1.5 text-sm border transition-colors duration-200 ${
        active 
          ? 'bg-gray-900 text-white border-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100' 
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
      }`}
    >
      {children}
    </button>
  )
}
