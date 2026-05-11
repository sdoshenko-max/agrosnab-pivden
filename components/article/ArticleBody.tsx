// Диспетчер: проходить масивом блоків і малює потрібний компонент.
// TOC генерується автоматично з усіх блоків h2.

import type { ArticleBlock } from "@/lib/articleBlocks";
import {
  Lead,
  TOC,
  H2,
  H3,
  Paragraph,
  Quote,
  Callout,
  ProductCard,
  ProductGrid,
  PriceTable,
  WarningGrid,
  CTABlock,
  RelatedArticles,
  Divider,
  type Lang,
} from "./blocks";

export function ArticleBody({ blocks, lang = "uk" }: { blocks: ArticleBlock[]; lang?: Lang }) {
  // Збираємо TOC з h2-заголовків (один прохід)
  const tocItems = blocks
    .filter((b): b is Extract<ArticleBlock, { type: "h2" }> => b.type === "h2")
    .map((b) => ({ id: b.id, text: b.text }));

  let h2Counter = 0;

  return (
    <div className="article-body">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "lead":
            return <Lead key={i} text={block.text} />;
          case "toc":
            return <TOC key={i} items={tocItems} lang={lang} />;
          case "h2":
            h2Counter += 1;
            return (
              <H2 key={i} id={block.id} text={block.text} num={h2Counter} />
            );
          case "h3":
            return <H3 key={i} text={block.text} />;
          case "p":
            return <Paragraph key={i} text={block.text} />;
          case "quote":
            return <Quote key={i} text={block.text} />;
          case "callout":
            return (
              <Callout
                key={i}
                variant={block.variant}
                title={block.title}
                icon={block.icon}
                items={block.items}
                rows={block.rows}
                text={block.text}
              />
            );
          case "productCard":
            return (
              <ProductCard
                key={i}
                productSlug={block.productSlug}
                badge={block.badge}
                badgeColor={block.badgeColor}
                rateNote={block.rateNote}
                budgetNote={block.budgetNote}
                analog={block.analog}
                note={block.note}
                lang={lang}
              />
            );
          case "productGrid":
            return <ProductGrid key={i} cards={block.cards} lang={lang} />;
          case "priceTable":
            return (
              <PriceTable
                key={i}
                caption={block.caption}
                headers={block.headers}
                rows={block.rows}
              />
            );
          case "warningGrid":
            return <WarningGrid key={i} items={block.items} />;
          case "ctaBlock":
            return (
              <CTABlock
                key={i}
                title={block.title}
                buttons={block.buttons}
                links={block.links}
              />
            );
          case "relatedArticles":
            return <RelatedArticles key={i} items={block.items} lang={lang} />;
          case "divider":
            return <Divider key={i} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
