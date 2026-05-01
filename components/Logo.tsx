export function Logo({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 60">
      <defs>
        <linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#166534" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <g transform="translate(8, 8)">
        <path
          d="M22 2 C8 8, 2 22, 8 36 C14 44, 26 44, 34 36 C40 28, 38 14, 22 2 Z"
          fill="url(#leafGrad)"
        />
        <path
          d="M16 18 L26 28 M22 14 L18 22"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="36" cy="42" r="4" fill="#ea580c" />
      </g>
      <text
        x="60"
        y="28"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="18"
        fontWeight="800"
        fill="#0f172a"
        letterSpacing="0.5"
      >
        АГРОСНАБ
      </text>
      <text
        x="60"
        y="48"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="14"
        fontWeight="600"
        fill="#166534"
        letterSpacing="2"
      >
        ПІВДЕНЬ
      </text>
    </svg>
  );
}
