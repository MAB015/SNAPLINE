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

/** Fila de `drafts`, tal como la devuelve `get_draft` (D5, docs/ARCHITECTURE.md §4). */
export type BorradorRegistro = {
  id: string;
  agreement_json: BorradorPayload;
  terms_text: string;
  created_by: `0x${string}`;
  created_at: string;
};

/** Fila de `signatures`, tal como la devuelve `get_signatures`. La firma
 *  todavia no esta verificada en este punto: eso lo hace quien la consume
 *  (`web/src/lib/firma.ts`), recuperando el firmante y comparandolo con el
 *  `signer` declarado (no hay unicidad ni update/delete en el relay, asi que
 *  puede haber filas basura o repetidas — ver la migracion). */
export type FirmaRegistro = {
  id: string;
  draft_id: string;
  signer: `0x${string}`;
  signature: `0x${string}`;
  signed_at: string;
};

/** Lee un borrador por id via `get_draft` (no hay `select` directo sobre
 *  `drafts`). `null` si no existe. */
export async function obtenerBorrador(id: string): Promise<BorradorRegistro | null> {
  const { data, error } = await obtenerCliente().rpc("get_draft", { p_id: id });
  if (error) throw new Error(`No se pudo leer el borrador: ${error.message}`);
  const fila = Array.isArray(data) ? data[0] : data;
  return (fila as BorradorRegistro | undefined) ?? null;
}

/** Lee todas las firmas de un borrador via `get_signatures`, en el orden en
 *  que se insertaron. Puede traer mas de una fila por firmante: quien la usa
 *  decide cual verifica. */
export async function obtenerFirmas(draftId: string): Promise<FirmaRegistro[]> {
  const { data, error } = await obtenerCliente().rpc("get_signatures", { p_draft_id: draftId });
  if (error) throw new Error(`No se pudieron leer las firmas: ${error.message}`);
  return (data as FirmaRegistro[]) ?? [];
}

/** Inserta una firma en el relay. `insert` esta permitido para `anon`
 *  (`signatures_insert_publico`); no hay verificacion en el relay, solo en
 *  cadena — ver `web/src/lib/firma.ts`. */
export async function guardarFirma(
  draftId: string,
  signer: `0x${string}`,
  signature: `0x${string}`,
): Promise<void> {
  const { error } = await obtenerCliente()
    .from("signatures")
    .insert({
      draft_id: draftId,
      signer: signer.toLowerCase(),
      signature: signature.toLowerCase(),
    });

  if (error) throw new Error(`No se pudo guardar la firma: ${error.message}`);
}
