// Розбір прайсу: всі листи, заголовки, кількість рядків
import xlsx from "xlsx";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const wb = xlsx.readFile(path.join(__dirname, "_price.xlsx"));

console.log(`Листів у прайсі: ${wb.SheetNames.length}`);
for (const sn of wb.SheetNames) {
  const ws = wb.Sheets[sn];
  const data = xlsx.utils.sheet_to_json(ws, { header: 1, raw: false, blankrows: false });
  console.log(`\n=== Лист "${sn}" — ${data.length} рядків ===`);
  // Виведу перші 6 рядків (з заголовками)
  for (let i = 0; i < Math.min(6, data.length); i++) {
    const row = data[i] || [];
    const cells = row.slice(0, 12).map(c => String(c || "").slice(0, 30));
    console.log(`  [${i}] ${cells.join(" | ")}`);
  }
}
