import { Link } from 'react-router-dom'

// ---- small inline icons ----
const icons = {
  shield: (
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  userPlus: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 21v-1a6 6 0 0 1 6-6h0a6 6 0 0 1 4 1.5M18 8v6M15 11h6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4-4" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l3 3 5-6" />
    </>
  ),
}

function Icon({ name, className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  )
}

const features = [
  { icon: 'shield', title: 'Verified Doctors', text: 'Consult with experienced and trusted professionals.' },
  { icon: 'calendar', title: 'Easy Booking', text: 'Book appointments in just a few clicks.' },
  { icon: 'clock', title: 'Save Time', text: 'Skip the waiting room and consult online.' },
  { icon: 'lock', title: 'Secure & Private', text: 'Your data is safe and protected.' },
]

const steps = [
  { icon: 'userPlus', title: 'Create Account', text: 'Sign up and create your account.' },
  { icon: 'search', title: 'Find a Doctor', text: 'Search and choose the right doctor.' },
  { icon: 'calendar', title: 'Book Appointment', text: 'Select date & time that suits you.' },
  { icon: 'check', title: 'Get Consulted', text: 'Visit or consult online and stay healthy.' },
]

export default function Home() {
  return (
    <div>
      {/* ---------------- HERO ---------------- */}
      <section id="about" className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-block rounded-full bg-brand-light px-4 py-1 text-xs font-semibold tracking-wide text-brand-darker">
              CARE THAT CONNECTS
            </span>
            <h1 className="mt-5 text-5xl font-extrabold leading-tight text-ink md:text-6xl">
              Healthcare,
              <br />
              <span className="text-brand">Simplified.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-ink-soft">
              Book appointments, consult trusted doctors, and manage your health — all in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/book"
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-dark"
              >
                <Icon name="calendar" className="h-5 w-5" />
                Book Appointment
              </Link>
              <Link
                to="/doctors"
                className="inline-flex items-center gap-2 rounded-lg border border-brand px-6 py-3 font-semibold text-brand transition hover:bg-brand-surface"
              >
                <Icon name="search" className="h-5 w-5" />
                Find a Doctor
              </Link>
            </div>
          </div>

          {/* hero image with soft teal blob */}
          <div className="relative">
            <div className="absolute -right-10 -top-10 h-80 w-80 rounded-full bg-brand-light/70 md:h-96 md:w-96" />
            <img
              src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=900&q=80"
              alt="Doctor consulting a patient"
              className="relative z-10 w-full rounded-3xl object-cover shadow-xl"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        </div>
      </section>

      {/* ---------------- FEATURE CARDS ---------------- */}
      <section id="features" className="mx-auto -mt-6 max-w-7xl px-6">
        <div className="grid gap-6 rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-100 md:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="cursor-default rounded-xl p-3 text-center transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-105 hover:shadow-md md:text-left"
            >
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-brand md:mx-0">
                <Icon name={f.icon} />
              </span>
              <h3 className="mt-4 font-semibold text-ink">{f.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section id="how" className="mx-auto max-w-7xl px-6 py-20">
        <p className="text-center text-sm font-semibold tracking-widest text-brand">HOW IT WORKS</p>
        <h2 className="mt-2 text-center text-3xl font-bold text-ink">Your Health in 4 Simple Steps</h2>
        <div className="mx-auto mt-4 h-1 w-16 rounded bg-brand" />

        <div className="mt-14 grid gap-10 md:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="text-center">
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-surface text-brand">
                <Icon name={s.icon} className="h-8 w-8" />
                <span className="absolute -bottom-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-6 font-semibold text-ink">{s.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="bg-brand">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-12 text-center md:flex-row md:text-left">
          <div>
            <h2 className="text-2xl font-bold text-white">Ready to take care of your health?</h2>
            <p className="mt-1 text-brand-light">Create your free account and book your first appointment today.</p>
          </div>
          <Link
            to="/signup"
            className="rounded-lg bg-white px-6 py-3 font-semibold text-brand-dark transition hover:bg-brand-surface"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  )
}
