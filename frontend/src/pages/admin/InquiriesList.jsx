import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { useAdminInquiries, useAdminInquiry, useAdminInquiryAction, useAdminInquiryReply } from '../../api/adminHooks'
import { extractError } from '../../api/errors'
import { ErrorState, Loading } from '../../components/State'
import { usePageTitle } from '../../hooks/usePageTitle'
import { PageHeader } from './adminForms'

const statusStyles = {
  open: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  resolved: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
}

function MessageBubble({ message }) {
  return (
    <div className={`flex ${message.is_from_staff ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
          message.is_from_staff
            ? 'bg-brand-600 text-white rounded-br-sm'
            : 'bg-subtle text-ink rounded-bl-sm'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
        <p
          className={`mt-1 text-[10px] ${
            message.is_from_staff ? 'text-white/70' : 'text-ink-faint'
          }`}
        >
          {message.sender_name || message.sender_email}
        </p>
      </div>
    </div>
  )
}

function Thread({ id }) {
  const reply = useAdminInquiryReply(id)
  const resolve = useAdminInquiryAction('resolve')
  const reopen = useAdminInquiryAction('reopen')
  const [body, setBody] = useState('')
  const { data, isLoading, isError } = useAdminInquiry(id)

  useEffect(() => {
    setBody('')
  }, [id])

  const send = (e) => {
    e.preventDefault()
    const text = body.trim()
    if (!text || reply.isPending) return
    reply.mutate(text, {
      onSuccess: () => {
        toast.success('Reply sent.')
        setBody('')
      },
      onError: (err) => toast.error(extractError(err)),
    })
  }

  const toggleStatus = () => {
    const action = data.status === 'open' ? resolve : reopen
    const message = data.status === 'open' ? 'Inquiry resolved.' : 'Inquiry reopened.'
    action.mutate(id, {
      onSuccess: () => toast.success(message),
      onError: (err) => toast.error(extractError(err)),
    })
  }

  if (isLoading) return <Loading label="Loading thread…" />
  if (isError) return <ErrorState message="Could not load this inquiry." />

  const messages = data?.messages || []

  return (
    <section className="bg-card border border-line rounded-2xl flex flex-col h-[560px]">
      <div className="px-5 py-4 border-b border-line">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-ink">{data.subject}</h3>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                statusStyles[data.status] || 'bg-subtle text-ink-muted'
              }`}
            >
              {data.status}
            </span>
            {data.status === 'open' ? (
              <button
                type="button"
                onClick={toggleStatus}
                disabled={resolve.isPending}
                className="text-xs px-2.5 py-1 rounded-lg font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-60"
              >
                {resolve.isPending ? 'Resolving…' : 'Resolve'}
              </button>
            ) : (
              <button
                type="button"
                onClick={toggleStatus}
                disabled={reopen.isPending}
                className="text-xs px-2.5 py-1 rounded-lg font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 disabled:opacity-60"
              >
                {reopen.isPending ? 'Reopening…' : 'Reopen'}
              </button>
            )}
          </div>
        </div>
        <p className="mt-0.5 text-xs text-ink-faint">
          {data.user_full_name || data.user_email} · started {data.created_at}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-ink-faint text-center py-10">No messages yet.</p>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
      </div>

      <form onSubmit={send} className="p-4 border-t border-line space-y-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          placeholder="Write a reply…"
          className="w-full px-3 py-2 rounded-lg border border-line-strong focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm resize-none"
        />
        <button
          type="submit"
          disabled={reply.isPending || !body.trim()}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-lg text-sm"
        >
          {reply.isPending ? 'Sending…' : 'Send reply'}
        </button>
      </form>
    </section>
  )
}

export default function InquiriesList() {
  usePageTitle('Admin · Inquiries')
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const params = {
    page_size: 100,
    ...(status ? { status } : {}),
    ...(search ? { search } : {}),
  }
  const { data, isLoading, isError } = useAdminInquiries(Object.keys(params).length ? params : undefined)

  const inquiries = data?.results || []
  const selected = inquiries.find((i) => i.id === selectedId) || null

  return (
    <div className="space-y-6">
      <PageHeader title="Inquiries" subtitle="Customer support threads from the site footer chat." />

      <div className="flex flex-wrap items-end gap-3">
        <input
          type="search"
          placeholder="Search subject or customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs px-3 py-2 rounded-lg border border-line-strong focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm"
        />
        <div className="w-40">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-line-strong focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm bg-card"
            aria-label="Filter by inquiry status"
          >
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <Loading label="Loading inquiries…" />
      ) : isError ? (
        <ErrorState message="Could not load inquiries." />
      ) : inquiries.length === 0 ? (
        <div className="bg-card border border-line rounded-2xl p-10 text-center text-ink-faint">
          No inquiries found.
        </div>
      ) : (
        <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-6 items-start">
          <div className="bg-card border border-line rounded-2xl divide-y divide-line">
            {inquiries.map((inquiry) => (
              <button
                key={inquiry.id}
                type="button"
                onClick={() => setSelectedId(inquiry.id)}
                className={`w-full text-left px-4 py-3 hover:bg-subtle transition-colors ${
                  selectedId === inquiry.id ? 'bg-brand-tint' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-ink text-sm truncate">{inquiry.subject}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize shrink-0 ${
                      statusStyles[inquiry.status] || 'bg-subtle text-ink-muted'
                    }`}
                  >
                    {inquiry.status}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-ink-faint truncate">
                  {inquiry.user_full_name || inquiry.user_email} · {inquiry.message_count} message
                  {inquiry.message_count === 1 ? '' : 's'}
                </p>
                {inquiry.last_message && (
                  <p className="mt-1 text-xs text-ink-muted truncate">{inquiry.last_message}</p>
                )}
              </button>
            ))}
          </div>

          {selected ? (
            <Thread key={selected.id} id={selected.id} />
          ) : (
            <div className="bg-card border border-line rounded-2xl p-10 text-center text-ink-faint">
              Select an inquiry to view the thread.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
