// A neutral stand-in figure (long coat, wide trousers, cap) in greys, drawn in SVG. It only shows until a real hero
// photograph is added (Admin → Storefront images) or a product has a photograph.
export default function FigurePlaceholder() {
  return (
    <svg className="s13-figure" viewBox="0 0 400 900" role="img" aria-label="Menswear figure placeholder" preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="fg-coat" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#6b6b69" /><stop offset=".55" stopColor="#4c4c4a" /><stop offset="1" stopColor="#363634" /></linearGradient>
        <linearGradient id="fg-sleeve" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#5a5a58" /><stop offset="1" stopColor="#3d3d3b" /></linearGradient>
        <linearGradient id="fg-trou" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#262626" /><stop offset="1" stopColor="#141414" /></linearGradient>
      </defs>
      <g>
        <path d="M168 92c-2-44 34-60 66-48 18 6 20 28 16 40l22 8c-8 8-20 8-30 6l-70 2z" fill="#171717" />
        <ellipse cx="206" cy="106" rx="34" ry="40" fill="#bdbdbb" />
        <path d="M172 96c10-8 60-8 70 0v14c-14 4-56 4-70 0z" fill="#171717" opacity=".9" />
        <rect x="190" y="140" width="32" height="34" rx="8" fill="#a9a9a7" />
        <path d="M120 190c34-24 138-24 176 0l20 170 14 276-232 12 14-278z" fill="url(#fg-coat)" />
        <path d="M188 176l8 468 38-6-4-462z" fill="#1d1d1d" />
        <path d="M122 196L90 424l22 140 40-18-12-160 10-186z" fill="url(#fg-sleeve)" />
        <path d="M294 196l26 184-18 94-36-30 2-152z" fill="url(#fg-sleeve)" />
        <ellipse cx="128" cy="572" rx="16" ry="20" fill="#a9a9a7" />
        <path d="M128 628l66 8 4 232h-82z" fill="url(#fg-trou)" />
        <path d="M216 634l86-12 22 246h-100z" fill="url(#fg-trou)" />
        <path d="M104 868c0-14 30-20 64-14l14 22c0 8-8 12-24 12h-48c-6 0-6-12-6-20z" fill="#dcdcda" />
        <path d="M226 866c0-14 34-18 74-12l22 24c0 8-10 10-28 10h-62c-6 0-6-12-6-22z" fill="#e8e8e6" />
      </g>
    </svg>
  );
}
