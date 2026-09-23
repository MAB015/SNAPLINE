"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePrivy, useConnectOrCreateWallet } from "@privy-io/react-auth";
import { useAccount, usePublicClient } from "wagmi";
import { isAddress, type Address } from "viem";
import { HashVivo } from "@/components/HashVivo";
import { ProveedorTema } from "@/components/InterruptorTema";
import { NavBar } from "@/components/NavBar";
import { SelloSimulado } from "@/components/SelloSimulado";
import { PRIVY_APP_ID } from "@/lib/privy";
import { leerCifrasPool } from "@/lib/pool";
import { MOCK_USDT_ADDRESS, MOCK_USDT_SYMBOL, unidadesAMonto } from "@/lib/token";
import { MockOffRamp, type BankAccount, type Quote, type Receipt } from "@/lib/offramp";

/**
 * D7 (TASKS.md § D7, docs/ARCHITECTURE.md §5): salida a pesos simulada de
 * la parte liberable de un participante. Toda la pantalla vive detrás de
 * `MockOffRamp` — nada acá toca un banco real.
 */
const offramp = new MockOffRamp();

type EstadoParte =
  | { tipo: "cargando" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "ok"; releasable: bigint };

const formatoCop = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

/**
 * Mismo corte que `/pool/[dir]`: sin `NEXT_PUBLIC_PRIVY_APP_ID` no hay
 * `PrivyProvider` (`web/src/lib/providers.tsx`) y los hooks de abajo
 * revientan sin ese contexto.
 */
export function RetiroCopCliente({ dir }: { dir: string }) {
  if (!PRIVY_APP_ID) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="font-serif text-2xl leading-tight sm:text-3xl">Salir a pesos</h1>
        <p className="mono mt-6 border border-caution px-4 py-3 text-xs text-caution">
          Falta NEXT_PUBLIC_PRIVY_APP_ID en web/.env.local. Sin Privy no hay wallet, así que esta
          pantalla no puede saber cuál es &ldquo;mi parte&rdquo; para cotizar.
        </p>
      </main>
    );
  }

  if (!isAddress(dir, { strict: false })) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="font-serif text-2xl leading-tight sm:text-3xl">Salir a pesos</h1>
        <p className="mono mt-6 border border-caution px-4 py-3 text-xs text-caution">
          &ldquo;{dir}&rdquo; no es una dirección válida. Revisá el link.
        </p>
      </main>
    );
  }

  return <Contenido pool={dir as Address} />;
}

function Contenido({ pool }: { pool: Address }) {
  const { ready, authenticated, logout } = usePrivy();
  const { connectOrCreateWallet } = useConnectOrCreateWallet();
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const [estadoParte, setEstadoParte] = useState<EstadoParte>({ tipo: "cargando" });

  const [cotizacion, setCotizacion] = useState<Quote | null>(null);
  const [cotizando, setCotizando] = useState(false);
  const [errorCotizar, setErrorCotizar] = useState<string | null>(null);

  const [titular, setTitular] = useState("");
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const [comprobante, setComprobante] = useState<Receipt | null>(null);
  const [ejecutando, setEjecutando] = useState(false);
  const [errorEjecutar, setErrorEjecutar] = useState<string | null>(null);

  // Evita mandar una segunda ejecución mientras la primera sigue en vuelo
  // (mismo patrón que `retirandoRef` en PoolCliente.tsx). No hace falta
  // resumir tras un recargo: `MockOffRamp` no persiste nada real entre
  // recargas — es un comprobante simulado, no una transacción en cadena.
  const ejecutandoRef = useRef(false);

  const refrescarParte = useCallback(async () => {
    if (!publicClient || !address) return;
    setEstadoParte({ tipo: "cargando" });
    try {
      const cifras = await leerCifrasPool(publicClient, pool, address);
      setEstadoParte({ tipo: "ok", releasable: cifras.miParte });
    } catch (e) {
      setEstadoParte({
        tipo: "error",
        mensaje:
          e instanceof Error
            ? e.message
            : "No se pudo leer el pool. ¿La dirección es un SplitPool desplegado?",
      });
    }
  }, [publicClient, pool, address]);

  useEffect(() => {
    if (!address) return;
    let cancelado = false;
    Promise.resolve().then(async () => {
      if (!cancelado) await refrescarParte();
    });
    return () => {
      cancelado = true;
    };
  }, [address, refrescarParte]);

  async function cotizar() {
    if (estadoParte.tipo !== "ok" || estadoParte.releasable === BigInt(0)) return;
    setCotizando(true);
    setErrorCotizar(null);
    setCotizacion(null);
    setComprobante(null);
    try {
      const quote = await offramp.quote(estadoParte.releasable, MOCK_USDT_ADDRESS);
      setCotizacion(quote);
    } catch (e) {
      setErrorCotizar(e instanceof Error ? e.message : "No se pudo cotizar");
    } finally {
      setCotizando(false);
    }
  }

  async function ejecutar() {
    if (!cotizacion || ejecutandoRef.current) return;
    if (!titular.trim() || !numeroCuenta.trim()) return;

    ejecutandoRef.current = true;
    setEjecutando(true);
    setErrorEjecutar(null);

    const cuenta: BankAccount = { titular: titular.trim(), numeroCuenta: numeroCuenta.trim() };

    try {
      const receipt = await offramp.execute(cotizacion, cuenta);
      setComprobante(receipt);
    } catch (e) {
      setErrorEjecutar(e instanceof Error ? e.message : "No se pudo ejecutar el retiro");
    } finally {
      ejecutandoRef.current = false;
      setEjecutando(false);
    }
  }

  return (
    <ProveedorTema>
      <NavBar />
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        {/* docs/DEMO-SCRIPT.md líneas 92-101: el sello está en pantalla desde
            el primer frame, no solo junto al comprobante. */}
        <SelloSimulado detalle="Esto convierte una parte simulada a pesos colombianos con una tasa y una comisión ilustrativas. No mueve dinero real y no habla con ningún banco." />

        <header className="border-ink mt-8 border-b pb-6">
          <h1 className="font-serif text-2xl leading-tight sm:text-3xl">Salir a pesos</h1>
          <div className="mt-4">
            <p className="mono text-xs uppercase tracking-wide text-ink-60">Dirección del pool</p>
            <div className="mt-1">
              <HashVivo valor={pool} />
            </div>
          </div>
        </header>

        <section className="mt-8 border-t border-rule pt-8">
          <p className="mono text-xs uppercase tracking-wide text-ink-60">Wallet</p>
          {!ready ? (
            <p className="mt-3 text-sm text-ink-60">Cargando…</p>
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
              Conectar wallet
            </button>
          )}
        </section>

        {address ? (
          <section className="mt-8 border-t border-rule pt-8">
            <p className="mono text-xs uppercase tracking-wide text-ink-60">Mi parte liberable</p>
            {estadoParte.tipo === "error" ? (
              <p className="mono mt-3 border border-caution px-4 py-3 text-xs text-caution">
                {estadoParte.mensaje}
              </p>
            ) : (
              <p className="mono mt-2 text-lg">
                {estadoParte.tipo === "cargando"
                  ? "…"
                  : `${unidadesAMonto(estadoParte.releasable)} ${MOCK_USDT_SYMBOL}`}
              </p>
            )}

            <button
              type="button"
              className="mono border-ink bg-ink text-doc disabled:border-rule disabled:text-ink-60 mt-6 border px-6 py-3 text-xs tracking-wide uppercase disabled:cursor-not-allowed disabled:bg-transparent"
              disabled={
                cotizando ||
                estadoParte.tipo !== "ok" ||
                (estadoParte.tipo === "ok" && estadoParte.releasable === BigInt(0))
              }
              onClick={cotizar}
            >
              {cotizando ? "Cotizando…" : "Cotizar"}
            </button>

            {errorCotizar ? (
              <p className="mono mt-4 border border-caution px-4 py-3 text-xs text-caution">
                {errorCotizar}
              </p>
            ) : null}
          </section>
        ) : null}

        {cotizacion ? (
          <section className="mt-8 border-t border-ink pt-8">
            <p className="mono text-xs uppercase tracking-wide text-ink-60">Cotización</p>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="border border-rule p-4">
                <dt className="mono text-xs uppercase tracking-wide text-ink-60">Tasa (ilustrativa)</dt>
                <dd className="mono mt-2 text-lg">
                  {formatoCop.format(cotizacion.tasaCopPorUsd)} / {MOCK_USDT_SYMBOL}
                </dd>
              </div>
              <div className="border border-rule p-4">
                <dt className="mono text-xs uppercase tracking-wide text-ink-60">
                  Comisión ({(cotizacion.comisionBps / 100).toString()} %)
                </dt>
                <dd className="mono mt-2 text-lg">
                  {unidadesAMonto(cotizacion.comisionToken)} {MOCK_USDT_SYMBOL}
                </dd>
              </div>
              <div className="border border-rule p-4 sm:col-span-2">
                <dt className="mono text-xs uppercase tracking-wide text-ink-60">Neto en pesos</dt>
                <dd className="mono mt-2 text-2xl">{formatoCop.format(Number(cotizacion.netoCop))}</dd>
              </div>
            </dl>

            {!comprobante ? (
              <div className="mt-8">
                <p className="mono text-xs uppercase tracking-wide text-ink-60">Cuenta destino (simulada)</p>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mono text-xs text-ink-60">Titular</span>
                    <input
                      type="text"
                      value={titular}
                      onChange={(e) => setTitular(e.target.value)}
                      className="border-rule mono mt-1 w-full border px-3 py-2 text-sm"
                      placeholder="Sofía Ramírez"
                    />
                  </label>
                  <label className="block">
                    <span className="mono text-xs text-ink-60">Número de cuenta</span>
                    <input
                      type="text"
                      value={numeroCuenta}
                      onChange={(e) => setNumeroCuenta(e.target.value)}
                      className="border-rule mono mt-1 w-full border px-3 py-2 text-sm"
                      placeholder="Bancolombia •••• 1234"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  className="mono border-ink bg-ink text-doc disabled:border-rule disabled:text-ink-60 mt-6 border px-6 py-3 text-xs tracking-wide uppercase disabled:cursor-not-allowed disabled:bg-transparent"
                  disabled={ejecutando || !titular.trim() || !numeroCuenta.trim()}
                  onClick={ejecutar}
                >
                  {ejecutando ? "Ejecutando…" : "Ejecutar salida a pesos"}
                </button>

                {errorEjecutar ? (
                  <p className="mono mt-4 border border-caution px-4 py-3 text-xs text-caution">
                    {errorEjecutar}
                  </p>
                ) : null}
              </div>
            ) : null}
          </section>
        ) : null}

        {comprobante ? (
          <section className="mt-8 border-t border-ink pt-8">
            <p className="mono text-xs uppercase tracking-wide text-ink-60">Comprobante</p>
            <div data-surface="chain" className="bg-chain text-on-chain mt-3 px-4 py-3">
              <p className="mono text-xs uppercase tracking-wide">
                {comprobante.status === "completado" ? "Salida a pesos completada" : comprobante.status}
              </p>
              <p className="mono mt-2 text-2xl">{formatoCop.format(Number(comprobante.netoCop))}</p>
              {/* Texto plano, no `HashVivo`: la referencia no es una dirección
                  ni una transacción real, así que no lleva enlace al
                  explorador — eso implicaría que hay algo que verificar en
                  cadena cuando no lo hay. */}
              <p className="mono mt-2 text-xs break-all">Referencia: {comprobante.referencia}</p>
              <p className="mono mt-1 text-xs">
                {comprobante.cuenta.titular} · {comprobante.cuenta.numeroCuenta}
              </p>
              <p className="mono mt-1 text-xs">{new Date(comprobante.creadoEn).toLocaleString("es-CO")}</p>
            </div>

            <div className="mt-4">
              <SelloSimulado detalle={comprobante.nota} />
            </div>
          </section>
        ) : null}
      </main>
    </ProveedorTema>
  );
}
