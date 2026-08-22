import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

import { useCreateInquiry, useInquiries, useInquiry, useSendInquiryMessage } from '../api/hooks'
import { extractError } from '../api/errors'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../i18n/index.jsx'

const POLL_MS = 10000

function formatTime(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function InquiryWidget() {
  const { t } = useI18n()
  const { isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const [view, setView] = useState('threads')
  const [activeId, setActiveId] = useState(null)
  const panelRef = useRef(null)
  const toggleRef = useRef(null)

  const listQuery = useInquiries()
  const detailQuery = useInquiry(activeId)
  const createInquiry = useCreateInquiry()
  const sendMessage = useSendInquiryMessage(activeId)

  useEffect(() => {
    if (!open || !isAuthenticated) return undefined
    const timer = setInterval(() => {
      listQuery.refetch()
      if (activeId) detailQuery.refetch()
    }, POLL_MS)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isAuthenticated, activeId])

  useEffect(() => {
    if (!open) return undefined
    panelRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const handleOpen = () => {
    setOpen((v) => {
      const next = !v
      if (!next) toggleRef.current?.focus()
      return next
    })
    if (!open) {
      setView('threads')
      setActiveId(null)
    }
  }

  const openThread = (id) => {
    setActiveId(id)
    setView('thread')
  }

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        onClick={handleOpen}
        aria-expanded={open}
        aria-controls="inquiry-panel"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-brand-600/20 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5m7-11H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h4l5 4v-4h9a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z" />
        </svg>
        {t('footer.chatWithUs')}
      </button>

      {open && (
        <div
          ref={panelRef}
          id="inquiry-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inquiry-panel-title"
          tabIndex={-1}
          className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm bg-card border border-line rounded-2xl shadow-2xl flex flex-col overflow-hidden outline-none"
        >
          <header className="flex items-center justify-between gap-2 px-4 py-3 bg-brand-600 text-white">
            <div className="min-w-0">
              <p id="inquiry-panel-title" className="font-semibold leading-tight">{t('inquiry.title')}</p>
              <p className="text-xs text-white/80 truncate">{t('inquiry.subtitle')}</p>
            </div>
            <button
              type="button"
              onClick={handleOpen}
              aria-label={t('inquiry.closeChat')}
              className="p-1 rounded-lg hover:bg-white/20 shrink-0"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </header>

          <div className="h-96 flex flex-col">
            {!isAuthenticated ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
                <p className="text-4xl">💬</p>
                <p className="text-sm text-ink-muted">{t('inquiry.loginRequired')}</p>
                <Link
                  to="/login"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  {t('inquiry.logIn')}
                </Link>
              </div>
            ) : view === 'composer' ? (
              <Composer
                onBack={() => setView('threads')}
                onCreated={openThread}
                createInquiry={createInquiry}
              />
            ) : view === 'thread' && activeId ? (
              <Thread
                detailQuery={detailQuery}
                sendMessage={sendMessage}
                onBack={() => setView('threads')}
              />
            ) : (
              <Threads
                listQuery={listQuery}
                onOpen={openThread}
                onNew={() => setView('composer')}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}

function Threads({ listQuery, onOpen, onNew }) {
  const { t } = useI18n()
  const threads = listQuery.data?.results || []

  if (listQuery.isLoading) {
    return <p className="flex-1 flex items-center justify-center text-sm text-ink-faint">{t('inquiry.loading')}</p>
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {threads.length === 0 ? (
          <p className="text-center text-sm text-ink-faint py-10">{t('inquiry.noThreads')}</p>
        ) : (
          threads.map((thread) => (
            <button
              key={thread.id}
              type="button"
              onClick={() => onOpen(thread.id)}
              className="w-full text-left bg-subtle hover:bg-brand-tint rounded-xl px-3 py-2.5 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink truncate">{thread.subject}</p>
                <span
                  className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    thread.status === 'open'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                  }`}
                >
                  {t(thread.status === 'open' ? 'inquiry.open' : 'inquiry.resolved')}
                </span>
              </div>
              {thread.last_message && (
                <p className="mt-1 text-xs text-ink-muted truncate">{thread.last_message}</p>
              )}
            </button>
          ))
        )}
      </div>
      <div className="p-3 border-t border-line">
        <button
          type="button"
          onClick={onNew}
          className="w-full px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {t('inquiry.startNew')}
        </button>
      </div>
    </div>
  )
}

function Composer({ onBack, onCreated, createInquiry }) {
  const { t } = useI18n()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) return
    createInquiry.mutate(
      { subject: subject.trim(), message: message.trim() },
      {
        onSuccess: (data) => {
          toast.success(t('inquiry.toastSent'))
          onCreated(data.id)
        },
        onError: (err) => toast.error(extractError(err)),
      },
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-3 p-4 overflow-y-auto">
        <label className="block">
          <span className="text-xs font-medium text-ink-subtle">{t('inquiry.subject')}</span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t('inquiry.subjectPlaceholder')}
            className="field mt-1"
          />
        </label>
        <label className="block flex-1 flex flex-col">
          <span className="text-xs font-medium text-ink-subtle">{t('inquiry.message')}</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('inquiry.messagePlaceholder')}
            rows={5}
            className="field mt-1 flex-1 resize-none"
          />
        </label>
        <button
          type="submit"
          disabled={createInquiry.isPending || !subject.trim() || !message.trim()}
          className="btn-primary w-full"
        >
          {createInquiry.isPending ? t('inquiry.sending') : t('inquiry.send')}
        </button>
      </form>
      <div className="p-3 border-t border-line">
        <button
          type="button"
          onClick={onBack}
          className="w-full px-4 py-2 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          ← {t('inquiry.backToThreads')}
        </button>
      </div>
    </div>
  )
}

function Thread({ detailQuery, sendMessage, onBack }) {
  const { t } = useI18n()
  const [body, setBody] = useState('')
  const scrollerRef = useRef(null)
  const thread = detailQuery.data
  const messages = thread?.messages || []

  useEffect(() => {
    const el = scrollerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!body.trim()) return
    sendMessage.mutate(body.trim(), {
      onSuccess: () => {
        setBody('')
        toast.success(t('inquiry.toastSent'))
      },
      onError: (err) => toast.error(extractError(err)),
    })
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div ref={scrollerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {detailQuery.isLoading && (
          <p className="text-center text-sm text-ink-faint">{t('inquiry.loading')}</p>
        )}
        {messages.map((msg) => {
          const mine = !msg.is_from_staff
          return (
            <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  mine
                    ? 'bg-brand-600 text-white rounded-br-md'
                    : 'bg-subtle text-ink rounded-bl-md'
                }`}
              >
                <p className="text-[10px] font-semibold opacity-70">
                  {mine ? t('inquiry.you') : t('inquiry.tourNepal')} · {formatTime(msg.created_at)}
                </p>
                <p className="mt-0.5 whitespace-pre-wrap break-words">{msg.body}</p>
              </div>
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-line flex items-end gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t('inquiry.replyPlaceholder')}
          rows={2}
          className="field flex-1 resize-none text-sm"
        />
        <button
          type="submit"
          disabled={sendMessage.isPending || !body.trim()}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {sendMessage.isPending ? t('inquiry.sending') : t('inquiry.send')}
        </button>
      </form>

      <div className="p-3 border-t border-line">
        <button
          type="button"
          onClick={onBack}
          className="w-full px-4 py-2 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          ← {t('inquiry.backToThreads')}
        </button>
      </div>
    </div>
  )
}
