/** Brand mark aligned with portal primary blue; swap for raster/SVG from design if needed. */
export function ChampionMark({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="40" height="40" rx="10" className="fill-primary-500" />
      <path
        d="M20 10v20M12 18h16"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
