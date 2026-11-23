// Small pop-in message that slides down from the top of the screen.
// Used for "success" moments like login/signup — shows for a moment, then
// the page navigates away and it disappears with it.
export default function Toast({ message, show }) {
  if (!show) return null

  return (
    <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 animate-slide-down rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white shadow-lg">
      {message}
    </div>
  )
}
