/** Tipos de vista (UI) — Drizzle no infiere bien columnas `nombre` en relaciones anidadas. */

export type ClienteDetail = {
  id: string;
  razonSocial: string;
  cuit: string;
  codigoErp: string | null;
  condicionPago: string;
  vendedor: { nombreCompleto: string } | null;
  rubro: { id: string; nombre: string } | null;
  estadoCuenta: { nombre: string } | null;
  tamanoCliente: { nombre: string } | null;
  contactos: Array<{
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    rol: { nombre: string } | null;
  }>;
  sucursales: Array<{
    id: string;
    nombreZona: string;
    direccion: string | null;
    localidad: string | null;
  }>;
  interacciones: Array<{
    id: string;
    fecha: unknown;
    comentario: string;
    canal: { nombre: string } | null;
    resultado: { nombre: string } | null;
  }>;
};

export type UltimaInteraccion = {
  id: string;
  fecha: unknown;
  empresaRaw: string | null;
  clienteId: string | null;
  cliente: { razonSocial: string } | null;
  vendedor: { nombreCompleto: string } | null;
  canal: { nombre: string } | null;
  resultado: { nombre: string } | null;
};
