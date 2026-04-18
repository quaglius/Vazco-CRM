import { redirect } from "next/navigation";

/** Los perfiles comerciales se gestionan desde Maestros → tipo vendedor y desde Usuarios (vínculo Clerk). */
export default function VendedoresRedirectPage() {
  redirect("/usuarios");
}
