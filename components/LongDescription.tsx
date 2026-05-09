"use client";

// Рендерить розгорнутий маркетинговий опис із lib/_descriptions/originals.ts.
// Формат тексту: інтро-абзац + блоки, кожен починається з emoji-маркера
// (🔬 🧪 ⚙️ 🎯 📋 ⏱ ✅ 🧴 ⚠️ 📦 🚚 📌). Усередині блоку рядки з "• " — список.

const SECTION_EMOJI = ["🔬", "🧪", "⚙️", "🎯", "📋", "⏱", "✅", "🧴", "⚠️", "📦", "🚚", "📌"];

type BodyItem = { type: "p" | "li"; text: string };
type Block =
  | { kind: "intro"; text: string }
  | { kind: "warning"; text: string }
  | { kind: "section"; emoji: string; title: string; body: BodyItem[] };

function parseDescription(text: string): Block[] {
  const blocks: Block[] = [];
  const paragraphs = text.trim().split(/\n\s*\n+/);

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("⚠ ВНИМАНИЕ") || trimmed.startsWith("⚠ УВАГА")) {
      blocks.push({ kind: "warning", text: trimmed });
      continue;
    }

    const firstLine = trimmed.split("\n")[0];
    const emoji = SECTION_EMOJI.find((e) => firstLine.startsWith(e));

    if (!emoji) {
      blocks.push({ kind: "intro", text: trimmed });
      continue;
    }

    const lines = trimmed.split("\n");
    const title = lines[0].replace(emoji, "").trim();
    const body: BodyItem[] = [];
    let buffer = "";
    const flush = () => {
      if (buffer.trim()) body.push({ type: "p", text: buffer.trim() });
      buffer = "";
    };
    for (const raw of lines.slice(1)) {
      const ln = raw.trim();
      if (!ln) {
        flush();
        continue;
      }
      if (ln.startsWith("•")) {
        flush();
        body.push({ type: "li", text: ln.replace(/^•\s*/, "") });
      } else {
        buffer += (buffer ? " " : "") + ln;
      }
    }
    flush();
    blocks.push({ kind: "section", emoji, title, body });
  }

  return blocks;
}

export function LongDescription({ text }: { text: string }) {
  const blocks = parseDescription(text);
  return (
    <div className="max-w-3xl space-y-6">
      {blocks.map((block, i) => {
        if (block.kind === "intro") {
          return (
            <p key={i} className="text-ink leading-relaxed text-base">
              {block.text}
            </p>
          );
        }
        if (block.kind === "warning") {
          return (
            <div key={i} className="bg-amber-50 border-l-4 border-amber-500 px-4 py-3 rounded">
              <p className="text-amber-900 font-medium whitespace-pre-line">{block.text}</p>
            </div>
          );
        }
        return (
          <div key={i}>
            <h3 className="font-bold text-base mb-2 flex items-center gap-2 text-ink">
              <span className="text-xl leading-none">{block.emoji}</span>
              <span>{block.title}</span>
            </h3>
            <div className="space-y-1.5 pl-1">
              {block.body.map((b, j) =>
                b.type === "li" ? (
                  <div key={j} className="flex gap-2 text-ink">
                    <span className="text-brand select-none">•</span>
                    <span className="leading-relaxed">{b.text}</span>
                  </div>
                ) : (
                  <p key={j} className="text-ink leading-relaxed">
                    {b.text}
                  </p>
                ),
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
