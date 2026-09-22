"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePrivy, useConnectOrCreateWallet } from "@privy-io/react-auth";
import { useAccount, usePublicClient, useSignTypedData, useWriteContract } from "wagmi";
import type { Address, Hex } from "viem";
import { BarraSegmentada } from "@/components/BarraSegmentada";
import { CodigoBarras } from "@/components/CodigoBarras";
import { EstadoAcuerdo } from "@/components/EstadoFirma";
import { HashVivo } from "@/components/HashVivo";
import { InterruptorTema, ProveedorTema } from "@/components/InterruptorTema";
import { SelloTinta } from "@/components/SelloTinta";
import { TablaReparto } from "@/components/TablaReparto";
import { todasFirmadas, type Acuerdo, type Participante } from "@/lib/acuerdo";
import {
  agreementDesdeBorrador,
  buscarPoolDesplegado,
  calcularStructHash,
  dominioAcuerdo,
  FACTORY_ADDRESS,
  leerConsumido,
  recuperarFirmante,
  splitPoolFactoryAbi,
  tiposAcuerdo,
  type Agreement,
} from "@/lib/firma";
import { PRIVY_APP_ID } from "@/lib/privy";
import { conTimeout, EnvioTimeoutError, esperarCondicion, esperarRecibo, EsperaReciboTimeoutError } from "@/lib/recibo";
import {
  guardarFirma,
  obtenerBorrador,
  obtenerFirmas,
  type BorradorRegistro,
} from "@/lib/supabase";

/** Cada cuanto se vuelve a mirar el relay y la cadena mientras el pool no
 *  este desplegado. No hay realtime de Supabase en este relay (D-008): es
 *  sondeo simple, suficiente para 2-10 participantes firmando en minutos. */
const INTERVALO_SONDEO_MS = 5000;

/** Clave de `sessionStorage` para no reenviar la misma tx si la pagina se
 *  recarga a mitad de la confirmacion (D5 tarea 6). Una por `structHash`: no
 *  hay ambiguedad entre acuerdos distintos ni entre pestañas de otro dominio. */
function claveDespliegue(structHash: Hex): string {
  return `snapline:despliegue:${structHash}`;
}

type EstadoPool =
  | { tipo: "cargando" }
  | { tipo: "sin-desplegar" }
  | { tipo: "desplegando" }
  | { tipo: "desplegado"; direccion: Address }
  // `hash` es opcional: solo viene cuando el error es en realidad un timeout
  // de esperarRecibo con la tx ya enviada (ver web/src/lib/recibo.ts) — la
  // sondeo periódica de más abajo igual va a actualizar el estado solo si
  // confirma, esto es para no dejar a quien mira sin el hash mientras tanto.
  | { tipo: "error"; mensaje: string; hash?: Hex };

/**
 * Sin `NEXT_PUBLIC_PRIVY_APP_ID` no hay `PrivyProvider` (`web/src/lib/providers.tsx`)
 * y los hooks de abajo revientan sin ese contexto — mismo corte que en
 * `web/src/app/nuevo/page.tsx`.
 */
export function AcuerdoCliente({ id }: { id: string }) {
  if (!PRIVY_APP_ID) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="font-serif text-2xl leading-tight sm:text-3xl">Acuerdo</h1>
        <p className="mono mt-6 border border-caution px-4 py-3 text-xs text-caution">
          Falta NEXT_PUBLIC_PRIVY_APP_ID en web/.env.local. Sin Privy no hay identidad ni wallet,
          así que esta pantalla no puede leer ni firmar el acuerdo.
        </p>
      </main>
    );
  }

  return <Contenido id={id} />;
}

function Contenido({ id }: { id: string }) {
  const { ready, authenticated, logout } = usePrivy();
  const { connectOrCreateWallet } = useConnectOrCreateWallet();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { signTypedDataAsync } = useSignTypedData();
  const { writeContractAsync } = useWriteContract();

  const [borrador, setBorrador] = useState<BorradorRegistro | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [firmasVerificadas, setFirmasVerificadas] = useState<Map<string, Hex>>(new Map());
  const [firmando, setFirmando] = useState(false);
  const [errorFirma, setErrorFirma] = useState<string | null>(null);
  const [estadoPool, setEstadoPool] = useState<EstadoPool>({ tipo: "cargando" });

  // Evita golpear la wallet dos veces con una tx que ya esta en vuelo dentro
  // de esta misma pestaña (la fuente de verdad real es `consumed` en cadena,
  // esto solo es la capa local — ver docs/THREAT-MODEL.md y el reporte de D5).
  const desplegandoRef = useRef(false);

  const agreement: Agreement | null = useMemo(
    () => (borrador ? agreementDesdeBorrador(borrador.agreement_json) : null),
    [borrador],
  );
  const structHash = useMemo(() => (agreement ? calcularStructHash(agreement) : null), [agreement]);

  // Carga inicial del borrador por id (get_draft — no hay select directo).
  useEffect(() => {
    let cancelado = false;
    obtenerBorrador(id)
      .then((registro) => {
        if (cancelado) return;
        if (!registro) {
          setErrorCarga("No existe un borrador con este id.");
          return;
        }
        setBorrador(registro);
      })
      .catch((e) => {
        if (!cancelado) setErrorCarga(e instanceof Error ? e.message : "No se pudo cargar el acuerdo");
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [id]);

  const cargarFirmas = useCallback(async (): Promise<Map<string, Hex>> => {
    if (!borrador || !agreement) return new Map();
    const filas = await obtenerFirmas(borrador.id);
    const mapa = new Map<string, Hex>();
    for (const fila of filas) {
      const signerNormalizado = fila.signer.toLowerCase();
      if (mapa.has(signerNormalizado)) continue; // ya hay una valida de este firmante
      try {
        const firmante = await recuperarFirmante(agreement, fila.signature);
        if (firmante.toLowerCase() === signerNormalizado) {
          mapa.set(signerNormalizado, fila.signature);
        }
      } catch {
        // Fila corrupta (no es una firma ECDSA valida para este acuerdo): se
        // descarta en silencio, el relay no garantiza nada por si solo.
      }
    }
    setFirmasVerificadas(mapa);
    return mapa;
  }, [borrador, agreement]);

  /** Capa 1 (manda siempre): pregunta a la cadena, no al relay, si este
   *  acuerdo ya desplego un pool. */
  const verificarCadena = useCallback(async (): Promise<Address | null> => {
    if (!publicClient || !structHash) return null;
    const yaConsumido = await leerConsumido(publicClient, structHash);
    if (!yaConsumido) return null;
    return buscarPoolDesplegado(publicClient, structHash);
  }, [publicClient, structHash]);

  // Resume una tx de despliegue que esta misma pestaña ya envio antes de un
  // recargo (D5 tarea 6): solo espera su confirmacion, nunca manda una nueva.
  useEffect(() => {
    if (!publicClient || !structHash) return;
    const clave = claveDespliegue(structHash);
    const pendiente = sessionStorage.getItem(clave);
    if (!pendiente || pendiente === "enviando") return;
    let cancelado = false;
    // El .then() (en vez de un IIFE que arranca sincrono) es a proposito:
    // `setEstadoPool` recien se llama dentro de un callback asincrono, nunca
    // como la primera linea sincrona del efecto.
    Promise.resolve().then(async () => {
      if (cancelado) return;
      setEstadoPool({ tipo: "desplegando" });
      try {
        // `esperarRecibo` en vez de `publicClient.waitForTransactionReceipt`:
        // ver el porqué en web/src/lib/recibo.ts (D6).
        await esperarRecibo(publicClient, pendiente as Hex);
      } catch {
        // Revirtio o no se pudo esperar: el chequeo de abajo dice la verdad.
      }
      if (cancelado) return;
      const direccion = await buscarPoolDesplegado(publicClient, structHash);
      if (cancelado) return;
      sessionStorage.removeItem(clave);
      setEstadoPool(direccion ? { tipo: "desplegado", direccion } : { tipo: "sin-desplegar" });
    });
    return () => {
      cancelado = true;
    };
  }, [publicClient, structHash]);

  // Sondeo: mientras no haya pool, refresca firmas y vuelve a preguntarle a
  // la cadena. Si otro participante ya desplego, esta pestaña lo detecta sin
  // que nadie tenga que recargar a mano.
  useEffect(() => {
    if (!borrador || !agreement || !structHash || !publicClient) return;
    let cancelado = false;

    async function ciclo() {
      const direccion = await verificarCadena();
      if (cancelado) return;
      if (direccion) {
        setEstadoPool({ tipo: "desplegado", direccion });
        return;
      }
      await cargarFirmas();
      if (cancelado) return;
      setEstadoPool((actual) => (actual.tipo === "desplegando" ? actual : { tipo: "sin-desplegar" }));
    }

    ciclo();
    const intervalo = setInterval(ciclo, INTERVALO_SONDEO_MS);
    return () => {
      cancelado = true;
      clearInterval(intervalo);
    };
  }, [borrador, agreement, structHash, publicClient, verificarCadena, cargarFirmas]);

  const intentarDesplegar = useCallback(
    async (mapaFirmas: Map<string, Hex>) => {
      if (!agreement || !structHash || !publicClient) return;

      const firmasOrdenadas = agreement.participants.map((p) => mapaFirmas.get(p.toLowerCase()));
      if (firmasOrdenadas.some((s) => !s)) return; // todavia falta alguna firma

      // Capa 1, siempre primero: si la cadena ya dice que esto existe, no hay
      // nada que enviar.
      const direccionExistente = await verificarCadena();
      if (direccionExistente) {
        setEstadoPool({ tipo: "desplegado", direccion: direccionExistente });
        return;
      }

      if (desplegandoRef.current) return;
      const clave = claveDespliegue(structHash);
      desplegandoRef.current = true;
      sessionStorage.setItem(clave, "enviando");
      setEstadoPool({ tipo: "desplegando" });

      try {
        let hash: Hex;
        try {
          // `conTimeout`: caso 2 de D6, `writeContractAsync` a veces nunca
          // resuelve — ni con el hash — aunque la tx ya se haya enviado. Ver
          // el porqué en web/src/lib/recibo.ts.
          hash = await conTimeout(
            writeContractAsync({
              address: FACTORY_ADDRESS,
              abi: splitPoolFactoryAbi,
              functionName: "createPool",
              args: [
                {
                  participants: agreement.participants,
                  bps: agreement.bps,
                  termsHash: agreement.termsHash,
                  salt: agreement.salt,
                },
                firmasOrdenadas as Hex[],
              ],
            }),
            20_000,
          );
        } catch (e) {
          if (!(e instanceof EnvioTimeoutError)) throw e;
          // Sin hash no hay recibo que esperar: `verificarCadena` ya es la
          // fuente de verdad de si el pool se desplegó (lee `consumed` +
          // busca el evento), la reutilizamos como condición de sondeo.
          const direccion = await esperarCondicion(() => verificarCadena(), { timeoutMs: 25_000 });
          if (!direccion) {
            throw new Error("No se pudo confirmar la transacción, revisá tu wallet o intentá de nuevo.");
          }
          sessionStorage.removeItem(clave);
          setEstadoPool({ tipo: "desplegado", direccion });
          return;
        }
        sessionStorage.setItem(clave, hash);
        // `esperarRecibo` en vez de `publicClient.waitForTransactionReceipt`:
        // ver el porqué en web/src/lib/recibo.ts (caso 1 de D6).
        await esperarRecibo(publicClient, hash);
        const direccion = await buscarPoolDesplegado(publicClient, structHash);
        sessionStorage.removeItem(clave);
        setEstadoPool(
          direccion
            ? { tipo: "desplegado", direccion }
            : {
                tipo: "error",
                mensaje: "El pool se desplegó pero no se pudo leer su dirección. Revisá el explorador.",
              },
        );
      } catch (e) {
        sessionStorage.removeItem(clave);
        // Si alguien mas gano la carrera mientras tanto, el contrato revierte
        // con AgreementAlreadyConsumed (docs/THREAT-MODEL.md, front-running
        // del despliegue: aceptado, el resultado es identico). No es un error
        // real para quien lo mira.
        const direccion = await verificarCadena().catch(() => null);
        if (direccion) {
          setEstadoPool({ tipo: "desplegado", direccion });
        } else if (e instanceof EsperaReciboTimeoutError) {
          // La tx se envió, solo dejamos de esperarla nosotros — el sondeo
          // periódico (INTERVALO_SONDEO_MS) va a levantar el pool solo si
          // confirma. Mientras tanto, mostramos el hash en vez de un error
          // genérico sin nada que revisar.
          setEstadoPool({
            tipo: "error",
            mensaje: "No pudimos confirmar automáticamente, pero la transacción se envió. Revisá el explorador:",
            hash: e.hash,
          });
        } else {
          setEstadoPool({
            tipo: "error",
            mensaje: e instanceof Error ? e.message : "No se pudo desplegar el pool",
          });
        }
      } finally {
        desplegandoRef.current = false;
      }
    },
    [agreement, structHash, publicClient, writeContractAsync, verificarCadena],
  );

  async function firmar() {
    if (!agreement || !borrador || !address) return;
    setErrorFirma(null);
    setFirmando(true);
    try {
      const firma = await signTypedDataAsync({
        domain: dominioAcuerdo,
        types: tiposAcuerdo,
        primaryType: "Agreement",
        message: {
          participants: agreement.participants,
          bps: agreement.bps,
          termsHash: agreement.termsHash,
          salt: agreement.salt,
        },
      });
      await guardarFirma(borrador.id, address, firma);
      const mapaActualizado = new Map(firmasVerificadas);
      mapaActualizado.set(address.toLowerCase(), firma);
      setFirmasVerificadas(mapaActualizado);
      // Dispara el despliegue en la sesion de quien acaba de completar la
      // ultima firma (D5 tarea 5) — no en cualquiera que cargue la pagina.
      await intentarDesplegar(mapaActualizado);
    } catch (e) {
      setErrorFirma(e instanceof Error ? e.message : "No se pudo firmar");
    } finally {
      setFirmando(false);
    }
  }

  const participantesUI: Participante[] = useMemo(() => {
    if (!borrador) return [];
    return borrador.agreement_json.participantes.map((p) => ({
      ...p,
      firma: firmasVerificadas.has(p.direccion.toLowerCase()) ? "firmado" : "pendiente",
    }));
  }, [borrador, firmasVerificadas]);

  const acuerdo: Acuerdo | null = useMemo(() => {
    if (!borrador) return null;
    return {
      id: borrador.id,
      proyecto: borrador.agreement_json.proyecto,
      fecha: borrador.agreement_json.fecha,
      terminos: borrador.terms_text,
      terminosHash: borrador.agreement_json.terminosHash,
      participantes: participantesUI,
    };
  }, [borrador, participantesUI]);

  const miParticipante = useMemo(() => {
    if (!address || !borrador) return null;
    return (
      borrador.agreement_json.participantes.find(
        (p) => p.direccion.toLowerCase() === address.toLowerCase(),
      ) ?? null
    );
  }, [address, borrador]);

  const yaFirme = !!(address && firmasVerificadas.has(address.toLowerCase()));
  const desplegado = estadoPool.tipo === "desplegado";

  if (cargando) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <p className="mono text-ink-60 text-xs tracking-wide uppercase">Cargando acuerdo…</p>
      </main>
    );
  }

  if (errorCarga || !acuerdo) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="font-serif text-2xl leading-tight sm:text-3xl">Acuerdo</h1>
        <p className="mono mt-6 border border-caution px-4 py-3 text-xs text-caution">
          {errorCarga ?? "No se pudo cargar el acuerdo."}
        </p>
      </main>
    );
  }

  const { participantes } = acuerdo;
  const firmadas = participantes.filter((p) => p.firma === "firmado").length;
  const completoEnRelay = todasFirmadas(participantes);

  return (
    <ProveedorTema>
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <div className="mb-12 flex items-start justify-between gap-4">
          <p className="mono border-rule text-ink-60 border px-3 py-2 text-xs tracking-wide uppercase">
            HSKChain Testnet · relay + cadena reales
          </p>
          <InterruptorTema />
        </div>

        <header className="border-ink border-b pb-6">
          <h1 className="font-serif text-2xl leading-tight sm:text-3xl">{acuerdo.proyecto}</h1>
          <p className="mono text-ink-60 mt-4 text-xs">
            Acuerdo {acuerdo.id} · {acuerdo.fecha} · HSKChain Testnet
          </p>
        </header>

        <section className="py-16">
          {/* `tensada` se dispara con el mismo booleano que ya usaba la maqueta
              de D3 (todasFirmadas): la linea se tensa cuando entra la ultima
              firma, no cuando la tx de despliegue confirma — eso puede tardar
              unos segundos mas y tiene su propio aviso mas abajo. */}
          <BarraSegmentada participantes={participantes} tensada={completoEnRelay} />
        </section>

        <section>
          <TablaReparto participantes={participantes} />
          <div className="mt-4 flex justify-end">
            <EstadoAcuerdo firmadas={firmadas} total={participantes.length} />
          </div>
        </section>

        <section className="mt-16 max-w-prose">
          <h2 className="text-ink-60 text-xs tracking-wide uppercase">Términos</h2>
          <p className="mt-3 text-sm">{acuerdo.terminos}</p>
          <div className="mt-4 flex items-center gap-3">
            <HashVivo valor={acuerdo.terminosHash} />
          </div>
          <div className="mt-2 max-w-xs">
            <CodigoBarras hash={acuerdo.terminosHash} />
          </div>
        </section>

        {desplegado ? (
          <section
            data-surface="chain"
            className="bg-chain text-on-chain relative mt-16 overflow-hidden border border-transparent px-6 py-8"
          >
            <div className="textura-rejilla pointer-events-none absolute inset-0" aria-hidden="true" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <p className="mono text-xs tracking-wide uppercase opacity-80">
                  Bloque del acuerdo · sellado en cadena
                </p>
                {/* Paso 3 del snap (docs/BRAND.md §13): el sello se anima solo
                    al montarse, justo cuando este bloque reemplaza al de
                    espera porque `estadoPool` ya confirmó el despliegue real
                    en cadena — no antes. */}
                <SelloTinta />
              </div>
              <p className="mt-4 text-sm">Dirección del pool</p>
              <div className="mt-1">
                <HashVivo valor={estadoPool.direccion} superficie="chain" />
              </div>
            </div>
          </section>
        ) : (
          <section className="mt-16 border-t border-dashed border-ink-60 pt-8">
            {estadoPool.tipo === "desplegando" ? (
              <p className="mono text-xs tracking-wide uppercase">
                Todas las firmas están. Desplegando el pool…
              </p>
            ) : estadoPool.tipo === "error" ? (
              <div>
                <p className="mono border border-caution px-4 py-3 text-xs text-caution">
                  {estadoPool.mensaje}
                  {estadoPool.hash ? (
                    <span className="mt-2 block">
                      <HashVivo valor={estadoPool.hash} />
                    </span>
                  ) : null}
                </p>
                <button
                  type="button"
                  className="mono mt-3 border border-ink px-6 py-3 text-xs uppercase tracking-wide"
                  onClick={() => intentarDesplegar(firmasVerificadas)}
                >
                  Reintentar despliegue
                </button>
              </div>
            ) : completoEnRelay ? (
              <div>
                <p className="text-ink-60 text-xs">
                  Todas las firmas están. El despliegue no salió solo — probá disparándolo a mano.
                </p>
                <button
                  type="button"
                  className="mono mt-3 border border-ink px-6 py-3 text-xs uppercase tracking-wide"
                  onClick={() => intentarDesplegar(firmasVerificadas)}
                >
                  Desplegar pool
                </button>
              </div>
            ) : (
              <p className="text-ink-60 text-xs">
                El bloque cruza de papel a cadena cuando entra la última firma.
              </p>
            )}
          </section>
        )}

        <section className="mt-16 border-ink border-t pt-8">
          <p className="mono text-xs uppercase tracking-wide text-ink-60">Identidad</p>
          {!ready ? (
            <p className="text-ink-60 mt-3 text-sm">Cargando…</p>
          ) : authenticated && address ? (
            <div className="mt-3 flex items-center justify-between">
              <span className="mono text-sm">{address}</span>
              <button
                type="button"
                className="mono text-xs uppercase tracking-wide underline underline-offset-4"
                onClick={logout}
              >
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
        </section>

        <section className="mt-8 border-ink border-t pt-8">
          {errorFirma ? (
            <p className="mono mb-4 border border-caution px-4 py-3 text-xs text-caution">{errorFirma}</p>
          ) : null}

          {authenticated && address && !miParticipante ? (
            <p className="mono text-ink-60 text-xs">
              Esta wallet no es parte de este acuerdo. Conectá la dirección con la que te
              invitaron.
            </p>
          ) : (
            <button
              type="button"
              className="mono border-ink bg-ink text-doc disabled:border-rule disabled:text-ink-60 border px-6 py-3 text-xs tracking-wide uppercase disabled:cursor-not-allowed disabled:bg-transparent"
              disabled={!authenticated || !miParticipante || yaFirme || desplegado || firmando}
              onClick={firmar}
            >
              {desplegado
                ? "Acuerdo firmado"
                : yaFirme
                  ? "Ya firmaste — esperando al resto"
                  : firmando
                    ? "Firmando…"
                    : "Firmar acuerdo"}
            </button>
          )}
        </section>
      </main>
    </ProveedorTema>
  );
}
