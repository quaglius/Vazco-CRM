/** Escapado minimal para CSV compatible con Google / Excel. */
export function toCsvRow(fields: (string | undefined)[]): string {
  return fields
    .map((f) => {
      const s = (f ?? "").replace(/\r?\n/g, " ");
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    })
    .join(",");
}

export const BELGRANO_HEADERS = [
  "fecha",
  "vendedor",
  "canal",
  "resultado",
  "empresa",
  "rubro",
  "direccion",
  "localidad",
  "nombre",
  "apellido",
  "sector",
  "telefono",
  "mail",
  "proximo_paso",
  "comentario",
] as const;

/** Divide una línea tipo `| a | b | c |` conservando celdas vacías entre pipes. */
export function splitMarkdownPipeRow(line: string): string[] {
  const raw = line.trim();
  if (!raw.startsWith("|")) return [];
  let cells = raw.split("|").map((p) => p.trim());
  if (cells[0] === "") cells = cells.slice(1);
  if (cells.length && cells[cells.length - 1] === "") cells = cells.slice(0, -1);
  return cells;
}

function looksLikeIndustryRubro(s: string): boolean {
  const t = s.trim();
  if (!t || t.length > 60) return false;
  if (/METAL|INGENI|CONSTRU|PLAST|CONTRAT|QUIM|ALIM|INDUS|AGRO|MAQU|LOGI|COMER|TEXTIL|OTRAS/i.test(t))
    return true;
  return /^[A-ZÁÉÍÓÚÑ\s\-]{3,35}$/i.test(t) && !/\d{3,}/.test(t);
}

/** Dirección típica: número de calle o texto muy largo con números. */
function looksLikeStreetOrMissingRubroSlot(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  if (/\d{3,}/.test(t)) return true;
  if (/^(AV\.|CALLE|CAMINO|RUTA|BV\.|PASAJE)/i.test(t)) return true;
  if (t.length > 35 && /\d/.test(t)) return true;
  return false;
}

/**
 * Deja exactamente 15 campos lógicos (fecha → comentario).
 * Repara filas sin columna RUBRO (14 celdas) o con dirección en la columna rubro.
 */
function mergeOverflowComment(parts: string[]): string {
  return parts.map((x) => x.trim()).filter(Boolean).join(" | ");
}

export function normalizeBelgranoCells(cells: string[]): string[] {
  let c = [...cells];

  if (c.length > 15) {
    c = [...c.slice(0, 14), mergeOverflowComment(c.slice(14))];
  }

  if (c.length === 14) {
    c = [...c.slice(0, 5), "Sin clasificar", ...c.slice(5)];
  }

  while (c.length < 15) c.push("");

  const rubro = c[5]?.trim() ?? "";
  if (
    rubro &&
    !looksLikeIndustryRubro(rubro) &&
    looksLikeStreetOrMissingRubroSlot(rubro)
  ) {
    c = [...c.slice(0, 5), "Sin clasificar", ...c.slice(5)];
    if (c.length > 15) {
      c = [...c.slice(0, 14), mergeOverflowComment(c.slice(14))];
    }
    while (c.length < 15) c.push("");
  }

  return BELGRANO_HEADERS.map((_, i) => (c[i] ?? "").trim());
}

/**
 * Fila de tabla markdown: primera celda = nº de fila; siguientes 15 = datos Belgrano.
 */
export function parseBelgranoTableLine(line: string): string[] | null {
  const t = line.trim();
  if (!t.startsWith("|") || /^\|[\s\-]*---/.test(t)) return null;

  const parts = splitMarkdownPipeRow(t);
  if (parts.length < 6) return null;

  const rowNum = parts[0]?.replace(/\s/g, "") ?? "";
  if (!/^\d+$/.test(rowNum)) return null;

  if (parts[1] === "FECHA" || parts[0] === "FECHA") return null;

  const rest = parts.slice(1);
  if (rest[0] === "FECHA") return null;

  return normalizeBelgranoCells(rest);
}
