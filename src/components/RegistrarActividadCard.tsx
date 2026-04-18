import { crearInteraccionFromForm } from "@/actions/interaccion-actions";

type Opt = { id: string; nombre: string };

export function RegistrarActividadCard({
  clienteId,
  contactoId,
  canales,
  resultados,
  write,
}: {
  clienteId: string;
  contactoId?: string;
  canales: Opt[];
  resultados: Opt[];
  write: boolean;
}) {
  const today = new Date().toISOString().slice(0, 10);

  if (!write) {
    return (
      <div className="alert alert-light border mb-0 small text-muted-2">
        Solo lectura: no podés registrar actividades con este usuario.
      </div>
    );
  }

  return (
    <form action={crearInteraccionFromForm} className="row g-2">
      <input type="hidden" name="cliente_id" value={clienteId} />
      {contactoId ? <input type="hidden" name="contacto_id" value={contactoId} /> : null}
      <div className="col-md-3 col-6">
        <label className="form-label small text-muted-2 mb-1">Fecha</label>
        <input type="date" name="fecha" className="form-control form-control-sm" required defaultValue={today} />
      </div>
      <div className="col-md-4 col-6">
        <label className="form-label small text-muted-2 mb-1">Canal</label>
        <select name="canal_id" className="form-select form-select-sm" required defaultValue="">
          <option value="" disabled>
            Elegir…
          </option>
          {canales.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>
      <div className="col-md-5 col-12">
        <label className="form-label small text-muted-2 mb-1">Resultado</label>
        <select name="resultado_id" className="form-select form-select-sm" required defaultValue="">
          <option value="" disabled>
            Elegir…
          </option>
          {resultados.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>
      <div className="col-12">
        <label className="form-label small text-muted-2 mb-1">Próximo paso</label>
        <input name="proximo_paso" className="form-control form-control-sm" placeholder="Seguimiento…" />
      </div>
      <div className="col-12">
        <label className="form-label small text-muted-2 mb-1">Comentario</label>
        <textarea name="comentario" className="form-control form-control-sm" rows={2} placeholder="Notas…" />
      </div>
      <div className="col-12">
        <button type="submit" className="btn btn-primary btn-sm">
          <i className="ri-add-line me-1" />
          Registrar actividad
        </button>
      </div>
    </form>
  );
}
