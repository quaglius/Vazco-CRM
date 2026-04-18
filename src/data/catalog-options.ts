import { asc } from "drizzle-orm";
import { db } from "@/db";
import { canalContacto, resultadoContacto, rubro, rolContacto } from "@/db/schema";

export async function listRubroOptions() {
  return db.select({ id: rubro.id, nombre: rubro.nombre }).from(rubro).orderBy(asc(rubro.nombre));
}

export async function listCanalOptions() {
  return db
    .select({ id: canalContacto.id, nombre: canalContacto.nombre })
    .from(canalContacto)
    .orderBy(asc(canalContacto.nombre));
}

export async function listResultadoOptions() {
  return db
    .select({ id: resultadoContacto.id, nombre: resultadoContacto.nombre })
    .from(resultadoContacto)
    .orderBy(asc(resultadoContacto.nombre));
}

export async function listRolContactoOptions() {
  return db
    .select({ id: rolContacto.id, nombre: rolContacto.nombre })
    .from(rolContacto)
    .orderBy(asc(rolContacto.nombre));
}
