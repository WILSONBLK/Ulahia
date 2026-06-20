export default function Logo({ size = 42 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="42" height="42" rx="10" fill="#087f5b" />
      {/* Left page */}
      <path d="M8 13 Q8 11 10 11 L20 11 L20 33 Q14 31 10 32 Q8 32 8 30 Z" fill="white" />
      {/* Right page */}
      <path d="M34 13 Q34 11 32 11 L22 11 L22 33 Q28 31 32 32 Q34 32 34 30 Z" fill="white" />
      {/* Spine */}
      <line x1="21" y1="11" x2="21" y2="33" stroke="#087f5b" strokeWidth="2" />
      {/* Left page — record lines */}
      <line x1="11" y1="16" x2="18" y2="16" stroke="#087f5b" strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />
      <line x1="11" y1="20" x2="18" y2="20" stroke="#087f5b" strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />
      <line x1="11" y1="24" x2="18" y2="24" stroke="#087f5b" strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />
      <line x1="11" y1="28" x2="15" y2="28" stroke="#087f5b" strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />
      {/* Right page — bar chart (sales trend) */}
      <rect x="24" y="25" width="3" height="5" rx="1" fill="#087f5b" opacity="0.45" />
      <rect x="28" y="21" width="3" height="9" rx="1" fill="#087f5b" opacity="0.45" />
      <rect x="24" y="16" width="7" height="1.3" rx="0.65" fill="#087f5b" opacity="0.3" />
    </svg>
  )
}
