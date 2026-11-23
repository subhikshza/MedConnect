import { Link } from 'react-router-dom'

// Temporary styled placeholder for pages we build later, feature by feature.
export default function PagePlaceholder({ tag, title, text }) {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
      <span className="rounded-full bg-brand-light px-4 py-1 text-xs font-semibold tracking-wide text-brand-darker">
        {tag}
      </span>
      <h1 className="mt-5 text-4xl font-extrabold text-ink">{title}</h1>
      <p className="mt-4 max-w-md text-ink-soft">{text}</p>
      <div className="mt-8 flex gap-3">
        <Link to="/" className="rounded-lg border border-brand px-5 py-2.5 text-sm font-semibold text-brand hover:bg-brand-surface">
          Back Home
        </Link>
      </div>
    </section>
  )
}
