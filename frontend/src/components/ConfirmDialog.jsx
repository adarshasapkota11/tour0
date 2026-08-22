export default function ConfirmDialog({ open, title, description, confirmLabel, onConfirm, onCancel, loading }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-card border border-line rounded-2xl p-6 w-full max-w-md mx-4 space-y-4 animate-slide-up">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {description && <p className="text-sm text-ink-muted">{description}</p>}
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-ink-muted border border-line rounded-lg hover:bg-subtle"
          >
            {loading ? '…' : 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-60"
          >
            {loading ? 'Processing…' : confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}
