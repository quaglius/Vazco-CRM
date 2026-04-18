export const MAESTRO_SLUGS = [
  "rubro",
  "tamano-cliente",
  "estado-cuenta",
  "potencial-crecimiento",
  "calidad-negocio",
  "nivel-control",
  "categoria-cuenta",
  "tipo-vendedor",
  "canal-contacto",
  "resultado-contacto",
  "rol-contacto",
] as const;

export type MaestroSlug = (typeof MAESTRO_SLUGS)[number];

export const MAESTRO_LABEL: Record<MaestroSlug, string> = {
  rubro: "Rubro",
  "tamano-cliente": "Tamaño cliente",
  "estado-cuenta": "Estado cuenta",
  "potencial-crecimiento": "Potencial crecimiento",
  "calidad-negocio": "Calidad negocio",
  "nivel-control": "Nivel control",
  "categoria-cuenta": "Categoría cuenta",
  "tipo-vendedor": "Tipo vendedor",
  "canal-contacto": "Canal contacto",
  "resultado-contacto": "Resultado contacto",
  "rol-contacto": "Rol contacto",
};

export function isMaestroSlug(s: string): s is MaestroSlug {
  return (MAESTRO_SLUGS as readonly string[]).includes(s);
}
