import { bindClerkUserToVendedor, updateClerkUserRole } from "@/actions/user-actions";
import { listVendedoresOptions } from "@/data/vendedores";
import { requireAdminPage } from "@/lib/auth";
import { isAuthEnabled } from "@/lib/auth-config";
import { clerkClient } from "@clerk/nextjs/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

function roleLabel(r: string | undefined): string {
  if (r === "admin" || r === "vendedor" || r === "viewer") return r;
  return "admin";
}

export default async function UsuariosPage() {
  await requireAdminPage();

  if (!isAuthEnabled()) {
    return (
      <div>
        <div className="crm-page-header">
          <div>
            <nav aria-label="breadcrumb" className="breadcrumb mb-1">
              <span className="breadcrumb-item">
                <Link href="/">Inicio</Link>
              </span>
              <span className="breadcrumb-item active">Usuarios</span>
            </nav>
            <h1 className="crm-title">Usuarios</h1>
          </div>
        </div>
        <div className="alert alert-warning border-0 shadow-sm">
          <strong>Clerk no está activo.</strong> Configurá{" "}
          <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> y <code>CLERK_SECRET_KEY</code>, y quitá{" "}
          <code>NEXT_PUBLIC_SKIP_CLERK=true</code> para administrar usuarios desde Clerk.
        </div>
      </div>
    );
  }

  const client = await clerkClient();
  const res = await client.users.getUserList({ limit: 100 });
  const users = res.data ?? [];

  const vendedores = await listVendedoresOptions();
  const vendedorByClerkId = new Map(vendedores.filter((v) => v.clerkUserId).map((v) => [v.clerkUserId!, v]));

  return (
    <div>
      <div className="crm-page-header">
        <div>
          <nav aria-label="breadcrumb" className="breadcrumb mb-1">
            <span className="breadcrumb-item">
              <Link href="/">Inicio</Link>
            </span>
            <span className="breadcrumb-item active">Usuarios</span>
          </nav>
          <h1 className="crm-title">Usuarios</h1>
          <p className="text-muted-2 small mb-0">
            Identidad desde Clerk; el perfil comercial se vincula a la tabla <code>vendedor</code>.
            Modo abierto: todos los usuarios autenticados tienen permisos de administrador
            (definí <code>RBAC_STRICT=true</code> para reactivar control granular).
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Listado</span>
          <span className="text-muted-2 small">{users.length} usuarios</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table mb-0">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Perfil comercial</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const email = u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId)?.emailAddress
                    ?? u.emailAddresses[0]?.emailAddress
                    ?? "—";
                  const name =
                    [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
                    email;
                  const metaRole = roleLabel(u.publicMetadata?.role as string | undefined);
                  const linked = vendedorByClerkId.get(u.id);

                  return (
                    <tr key={u.id}>
                      <td className="fw-semibold">{name}</td>
                      <td className="small text-muted-2">{email}</td>
                      <td>
                        <form action={updateClerkUserRole} className="d-flex gap-2 align-items-center flex-wrap">
                          <input type="hidden" name="user_id" value={u.id} />
                          <select name="role" className="form-select form-select-sm" defaultValue={metaRole} style={{ width: "auto", minWidth: 120 }}>
                            <option value="admin">admin</option>
                            <option value="vendedor">vendedor</option>
                            <option value="viewer">viewer</option>
                          </select>
                          <button type="submit" className="btn btn-sm btn-outline-primary">
                            Guardar
                          </button>
                        </form>
                      </td>
                      <td>
                        <form action={bindClerkUserToVendedor} className="d-flex gap-2 align-items-center flex-wrap">
                          <input type="hidden" name="clerk_user_id" value={u.id} />
                          <select
                            name="vendedor_id"
                            className="form-select form-select-sm"
                            defaultValue={linked?.id ?? "__none__"}
                            style={{ minWidth: 200 }}
                          >
                            <option value="__none__">Sin perfil</option>
                            {vendedores.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.codigo} — {v.nombreCompleto}
                                {v.clerkUserId && v.clerkUserId !== u.id ? " (ocupado)" : ""}
                              </option>
                            ))}
                          </select>
                          <button type="submit" className="btn btn-sm btn-success">
                            Vincular
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
