/**
 * Lee seed/data/belgrano_sheet.md (export desde Google Sheets / Markdown) y genera
 * seed/data/belgrano_actividades.csv para import posterior.
 */
import fs from "node:fs";
import path from "node:path";
import { BELGRANO_HEADERS, parseBelgranoTableLine, toCsvRow } from "./lib/belgrano-csv";

const ROOT = process.cwd();
const INPUT = path.join(ROOT, "seed", "data", "belgrano_sheet.md");
const OUTPUT = path.join(ROOT, "seed", "data", "belgrano_actividades.csv");

function main() {
  if (!fs.existsSync(INPUT)) {
    console.error(`No existe ${INPUT}. Colocá el export Markdown allí o actualizá la ruta.`);
    process.exit(1);
  }

  const text = fs.readFileSync(INPUT, "utf8");
  const lines = text.split(/\r?\n/);

  const rows: string[][] = [];
  for (const line of lines) {
    const parsed = parseBelgranoTableLine(line);
    if (parsed && parsed.some((x) => x.length > 0)) rows.push(parsed);
  }

  const header = BELGRANO_HEADERS.join(",");
  const body = rows.map((r) => toCsvRow(r)).join("\n");
  fs.writeFileSync(OUTPUT, `${header}\n${body}\n`, "utf8");

  console.log(`Parse OK: ${rows.length} filas → ${OUTPUT}`);
}

main();
