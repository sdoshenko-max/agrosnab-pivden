import type { Product } from "@/lib/types";

const TIER_COLORS: Record<string, { bg: string; canister: string; cap: string; label: string; text: string }> = {
  econom:   { bg: "#dcfce7", canister: "#16a34a", cap: "#15803d", label: "#bbf7d0", text: "#fff" },
  premium:  { bg: "#dbeafe", canister: "#2563eb", cap: "#1d4ed8", label: "#bfdbfe", text: "#fff" },
  original: { bg: "#fed7aa", canister: "#ea580c", cap: "#c2410c", label: "#fdba74", text: "#fff" },
};

const GROUP_EMOJI: Record<string, string> = {
  herbitsydy: "💧", funhitsydy: "🍄", insektitsydy: "🐛",
  protruyniky: "🌱", desykanty: "🍂", regulyatory: "📏", dobryva: "🧪",
};

function shortLabel(name: string): string {
  // Беремо 1-2 перші букви від найдовшого слова
  const words = name.replace(/[,\.]/g, "").split(/\s+/).filter(w => w.length > 1);
  const w = words.sort((a, b) => b.length - a.length)[0] || name;
  return w.slice(0, 2).toUpperCase();
}

export function ProductPlaceholder({ product, size = "md" }: { product: Product; size?: "sm" | "md" | "lg" }) {
  const c = TIER_COLORS[product.tier] || TIER_COLORS.econom;
  const emoji = GROUP_EMOJI[product.groupSlug] || "🧴";
  const label = shortLabel(product.name);
  const dims = size === "lg" ? { w: 400, h: 400 } : size === "sm" ? { w: 120, h: 120 } : { w: 240, h: 240 };

  return (
    <svg viewBox="0 0 240 240" width={dims.w} height={dims.h} className="max-w-full max-h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="240" rx="20" fill={c.bg}/>
      {/* Каністра */}
      <g transform="translate(60, 40)">
        {/* Тень */}
        <ellipse cx="60" cy="170" rx="55" ry="6" fill="#000" opacity="0.12"/>
        {/* Корпус */}
        <rect x="10" y="40" width="100" height="125" rx="10" fill={c.canister}/>
        {/* Підсвітка */}
        <rect x="20" y="50" width="20" height="105" rx="5" fill="#fff" opacity="0.18"/>
        {/* Шийка */}
        <rect x="40" y="20" width="40" height="22" rx="3" fill={c.cap}/>
        {/* Кришка */}
        <rect x="36" y="10" width="48" height="14" rx="3" fill={c.cap}/>
        <rect x="36" y="10" width="48" height="5" rx="2" fill="#fff" opacity="0.25"/>
        {/* Ручка */}
        <path d="M65 22 L88 22 L88 18 Q88 8 80 8 L73 8 Q65 8 65 18 Z" fill="none" stroke={c.cap} strokeWidth="3"/>
        {/* Етикетка */}
        <rect x="18" y="70" width="84" height="60" rx="3" fill="#fff" opacity="0.95"/>
        <rect x="18" y="70" width="84" height="14" rx="3" fill={c.canister}/>
        <text x="60" y="105" fontFamily="Inter, Arial, sans-serif" fontSize="22" fontWeight="900" fill={c.canister} textAnchor="middle">{label}</text>
        <line x1="22" y1="115" x2="98" y2="115" stroke={c.canister} strokeWidth="0.6" opacity="0.4"/>
        <line x1="22" y1="121" x2="80" y2="121" stroke={c.canister} strokeWidth="0.6" opacity="0.4"/>
      </g>
      {/* Іконка групи в кутку */}
      <g transform="translate(180, 20)">
        <circle cx="18" cy="18" r="20" fill="#fff" stroke={c.canister} strokeWidth="2"/>
        <text x="18" y="25" fontSize="20" textAnchor="middle">{emoji}</text>
      </g>
    </svg>
  );
}
