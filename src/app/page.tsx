'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import styles from './page.module.css'

function isInFreeWindow(): boolean {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const twTime = new Date(utc + 8 * 60 * 60000)
  const y = twTime.getFullYear()
  const mo = twTime.getMonth() + 1
  const d = twTime.getDate()
  const mins = twTime.getHours() * 60 + twTime.getMinutes()
  if (y !== 2026 || mo !== 6 || d !== 12) return false
  return mins >= 9 * 60 + 15 && mins <= 11 * 60 + 59
}

interface Slide {
  id: number
  title: string
  image: string
  summary: string
  relevance?: number
}

interface Message {
  role: 'user' | 'bot'
  text: string
  slides?: Slide[]
  time: string
}

const SUGGESTIONS = [
  "Why can't you just use nearest-car dispatch?",
  'What is the passenger grouping formula?',
  'What does the β parameter control?',
  'How is driver fairness measured?',
  'Which mode has the best results?',
  'What is the Bottom-20 metric?',
  'How does carpool improve efficiency?',
  'What are the guardrails?',
  'What are the six operating modes?',
  'How would this deploy in production?',
]

function now() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }

export default function Home() {
  const [unlocked, setUnlocked] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState(false)

  useEffect(() => {
    if (isInFreeWindow() || sessionStorage.getItem('linego_unlocked') === '1') {
      setUnlocked(true)
    }
  }, [])

  const handleUnlock = async () => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwInput.trim() }),
      })
      if (res.ok) {
        sessionStorage.setItem('linego_unlocked', '1')
        setUnlocked(true)
        setPwError(false)
      } else {
        setPwError(true)
        setPwInput('')
      }
    } catch {
      setPwError(true)
      setPwInput('')
    }
  }

  const handlePwKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleUnlock() }

  const [messages, setMessages] = useState<Message[]>([{
    role: 'bot',
    text: "Hi! I'm the LINEGO Dispatch QA Bot. Ask me anything about the adaptive two-step dispatch framework — passenger grouping, driver assignment, operating modes, results, or conclusions. Type or use the mic button.",
    time: now(),
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [ttsOn, setTtsOn] = useState(true)
  const [speaking, setSpeaking] = useState(false)
  const [recording, setRecording] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [relevantSlides, setRelevantSlides] = useState<Slide[]>([])
  const [showSuggestions, setShowSuggestions] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  useEffect(() => {
    const w = window as any
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!SR) return
    const r = new SR()
    r.continuous = false
    r.interimResults = true
    r.lang = 'en-US'
    r.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join('')
      setInput(t)
      if (e.results[e.results.length - 1].isFinal) {
        setRecording(false)
        setTimeout(() => sendQuery(t), 300)
      }
    }
    r.onerror = () => setRecording(false)
    r.onend = () => setRecording(false)
    recognitionRef.current = r
  }, [])

  const speak = useCallback((text: string) => {
    if (!ttsOn || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g, ''))
    u.rate = 1.05
    const voices = window.speechSynthesis.getVoices()
    const v = voices.find(v => v.lang.startsWith('en') && v.name.includes('Natural'))
      || voices.find(v => v.lang.startsWith('en')) || voices[0]
    if (v) u.voice = v
    u.onstart = () => setSpeaking(true)
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(u)
  }, [ttsOn])

  const stopSpeaking = () => { window.speechSynthesis?.cancel(); setSpeaking(false) }

  const toggleMic = () => {
    if (!recognitionRef.current) { alert('Speech recognition not supported. Try Chrome.'); return }
    if (recording) { recognitionRef.current.stop(); setRecording(false) }
    else { stopSpeaking(); setRecording(true); recognitionRef.current.start() }
  }

  const sendQuery = useCallback(async (query: string) => {
    if (!query.trim() || loading) return
    setLoading(true)
    setShowSuggestions(false)
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: query, time: now() }])
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setRelevantSlides(data.slides || [])
      setMessages(prev => [...prev, { role: 'bot', text: data.answer, slides: data.slides, time: now() }])
      speak(data.answer)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setMessages(prev => [...prev, { role: 'bot', text: `Error: ${msg}`, time: now() }])
    }
    setLoading(false)
  }, [loading, speak])

  const handleSend = () => sendQuery(input)
  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }

  return (
    <div className={styles.app}>

      {/* Password gate */}
      {!unlocked && (
        <div className={styles.pwOverlay}>
          <div className={styles.pwModal}>
            <div className={styles.pwLock}>🚖</div>
            <h2 className={styles.pwTitle}>LINEGO Dispatch QA</h2>
            <p className={styles.pwSub}>
              Poster session assistant for<br />
              <strong>Adaptive Two-Step Dispatch Optimization</strong>
              <span className={styles.pwFreeNote}>Free access · 12 Jun 09:15–11:59 AM TW time</span>
            </p>
            <input
              className={`${styles.pwInput} ${pwError ? styles.pwInputError : ''}`}
              type="password"
              placeholder="Enter password"
              value={pwInput}
              onChange={e => { setPwInput(e.target.value); setPwError(false) }}
              onKeyDown={handlePwKey}
              autoFocus
            />
            {pwError && <p className={styles.pwErrorMsg}>Incorrect password. Try again.</p>}
            <button className={styles.pwBtn} onClick={handleUnlock}>Unlock</button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>🚖</div>
        <div className={styles.headerText}>
          <h1>LINEGO Dispatch QA</h1>
          <span className={styles.subtitle}>Adaptive Two-Step Dispatch · Poster Session Assistant</span>
        </div>
        <div className={styles.headerRight}>
          <button
            className={`${styles.iconBtn} ${ttsOn ? styles.active : ''}`}
            onClick={() => { if (ttsOn) stopSpeaking(); setTtsOn(!ttsOn) }}
          >
            🔊 {ttsOn ? 'Voice On' : 'Voice Off'}
            {speaking && (
              <span className={styles.wave}>
                <span /><span /><span /><span /><span />
              </span>
            )}
          </button>
        </div>
      </header>

      <div className={styles.main}>
        {/* Slide panel */}
        <aside className={styles.slidePanel}>
          <div className={styles.slidePanelHeader}>
            <h2>Relevant Slides</h2>
            {relevantSlides.length > 0 && (
              <span className={styles.badge}>{relevantSlides.length} slide{relevantSlides.length > 1 ? 's' : ''}</span>
            )}
          </div>
          <div className={styles.slideDisplay}>
            {relevantSlides.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🔍</div>
                <p>Ask a question and I&apos;ll pull the relevant slides.</p>
                <div className={styles.slideHints}>
                  <span className={styles.hintLabel}>Slides cover:</span>
                  {['Motivation','Why Carpool','Grouping Formula','Assignment Formula','6 Operating Modes','Results Table','Conclusion'].map(t => (
                    <span key={t} className={styles.hintChip}>{t}</span>
                  ))}
                </div>
              </div>
            ) : relevantSlides.map((s, i) => (
              <div key={s.id} className={`${styles.slideCard} ${i === 0 ? styles.activeCard : ''}`}>
                <div className={styles.slideImgWrap}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.image} alt={`Slide ${s.id}`} onClick={() => setLightbox(s.image)} style={{ cursor: 'zoom-in' }} />
                  <span className={styles.slideNum}>Slide {s.id}</span>
                  <span className={styles.relevancePill}>{Math.round((s.relevance || 0) * 100)}% match</span>
                </div>
                <div className={styles.slideMeta}>
                  <div className={styles.slideTitle}>{s.title}</div>
                  <div className={styles.slideSummary}>{s.summary.slice(0, 140)}…</div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat panel */}
        <div className={styles.chatPanel}>
          <div className={styles.messages}>
            {messages.map((m, i) => (
              <div key={i} className={`${styles.msg} ${m.role === 'user' ? styles.userMsg : styles.botMsg}`}>
                <div className={styles.bubble}>
                  {m.text}
                  {m.slides?.map(s => (
                    <div key={s.id} className={styles.slideChip}>📎 Slide {s.id}: {s.title}</div>
                  ))}
                </div>
                <div className={styles.msgFooter}>
                  <span className={styles.msgTime}>{m.time}</span>
                  {m.role === 'bot' && (
                    <button className={styles.replayBtn} onClick={() => speak(m.text)} title="Replay voice">🔊</button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className={`${styles.msg} ${styles.botMsg}`}>
                <div className={styles.bubble}>
                  <div className={styles.typingDots}><span /><span /><span /></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {showSuggestions && (
            <div className={styles.suggestions}>
              {SUGGESTIONS.map(s => (
                <button key={s} className={styles.chip} onClick={() => sendQuery(s)}>{s}</button>
              ))}
            </div>
          )}

          <div className={styles.inputArea}>
            <textarea
              className={styles.input}
              rows={1}
              value={input}
              placeholder={recording ? '🔴 Listening…' : 'Ask about LINEGO dispatch…'}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button
              className={`${styles.inputBtn} ${styles.micBtn} ${recording ? styles.recording : ''}`}
              onClick={toggleMic}
            >🎙️</button>
            <button className={`${styles.inputBtn} ${styles.sendBtn}`} onClick={handleSend} disabled={loading || !input.trim()}>
              <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)}>
          <button className={styles.lightboxClose} onClick={() => setLightbox(null)}>✕</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="Slide fullscreen" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
