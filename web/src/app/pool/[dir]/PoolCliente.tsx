"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePrivy, useConnectOrCreateWallet } from "@privy-io/react-auth";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { isAddress, type Address, type Hex } from "viem";
import { HashVivo } from "@/components/HashVivo";
import { InterruptorTema, ProveedorTema } from "@/components/InterruptorTema";
import { PRIVY_APP_ID } from "@/lib/privy";
import { leerCifrasPool, leerTotalRecibido, splitPoolAbi } from "@/lib/pool";
import { MOCK_USDT_ADDRESS, MOCK_USDT_SYMBOL, unidadesAMonto } from "@/lib/token";

/** Cada cuanto se refresca "total recibido" mientras la pantalla está abierta:
 *  quien la mira quiere ver cuando entra un pago nuevo desde `/pagar/[dir]`
 *  sin tener que recargar. Mismo intervalo que el sondeo de `/acuerdo/[id]`. */
const INTERVALO_SONDEO_MS = 5000;

/** Clave de `sessionStorage` para no reenviar un retiro que ya está en vuelo
 *  si la página se recarga a mitad de la confirmación (D5 tarea 6, mismo
 *  requisito aplicado acá al retiro). Una por pool + cuenta. */
function claveRetiro(pool: Address, cuenta: Address): string {
  return `snapline:retiro:${pool.toLowerCase()}:${cuenta.toLowerCase()}`;
}

type EstadoLectura =
  | { tipo: "cargando" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "ok"; totalRecibido: bigint; miParte: bigint | null; yaRetirado: bigint | null };

/**
 * Sin `NEXT_PUBLIC_PRIVY_APP_ID` no hay `PrivyProvider` (`web/src/lib/providers.tsx`)
 * y los hooks de abajo revientan sin ese contexto — mismo corte que en
 * `/acuerdo/[id]` y `/pagar/[dir]`.
 */
export function PoolCliente({ dir }: { dir: string }) {
  if (!PRIVY_APP_ID) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="font-serif text-2xl leading-tight sm:text-3xl">Pool</h1>
        <p className="mono mt-6 border border-caution px-4 py-3 text-xs text-caution">
          Falta NEXT_PUBLIC_PRIVY_APP_ID en web/.env.local. Sin Privy no hay wallet, así que esta
          pantalla no puede saber cuál es &ldquo;mi parte&rdquo; ni firmar un retiro.
        </p>
      </main>
    );
  }

  if (!isAddress(dir, { strict: false })) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="font-serif text-2xl leading-tight sm:text-3xl">Pool</h1>
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
  const { writeContractAsync } = useWriteContract();

  const [estado, setEstado] = useState<EstadoLectura>({ tipo: "cargando" });
  const [retirando, setRetirando] = useState(false);
  const [errorRetiro, setErrorRetiro] = useState<string | null>(null);
  const [retiroConfirmado, setRetiroConfirmado] = useState<Hex | null>(null);

  // Evita mandar un segundo `withdraw` desde esta misma pestaña mientras el
  // primero sigue en vuelo. La fuente de verdad real es `withdrawn` en
  // cadena; esto solo cubre el doble clic (mismo patrón que `desplegandoRef`
  // en AcuerdoCliente.tsx).
  const retirandoRef = useRef(false);

  const refrescar = useCallback(async () => {
    if (!publicClient) return;
    try {
      if (address) {
        const cifras = await leerCifrasPool(publicClient, pool, address);
        setEstado({
          tipo: "ok",
          totalRecibido: cifras.totalRecibido,
          miParte: cifras.miParte,
          yaRetirado: cifras.yaRetirado,
        });
      } else {
        const totalRecibido = await leerTotalRecibido(publicClient, pool);
        setEstado({ tipo: "ok", totalRecibido, miParte: null, yaRetirado: null });
      }
    } catch (e) {
      // Dirección que no es un SplitPool real (o RPC caído): se avisa sin
      // romper la pantalla (TASKS.md § D6).
      setEstado({
        tipo: "error",
        mensaje:
          e instanceof Error
            ? e.message
            : "No se pudo leer el pool. ¿La dirección es un SplitPool desplegado?",
      });
    }
  }, [publicClient, pool, address]);

  useEffect(() => {
    // El `.then()` (en vez de llamar `setEstado` directo en el cuerpo del
    // efecto) evita el render en cascada que marca `react-hooks/set-state-in-effect`
    // — mismo patrón que el efecto de resumen en AcuerdoCliente.tsx.
    let cancelado = false;
    Promise.resolve().then(async () => {
      if (cancelado) return;
      setEstado({ tipo: "cargando" });
      await refrescar();
    });
    const intervalo = setInterval(() => {
      if (!cancelado) refrescar();
    }, INTERVALO_SONDEO_MS);
    return () => {
      cancelado = true;
      clearInterval(intervalo);
    };
  }, [refrescar]);

  // Resume un retiro que esta misma pestaña ya envió antes de un recargo
  // (D5 tarea 6, mismo criterio aplicado al retiro): solo espera su
  // confirmación, nunca manda uno nuevo.
  useEffect(() => {
    if (!publicClient || !address) return;
    const clave = claveRetiro(pool, address);
    const pendiente = sessionStorage.getItem(clave);
    if (!pendiente || pendiente === "enviando") return;
    let cancelado = false;
    Promise.resolve().then(async () => {
      if (cancelado) return;
      setRetirando(true);
      try {
        await publicClient.waitForTransactionReceipt({ hash: pendiente as Hex });
        if (!cancelado) setRetiroConfirmado(pendiente as Hex);
      } catch {
        // Revirtió o no se pudo esperar: el refresco de abajo dice la verdad.
      }
      if (cancelado) return;
      sessionStorage.removeItem(clave);
      setRetirando(false);
      await refrescar();
    });
    return () => {
      cancelado = true;
    };
  }, [publicClient, address, pool, refrescar]);

  async function retirar() {
    if (!address || !publicClient) return;
    if (retirandoRef.current) return;

    const clave = claveRetiro(pool, address);
    retirandoRef.current = true;
    sessionStorage.setItem(clave, "enviando");
    setRetirando(true);
    setErrorRetiro(null);
    setRetiroConfirmado(null);

    try {
      const hash = await writeContractAsync({
        address: pool,
        abi: splitPoolAbi,
        functionName: "withdraw",
        args: [MOCK_USDT_ADDRESS],
      });
      sessionStorage.setItem(clave, hash);
      await publicClient.waitForTransactionReceipt({ hash });
      sessionStorage.removeItem(clave);
      setRetiroConfirmado(hash);
      await refrescar();
    } catch (e) {
      sessionStorage.removeItem(clave);
      setErrorRetiro(e instanceof Error ? e.message : "No se pudo retirar");
    } finally {
      retirandoRef.current = false;
      setRetirando(false);
    }
  }

  const cifra = (valor: bigint | null) =>
    valor === null ? "—" : `${unidadesAMonto(valor)} ${MOCK_USDT_SYMBOL}`;

  return (
    <ProveedorTema>
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <div className="flex items-start justify-between gap-4">
          <p className="mono border-rule text-ink-60 border px-3 py-2 text-xs tracking-wide uppercase">
            HSKChain Testnet · lectura directa de cadena
          </p>
          <InterruptorTema />
        </div>

        <header className="border-ink mt-8 border-b pb-6">
          <h1 className="font-serif text-2xl leading-tight sm:text-3xl">Pool</h1>
          <div className="mt-4">
            <p className="mono text-xs uppercase tracking-wide text-ink-60">Dirección del pool</p>
            <div className="mt-1">
              <HashVivo valor={pool} />
            </div>
          </div>
        </header>

        {estado.tipo === "error" ? (
          <p className="mono mt-8 border border-caution px-4 py-3 text-xs text-caution">
            {estado.mensaje}
          </p>
        ) : (
          <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="border border-rule p-4">
              <p className="mono text-xs uppercase tracking-wide text-ink-60">Total recibido</p>
              <p className="mono mt-2 text-lg">
                {estado.tipo === "cargando" ? "…" : cifra(estado.totalRecibido)}
              </p>
            </div>
            <div className="border border-rule p-4">
              <p className="mono text-xs uppercase tracking-wide text-ink-60">Mi parte</p>
              <p className="mono mt-2 text-lg">
                {estado.tipo === "cargando" ? "…" : address ? cifra(estado.miParte) : "conectá una wallet"}
              </p>
            </div>
            <div className="border border-rule p-4">
              <p className="mono text-xs uppercase tracking-wide text-ink-60">Ya retirado</p>
              <p className="mono mt-2 text-lg">
                {estado.tipo === "cargando" ? "…" : address ? cifra(estado.yaRetirado) : "conectá una wallet"}
              </p>
            </div>
          </section>
        )}

        <section className="mt-12 border-t border-rule pt-8">
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

        <section className="mt-8 border-t border-ink pt-8">
          {errorRetiro ? (
            <p className="mono mb-4 border border-caution px-4 py-3 text-xs text-caution">
              {errorRetiro}
            </p>
          ) : null}

          {retiroConfirmado ? (
            <div data-surface="chain" className="bg-chain text-on-chain mb-4 px-4 py-3">
              <p className="mono text-xs uppercase tracking-wide">Retiro confirmado</p>
              <div className="mt-1">
                <HashVivo valor={retiroConfirmado} superficie="chain" />
              </div>
            </div>
          ) : null}

          <button
            type="button"
            className="mono border-ink bg-ink text-doc disabled:border-rule disabled:text-ink-60 border px-6 py-3 text-xs tracking-wide uppercase disabled:cursor-not-allowed disabled:bg-transparent"
            disabled={
              !address ||
              retirando ||
              estado.tipo !== "ok" ||
              (estado.tipo === "ok" && (estado.miParte === null || estado.miParte === BigInt(0)))
            }
            onClick={retirar}
          >
            {!address
              ? "Conectá una wallet para retirar"
              : retirando
                ? "Retirando…"
                : "Retirar mi parte"}
          </button>
        </section>
      </main>
    </ProveedorTema>
  );
}
