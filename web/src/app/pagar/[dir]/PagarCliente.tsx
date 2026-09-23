"use client";

import { useCallback, useEffect, useState } from "react";
import { usePrivy, useConnectOrCreateWallet } from "@privy-io/react-auth";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { isAddress, type Address, type Hex } from "viem";
import { HashVivo } from "@/components/HashVivo";
import { InterruptorTema, ProveedorTema } from "@/components/InterruptorTema";
import { PRIVY_APP_ID } from "@/lib/privy";
import { conTimeout, EnvioTimeoutError, esperarCondicion, esperarRecibo, EsperaReciboTimeoutError } from "@/lib/recibo";
import { MOCK_USDT_ADDRESS, MOCK_USDT_SYMBOL, mockUsdtAbi, montoAUnidades, unidadesAMonto } from "@/lib/token";

/** Monto fijo del faucet de demo: alcanza para un par de pagos de prueba sin
 *  pedirle a quien visita que piense en cuánto pedir. `mint` es público y sin
 *  permisos en `MockUSDT.sol` — cualquiera puede acuñar para su propia wallet. */
const MONTO_FAUCET = "1000";

/**
 * Sin `NEXT_PUBLIC_PRIVY_APP_ID` no hay `PrivyProvider` (`web/src/lib/providers.tsx`)
 * y los hooks de abajo revientan sin ese contexto — mismo corte que en
 * `/acuerdo/[id]` y `/nuevo`.
 */
export function PagarCliente({ dir }: { dir: string }) {
  if (!PRIVY_APP_ID) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="font-serif text-2xl leading-tight sm:text-3xl">Pagar</h1>
        <p className="mono mt-6 border border-caution px-4 py-3 text-xs text-caution">
          Falta NEXT_PUBLIC_PRIVY_APP_ID en web/.env.local. Sin Privy no hay wallet, así que esta
          pantalla no puede firmar una transacción de pago.
        </p>
      </main>
    );
  }

  // `strict: false`: quien pega el link no siempre lo trae con el casing de
  // checksum EIP-55, y Solidity compara bytes, no mayúsculas.
  if (!isAddress(dir, { strict: false })) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="font-serif text-2xl leading-tight sm:text-3xl">Pagar</h1>
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

  const [balance, setBalance] = useState<bigint | null>(null);
  const [cargandoBalance, setCargandoBalance] = useState(false);
  const [errorBalance, setErrorBalance] = useState<string | null>(null);

  const [minteando, setMinteando] = useState(false);
  const [errorMint, setErrorMint] = useState<string | null>(null);
  // Timeout de esperarRecibo con la tx ya enviada (caso 1, con hash) o de
  // writeContractAsync sin llegar a resolver (caso 2, confirmado solo por
  // saldo — "sin-hash"): ninguno de los dos es un error real, ver
  // web/src/lib/recibo.ts.
  const [mintIndeterminado, setMintIndeterminado] = useState<Hex | "sin-hash" | null>(null);

  const [monto, setMonto] = useState("");
  const [pagando, setPagando] = useState(false);
  const [errorPago, setErrorPago] = useState<string | null>(null);
  const [pagoConfirmado, setPagoConfirmado] = useState<Hex | null>(null);
  const [pagoIndeterminado, setPagoIndeterminado] = useState<Hex | "sin-hash" | null>(null);

  const refrescarBalance = useCallback(async () => {
    if (!publicClient || !address) return;
    setCargandoBalance(true);
    setErrorBalance(null);
    try {
      const valor = await publicClient.readContract({
        address: MOCK_USDT_ADDRESS,
        abi: mockUsdtAbi,
        functionName: "balanceOf",
        args: [address],
      });
      setBalance(valor);
    } catch (e) {
      setErrorBalance(e instanceof Error ? e.message : "No se pudo leer el saldo de mUSDT");
    } finally {
      setCargandoBalance(false);
    }
  }, [publicClient, address]);

  useEffect(() => {
    // El `.then()` (en vez de llamar `setBalance` directo en el cuerpo del
    // efecto) evita el render en cascada que marca `react-hooks/set-state-in-effect`
    // — mismo patrón que el efecto de resumen en AcuerdoCliente.tsx.
    let cancelado = false;
    Promise.resolve().then(async () => {
      if (cancelado) return;
      setBalance(null);
      await refrescarBalance();
    });
    return () => {
      cancelado = true;
    };
  }, [refrescarBalance]);

  async function mintear() {
    if (!address || !publicClient) return;
    setMinteando(true);
    setErrorMint(null);
    setMintIndeterminado(null);
    // Saldo previo al intento: es la referencia para el fallback del caso 2
    // más abajo (writeContractAsync que nunca resuelve, ni con hash).
    const saldoAntes = balance;
    try {
      let hash: Hex;
      try {
        // `conTimeout` en vez de esperar `writeContractAsync` a secas: caso 2
        // de D6, la promesa de `Embedded1193Provider.request()` (Privy) a
        // veces nunca resuelve — ni con el hash — aunque la tx ya haya sido
        // enviada. Ver el porqué en web/src/lib/recibo.ts.
        hash = await conTimeout(
          writeContractAsync({
            address: MOCK_USDT_ADDRESS,
            abi: mockUsdtAbi,
            functionName: "mint",
            args: [address, montoAUnidades(MONTO_FAUCET)],
          }),
          20_000,
        );
      } catch (e) {
        if (!(e instanceof EnvioTimeoutError)) throw e;
        // Sin hash no hay recibo que esperar: la única forma de saber si la
        // tx pasó es mirar si el saldo se movió.
        const subio = await esperarCondicion(
          async () => {
            const actual = await publicClient.readContract({
              address: MOCK_USDT_ADDRESS,
              abi: mockUsdtAbi,
              functionName: "balanceOf",
              args: [address],
            });
            return saldoAntes === null || actual > saldoAntes ? true : null;
          },
          { timeoutMs: 25_000 },
        );
        if (!subio) {
          throw new Error("No se pudo confirmar la transacción, revisá tu wallet o intentá de nuevo.");
        }
        setMintIndeterminado("sin-hash");
        await refrescarBalance();
        return;
      }
      // `esperarRecibo` en vez de `publicClient.waitForTransactionReceipt`:
      // ver el porqué en web/src/lib/recibo.ts (caso 1 de D6, botón que
      // nunca vuelve a su estado normal pese a que el recibo ya está en
      // cadena).
      await esperarRecibo(publicClient, hash);
      await refrescarBalance();
    } catch (e) {
      if (e instanceof EsperaReciboTimeoutError) {
        // La tx se envió y probablemente ya confirmó — solo dejamos de
        // esperarla nosotros. No es un error real: se muestra degradado.
        setMintIndeterminado(e.hash);
        await refrescarBalance();
      } else {
        setErrorMint(e instanceof Error ? e.message : "No se pudo mintear mUSDT");
      }
    } finally {
      setMinteando(false);
    }
  }

  async function pagar() {
    if (!address || !publicClient) return;
    setPagoConfirmado(null);
    setPagoIndeterminado(null);
    setErrorPago(null);

    let unidades: bigint;
    try {
      unidades = montoAUnidades(monto);
    } catch {
      setErrorPago("Monto inválido");
      return;
    }
    if (unidades <= BigInt(0)) {
      setErrorPago("El monto tiene que ser mayor a cero");
      return;
    }

    setPagando(true);
    // Saldo del pool previo al intento: referencia para el fallback del
    // caso 2 (writeContractAsync que nunca resuelve, ni con hash).
    const saldoPoolAntes = await publicClient
      .readContract({
        address: MOCK_USDT_ADDRESS,
        abi: mockUsdtAbi,
        functionName: "balanceOf",
        args: [pool],
      })
      .catch(() => null);
    try {
      let hash: Hex;
      try {
        // `conTimeout`: mismo caso 2 de D6 que en mintear() — ver el porqué
        // en web/src/lib/recibo.ts.
        hash = await conTimeout(
          // Sin `approve` de por medio: `SplitPool.sol` no tiene función de
          // depósito, los tokens llegan por transferencia directa
          // (`receive()` solo cubre el nativo). Ver contracts/src/SplitPool.sol.
          writeContractAsync({
            address: MOCK_USDT_ADDRESS,
            abi: mockUsdtAbi,
            functionName: "transfer",
            args: [pool, unidades],
          }),
          20_000,
        );
      } catch (e) {
        if (!(e instanceof EnvioTimeoutError)) throw e;
        const subio = await esperarCondicion(
          async () => {
            const actual = await publicClient.readContract({
              address: MOCK_USDT_ADDRESS,
              abi: mockUsdtAbi,
              functionName: "balanceOf",
              args: [pool],
            });
            return saldoPoolAntes === null || actual > saldoPoolAntes ? true : null;
          },
          { timeoutMs: 25_000 },
        );
        if (!subio) {
          throw new Error("No se pudo confirmar la transacción, revisá tu wallet o intentá de nuevo.");
        }
        setPagoIndeterminado("sin-hash");
        setMonto("");
        await refrescarBalance();
        return;
      }
      await esperarRecibo(publicClient, hash);
      setPagoConfirmado(hash);
      setMonto("");
      await refrescarBalance();
    } catch (e) {
      if (e instanceof EsperaReciboTimeoutError) {
        // Igual que en mintear(): la tx se envió, solo dejamos de esperarla.
        // Se muestra el mismo comprobante que un pago confirmado, pero con
        // aviso de que no se pudo verificar automáticamente.
        setPagoIndeterminado(e.hash);
        setMonto("");
        await refrescarBalance();
      } else {
        setErrorPago(e instanceof Error ? e.message : "No se pudo pagar");
      }
    } finally {
      setPagando(false);
    }
  }

  return (
    <ProveedorTema>
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <div className="flex items-start justify-between gap-4">
          <p className="mono border-rule text-ink-60 border px-3 py-2 text-xs tracking-wide uppercase">
            HSKChain Testnet · pago real, link público
          </p>
          <InterruptorTema />
        </div>

        <header className="border-ink mt-8 border-b pb-6">
          <h1 className="font-serif text-2xl leading-tight sm:text-3xl">Pagar</h1>
          <p className="mt-4 max-w-prose text-sm">
            Cualquiera con este link puede pagarle al pool, sin ser parte del acuerdo. Solo hace falta
            una wallet conectada para firmar la transacción.
          </p>
          <div className="mt-4">
            <p className="mono text-xs uppercase tracking-wide text-ink-60">Dirección del pool</p>
            <div className="mt-1">
              <HashVivo valor={pool} />
            </div>
          </div>
        </header>

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
              Conectar wallet para pagar
            </button>
          )}
        </section>

        {address ? (
          <section className="mt-8 border-t border-rule pt-8">
            <p className="mono text-xs uppercase tracking-wide text-ink-60">Faucet de {MOCK_USDT_SYMBOL}</p>
            <p className="mt-2 text-sm">
              Saldo:{" "}
              <span className="mono">
                {cargandoBalance
                  ? "cargando…"
                  : balance !== null
                    ? `${unidadesAMonto(balance)} ${MOCK_USDT_SYMBOL}`
                    : "—"}
              </span>
            </p>
            {errorBalance ? (
              <p className="mono mt-2 border border-caution px-4 py-3 text-xs text-caution">
                {errorBalance}
              </p>
            ) : null}
            {errorMint ? (
              <p className="mono mt-2 border border-caution px-4 py-3 text-xs text-caution">{errorMint}</p>
            ) : null}
            {mintIndeterminado ? (
              <p className="mono mt-2 border border-caution px-4 py-3 text-xs text-caution">
                {mintIndeterminado === "sin-hash" ? (
                  "Confirmado por saldo, no se pudo recuperar el hash exacto — revisá el explorador."
                ) : (
                  <>
                    No pudimos confirmar automáticamente, pero la transacción se envió. Hash:{" "}
                    <HashVivo valor={mintIndeterminado} />
                  </>
                )}
              </p>
            ) : null}
            <button
              type="button"
              className="mono mt-3 border border-ink px-6 py-3 text-xs uppercase tracking-wide disabled:cursor-not-allowed disabled:border-rule disabled:text-ink-60"
              disabled={minteando}
              onClick={mintear}
            >
              {minteando ? "Minteando…" : `Mintear ${MONTO_FAUCET} ${MOCK_USDT_SYMBOL} de prueba`}
            </button>
          </section>
        ) : null}

        <section className="mt-8 border-t border-ink pt-8">
          <p className="mono text-xs uppercase tracking-wide text-ink-60">Pagar al pool</p>

          <label className="mono mt-4 block text-xs uppercase tracking-wide text-ink-60" htmlFor="monto">
            Monto ({MOCK_USDT_SYMBOL})
          </label>
          <input
            id="monto"
            inputMode="decimal"
            className="mono mt-2 w-full border border-rule bg-transparent px-3 py-2 text-sm outline-none focus:border-ink disabled:cursor-not-allowed"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="100.00"
            disabled={!address}
          />

          {errorPago ? (
            <p className="mono mt-4 border border-caution px-4 py-3 text-xs text-caution">{errorPago}</p>
          ) : null}

          {pagoConfirmado ? (
            <div
              data-surface="chain"
              className="bg-chain text-on-chain mt-4 px-4 py-3"
            >
              <p className="mono text-xs uppercase tracking-wide">Pago confirmado</p>
              <div className="mt-1">
                <HashVivo valor={pagoConfirmado} superficie="chain" />
              </div>
            </div>
          ) : null}

          {pagoIndeterminado ? (
            <div
              data-surface="chain"
              className="bg-chain text-on-chain mt-4 px-4 py-3"
            >
              {pagoIndeterminado === "sin-hash" ? (
                <p className="mono text-xs uppercase tracking-wide">
                  Confirmado por saldo, no se pudo recuperar el hash exacto — revisá el explorador.
                </p>
              ) : (
                <>
                  <p className="mono text-xs uppercase tracking-wide">
                    No pudimos confirmar automáticamente, pero la transacción se envió. Revisá el
                    explorador:
                  </p>
                  <div className="mt-1">
                    <HashVivo valor={pagoIndeterminado} superficie="chain" />
                  </div>
                </>
              )}
            </div>
          ) : null}

          <button
            type="button"
            className="mono border-ink bg-ink text-doc disabled:border-rule disabled:text-ink-60 mt-4 border px-6 py-3 text-xs tracking-wide uppercase disabled:cursor-not-allowed disabled:bg-transparent"
            disabled={!address || pagando}
            onClick={pagar}
          >
            {!address ? "Conectá una wallet para pagar" : pagando ? "Pagando…" : "Pagar"}
          </button>
        </section>
      </main>
    </ProveedorTema>
  );
}
