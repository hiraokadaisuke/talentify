export default function RouteLoading() {
  return (
    <div
      className="w-full bg-[#f1f5f9] px-4 py-5 sm:px-6"
      role="status"
      aria-live="polite"
      aria-label="ページを読み込んでいます"
    >
      <div className="mx-auto w-full max-w-6xl animate-pulse space-y-4">
        <div className="h-1.5 w-24 rounded-full bg-blue-500/70" />
        <div className="h-8 w-48 rounded-lg bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-28 rounded-2xl border border-slate-200 bg-white" />
          <div className="h-28 rounded-2xl border border-slate-200 bg-white" />
        </div>
        <div className="h-44 rounded-2xl border border-slate-200 bg-white" />
      </div>
      <span className="sr-only">読み込み中...</span>
    </div>
  )
}
