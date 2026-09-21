import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Participante } from "./acuerdo";

/**
 * Relay de firmas (docs/ARCHITECTURE.md §4). Dos tablas, sin política de
 * `select`: los borradores se leen por función (`get_draft`), nunca se
 * listan. Aquí solo hace falta insertar — la lectura llega en D5.
 */
export type BorradorPayload = {
  proyecto: string;
  fecha: string;
  participantes: Pick<Participante, "nombre" | "rol" | "direccion" | "bps">[];
  terminosHash: `0x${string}`;
  salt: `0x${string}`;
};

let cliente: SupabaseClient | null = null;

function obtenerCliente(): SupabaseClient {
  if (cliente) return cliente;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase sin configurar: faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en web/.env.local",
    );
  }

  cliente = createClient(url, anonKey);
  return cliente;
}

/** Guarda el borrador y devuelve su id (uuid), que es el `[id]` del link a compartir. */
export async function guardarBorrador(
  agreement: BorradorPayload,
  terminosTexto: string,
  creadoPor: `0x${string}`,
): Promise<string> {
  const { data, error } = await obtenerCliente()
    .from("drafts")
    .insert({
      agreement_json: agreement,
      terms_text: terminosTexto,
      created_by: creadoPor.toLowerCase(),
    })
    .select("id")
    .single();

  if (error) throw new Error(`No se pudo guardar el borrador: ${error.message}`);
  return data.id as string;
}
