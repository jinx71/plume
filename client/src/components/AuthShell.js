import { Link } from 'react-router-dom';
import { Wordmark, FeatherGlyph } from './Feather';

// Shared frame for the Login and Register screens. On large screens a calm
// indigo brand panel sits beside the form, carrying the product's voice and a
// couple of sample plumes so a first-time visitor immediately gets what Plume
// is. On mobile it collapses to just the form under the wordmark.
const samplePlumes = [
  { name: 'Ada Lovelace', handle: 'ada', text: 'Wrote 200 words today, kept 40. That is the job.' },
  { name: 'Grace Hopper', handle: 'grace', text: 'A feather is light, but a thousand of them lift a bird.' },
];

const AuthShell = ({ title, subtitle, children, footer }) => (
  <div className="grid min-h-screen lg:grid-cols-2">
    {/* Brand panel */}
    <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-deep via-indigo to-indigo-deep p-12 text-white lg:flex">
      <Link to="/" className="relative z-10">
        <span className="inline-flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 backdrop-blur">
            <FeatherGlyph size={24} strokeWidth={2.25} />
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight">Plume</span>
        </span>
      </Link>

      <div className="relative z-10 max-w-md">
        <h1 className="font-display text-4xl font-semibold leading-tight">
          A quiet place for short thoughts.
        </h1>
        <p className="mt-4 text-white/70">
          Follow a few people, post in under 280 characters, and watch the feed move in real time.
        </p>

        <div className="mt-8 space-y-3">
          {samplePlumes.map((p) => (
            <div key={p.handle} className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-sm font-semibold">
                {p.name} <span className="font-normal text-white/60">@{p.handle}</span>
              </div>
              <p className="mt-1 text-sm text-white/85">{p.text}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="relative z-10 text-sm text-white/50">Real-time MERN · JWT · Socket.io</p>

      {/* Soft ambient feather watermark */}
      <FeatherGlyph
        size={420}
        strokeWidth={0.6}
        className="pointer-events-none absolute -bottom-24 -right-24 text-white/5"
      />
    </div>

    {/* Form panel */}
    <div className="flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 lg:hidden">
          <Wordmark />
        </div>
        <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
        {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
        <div className="mt-7">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
      </div>
    </div>
  </div>
);

export default AuthShell;
