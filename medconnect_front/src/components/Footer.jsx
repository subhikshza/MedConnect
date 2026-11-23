import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-slate-100 bg-brand-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-4">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h3l2-6 4 12 2-6h4" />
              </svg>
            </span>
            <span className="text-lg font-bold text-ink">MedConnect</span>
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            Your trusted partner in better healthcare.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-sm font-semibold text-ink">Quick Links</h4>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li><Link to="/" className="hover:text-brand">Home</Link></li>
            <li><a href="/#about" className="hover:text-brand">About Us</a></li>
            <li><a href="/#features" className="hover:text-brand">Features</a></li>
            <li><a href="/#how" className="hover:text-brand">How It Works</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-semibold text-ink">Contact Us</h4>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li>support@medconnect.com</li>
            <li>+91 98765 43210</li>
            <li>Chennai, India</li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="text-sm font-semibold text-ink">Follow Us</h4>
          <div className="mt-3 flex gap-3">
            {['F', 'I', 'X', 'in'].map((s) => (
              <span
                key={s}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light text-sm font-semibold text-brand"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-teal-100 py-4 text-center text-xs text-ink-soft">
        © 2026 MedConnect. All rights reserved.
      </div>
    </footer>
  )
}
