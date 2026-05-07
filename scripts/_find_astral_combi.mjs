import xlsx from "xlsx";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pricePath = path.resolve(__dirname, "_price.xlsx");
const wb = xlsx.readFile(pricePath);

console.log("Sheets:", wb.SheetNames.join(", "));
console.log();

for (const sn of wb.SheetNames) {
  const ws = wb.Sheets[sn];
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: "" });
  const matches = [];
  rows.forEach((row, idx) => {
    const txt = row.join(" ").toLowerCase();
    if (/астрал/i.test(txt)) {
      matches.push({ idx: idx + 1, row });
    }
  });
  if (matches.length) {
    console.log(`=== Sheet "${sn}" — ${matches.length} рядків з "Астрал" ===`);
    // Header
    const header = rows[0] || rows[1] || [];
    console.log("Header (рядок 1-2):");
    for (let i = 0; i < Math.min(2, rows.length); i++) {
      console.log(`  R${i+1}:`, rows[i].slice(0, 12).map(v => String(v).slice(0, 30)).join(" | "));
    }
    console.log();
    matches.forEach(m => {
      console.log(`R${m.idx}:`, m.row.slice(0, 12).map(v => String(v).slice(0, 60)).join(" | "));
    });
    console.log();
  }
}
