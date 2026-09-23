"use client";

import { useMemo, useState } from "react";
import { usePrivy, useConnectOrCreateWallet } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { isAddress, toHex } from "viem";
import { BarraSegmentada } from "@/components/BarraSegmentada";
import { ProveedorTema } from "@/components/InterruptorTema";
import { NavBar } from "@/components/NavBar";
import { TablaReparto } from "@/components/TablaReparto";
import { calcularHashTerminos, sumaBps, type Participante } from "@/lib/acuerdo";
import { PRIVY_APP_ID } from "@/lib/privy";
import { guardarBorrador } from "@/lib/supabase";

type FilaParticipante = {
  clave: string;
  nombre: string;
  rol: string;
  direccion: string;
  bps: string;
};

function filaVacia(): FilaParticipante {
  return { clave: crypto.randomUUID(), nombre: "", rol: "", direccion: "", bps: "" };
}

function generarSalt(): `0x${string}` {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}

/** Cada fila validada, o null si la fila todavía no es un participante completo. */
function aParticipante(fila: FilaParticipante): Participante | null {
  const bps = Number(fila.bps);
  // strict: false — no exigir mayúsculas de checksum EIP-55. Quien copia una
  // dirección de un explorador o de otra wallet no siempre la trae así, y
  // Solidity compara bytes, no casing.
  if (
    !fila.nombre.trim() ||
    !isAddress(fila.direccion, { strict: false }) ||
    !Number.isInteger(bps) ||
    bps <= 0
  ) {
    return null;
  }
  return {
    nombre: fila.nombre.trim(),
    rol: fila.rol.trim(),
    direccion: fila.direccion.toLowerCase() as `0x${string}`,
    bps,
    firma: "pendiente",
  };
}

/**
 * Sin `NEXT_PUBLIC_PRIVY_APP_ID` no hay `PrivyProvider` (ver
 * `web/src/lib/providers.tsx`), y los hooks de abajo revientan sin ese
 * contexto. Se corta acá, antes de que se monte nada que los llame, en vez
 * de fingir que el formulario funciona.
 */
export default function NuevoAcuerdo() {
  if (!PRIVY_APP_ID) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="font-serif text-2xl leading-tight sm:text-3xl">Nuevo acuerdo</h1>
        <p className="mono mt-6 border border-caution px-4 py-3 text-xs text-caution">
          Falta NEXT_PUBLIC_PRIVY_APP_ID en web/.env.local. Sin Privy no hay identidad ni wallet, así
          que este formulario no puede armar un acuerdo.
        </p>
      </main>
    );
  }

  return <Formulario />;
}

function Formulario() {
  const { ready, authenticated, logout } = usePrivy();
  const { connectOrCreateWallet } = useConnectOrCreateWallet();
  const { address } = useAccount();

  const [proyecto, setProyecto] = useState("");
  const [terminos, setTerminos] = useState("");
  const [filas, setFilas] = useState<FilaParticipante[]>([filaVacia(), filaVacia()]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);

  const participantes = useMemo(() => filas.map(aParticipante), [filas]);
  const participantesValidos = participantes.every((p) => p !== null);
  const listaCompleta = participantes.filter((p): p is Participante => p !== null);
  const total = sumaBps(listaCompleta);
  const direccionesRepetidas = new Set(listaCompleta.map((p) => p.direccion.toLowerCase())).size !==
    listaCompleta.length;

  const listoParaGuardar =
    ready &&
    authenticated &&
    !!address &&
    proyecto.trim().length > 0 &&
    terminos.trim().length > 0 &&
    filas.length >= 2 &&
    participantesValidos &&
    total === 10000 &&
    !direccionesRepetidas;

  function actualizarFila(clave: string, cambios: Partial<FilaParticipante>) {
    setFilas((actuales) => actuales.map((f) => (f.clave === clave ? { ...f, ...cambios } : f)));
  }

  function agregarFila() {
    setFilas((actuales) => [...actuales, filaVacia()]);
  }

  function quitarFila(clave: string) {
    setFilas((actuales) => (actuales.length > 2 ? actuales.filter((f) => f.clave !== clave) : actuales));
  }

  async function guardar() {
    if (!listoParaGuardar || !address) return;
    setGuardando(true);
    setError(null);
    try {
      const fecha = new Date().toLocaleDateString("es-CO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const id = await guardarBorrador(
        {
          proyecto: proyecto.trim(),
          fecha,
          participantes: listaCompleta.map(({ nombre, rol, direccion, bps }) => ({
            nombre,
            rol,
            direccion,
            bps,
          })),
          terminosHash: calcularHashTerminos(terminos.trim()),
          salt: generarSalt(),
        },
        terminos.trim(),
        address,
      );
      setLink(`${window.location.origin}/acuerdo/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el borrador");
    } finally {
      setGuardando(false);
    }
  }

  if (link) {
    return (
      <ProveedorTema>
        <NavBar />
        <main className="mx-auto w-full max-w-3xl px-6 py-16">
          <h1 className="mb-12 font-serif text-2xl leading-tight sm:text-3xl">Borrador guardado</h1>
          <p className="mt-4 max-w-prose text-sm">
            Compartí este link con los demás participantes para que lo revisen y firmen.
          </p>
          <p className="mono mt-6 border border-ink px-3 py-2 text-sm break-all">{link}</p>
          <button
            type="button"
            className="mono mt-4 border border-ink px-6 py-3 text-xs uppercase tracking-wide"
            onClick={() => navigator.clipboard.writeText(link)}
          >
            Copiar link
          </button>
        </main>
      </ProveedorTema>
    );
  }

  return (
    <ProveedorTema>
      <NavBar />
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="mb-12 font-serif text-2xl leading-tight sm:text-3xl">Nuevo acuerdo</h1>
        <p className="mt-4 max-w-prose text-sm">
          Definí el proyecto, los participantes y cómo se reparte. Una vez que todos firmen, el pool de
          cobro se despliega solo.
        </p>

        <section className="mt-12 border-t border-rule pt-8">
          <p className="mono text-xs uppercase tracking-wide text-ink-60">Identidad</p>
          {!ready ? (
            <p className="mt-3 text-sm text-ink-60">Cargando…</p>
          ) : authenticated && address ? (
            <div className="mt-3 flex items-center justify-between">
              <span className="mono text-sm">{address}</span>
              <button type="button" className="mono text-xs uppercase tracking-wide underline underline-offset-4" onClick={logout}>
                Salir
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="mono mt-3 border border-ink px-6 py-3 text-xs uppercase tracking-wide"
              onClick={connectOrCreateWallet}
            >
              Entrar con correo o wallet
            </button>
          )}
          <p className="mt-2 text-xs text-ink-60">
            Quien guarda el borrador queda registrado como su creador. Firmar el acuerdo es un paso aparte.
          </p>
        </section>

        <section className="mt-12 border-t border-rule pt-8">
          <label className="mono block text-xs uppercase tracking-wide text-ink-60" htmlFor="proyecto">
            Proyecto
          </label>
          <input
            id="proyecto"
            className="mt-2 w-full border border-rule bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
            value={proyecto}
            onChange={(e) => setProyecto(e.target.value)}
            placeholder="Campaña Tropicana — video + identidad"
          />
        </section>

        <section className="mt-12 border-t border-rule pt-8">
          <div className="flex items-baseline justify-between">
            <p className="mono text-xs uppercase tracking-wide text-ink-60">Participantes</p>
            <span className={`mono text-xs ${total === 10000 ? "text-ink" : "text-stamp"}`}>
              {(total / 100).toFixed(2)}% de 100.00%
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {filas.map((fila) => (
              <div key={fila.clave} className="border border-rule p-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_2fr_3fr_1fr]">
                  <input
                    className="border border-rule bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
                    placeholder="Nombre"
                    value={fila.nombre}
                    onChange={(e) => actualizarFila(fila.clave, { nombre: e.target.value })}
                  />
                  <input
                    className="border border-rule bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
                    placeholder="Rol"
                    value={fila.rol}
                    onChange={(e) => actualizarFila(fila.clave, { rol: e.target.value })}
                  />
                  <input
                    className="mono border border-rule bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
                    placeholder="0x…"
                    value={fila.direccion}
                    onChange={(e) => actualizarFila(fila.clave, { direccion: e.target.value })}
                  />
                  <input
                    className="mono border border-rule bg-transparent px-3 py-2 text-right text-sm outline-none focus:border-ink"
                    placeholder="bps"
                    inputMode="numeric"
                    value={fila.bps}
                    onChange={(e) => actualizarFila(fila.clave, { bps: e.target.value })}
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs text-ink-60">
                  {address ? (
                    <button
                      type="button"
                      className="underline underline-offset-4"
                      onClick={() => actualizarFila(fila.clave, { direccion: address })}
                    >
                      Usar mi dirección
                    </button>
                  ) : (
                    <span />
                  )}
                  {filas.length > 2 ? (
                    <button
                      type="button"
                      className="underline underline-offset-4"
                      onClick={() => quitarFila(fila.clave)}
                    >
                      Quitar
                    </button>
                  ) : (
                    <span />
                  )}
                </div>
              </div>
            ))}
          </div>

          {direccionesRepetidas ? (
            <p className="mono mt-3 text-xs uppercase tracking-wide text-stamp">
              Hay direcciones repetidas
            </p>
          ) : null}

          <button
            type="button"
            className="mono mt-4 border border-rule px-6 py-3 text-xs uppercase tracking-wide"
            onClick={agregarFila}
          >
            Agregar participante
          </button>
        </section>

        <section className="mt-12 border-t border-rule pt-8">
          <label className="mono block text-xs uppercase tracking-wide text-ink-60" htmlFor="terminos">
            Términos
          </label>
          <textarea
            id="terminos"
            className="mt-2 h-32 w-full border border-rule bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
            value={terminos}
            onChange={(e) => setTerminos(e.target.value)}
            placeholder="El pago del cliente se reparte entre los participantes en las proporciones de esta tabla…"
          />
          <p className="mt-2 text-xs text-ink-60">
            Solo se guarda el hash de este texto en el acuerdo. El texto completo queda en el relay para
            que cualquiera pueda releerlo antes de firmar.
          </p>
        </section>

        {listaCompleta.length > 0 ? (
          <section className="mt-12 border-t border-rule pt-8">
            <p className="mono mb-6 text-xs uppercase tracking-wide text-ink-60">Vista previa</p>
            <BarraSegmentada participantes={listaCompleta} />
            <div className="mt-8">
              <TablaReparto participantes={listaCompleta} />
            </div>
          </section>
        ) : null}

        <section className="mt-12 border-t border-ink pt-8">
          {error ? (
            <p className="mono mb-4 border border-caution px-4 py-3 text-xs text-caution">{error}</p>
          ) : null}
          <button
            type="button"
            className="mono border border-ink bg-ink px-6 py-3 text-xs uppercase tracking-wide text-doc disabled:cursor-not-allowed disabled:border-rule disabled:bg-transparent disabled:text-ink-60"
            disabled={!listoParaGuardar || guardando}
            onClick={guardar}
          >
            {guardando ? "Guardando…" : "Guardar borrador"}
          </button>
        </section>
      </main>
    </ProveedorTema>
  );
}
