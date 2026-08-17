/** Shared header banner for every artist profile page: a plain gallery-wall
 * treatment (soft spotlight glow, faint canvas/plaster grain, and a tiled
 * GALLERY LUMORA / ARTIST ARCHIVE watermark) so the banner no longer depends
 * on a per-artist random photo. */
export default function ArtistProfileBanner({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`relative overflow-hidden bg-paper-raised ${className}`}>
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1600 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="banner-spotlight-1" cx="28%" cy="0%" r="80%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="banner-spotlight-2" cx="76%" cy="8%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <filter id="banner-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="noise" />
            <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0" />
          </filter>
          <pattern
            id="banner-watermark"
            width="380"
            height="190"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-18)"
          >
            <text
              x="0"
              y="60"
              fontFamily="var(--font-display), sans-serif"
              fontSize="26"
              fontWeight="600"
              letterSpacing="6"
              fill="#111111"
              fillOpacity="0.05"
            >
              GALLERY LUMORA
            </text>
            <text
              x="0"
              y="132"
              fontFamily="var(--font-display), sans-serif"
              fontSize="15"
              fontWeight="600"
              letterSpacing="8"
              fill="#111111"
              fillOpacity="0.045"
            >
              ARTIST ARCHIVE
            </text>
          </pattern>
        </defs>

        {/* warm-gray gallery wall base */}
        <rect width="1600" height="400" fill="#f4f2ee" />
        {/* fine canvas / plaster grain */}
        <rect width="1600" height="400" filter="url(#banner-grain)" />
        {/* soft overhead spotlights */}
        <rect width="1600" height="400" fill="url(#banner-spotlight-1)" />
        <rect width="1600" height="400" fill="url(#banner-spotlight-2)" />
        {/* faint archive watermark */}
        <rect width="1600" height="400" fill="url(#banner-watermark)" />
      </svg>
    </div>
  );
}
