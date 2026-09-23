"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import type { Hex } from "viem";
import { HashVivo } from "@/components/HashVivo";

type EstadoRecibo =
  | { tipo: "cargando" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "ok"; bloque: bigint; gasUsado: bigint };

/**
 * Recibo de transaccion confirmada (docs/BRAND.md §8): "cada tx confirmada
 * deja un recibo en superficie `chain`: que paso, bloque, gas y hash."
 *
 * Reemplaza el bloque casi identico que hoy repiten `PagarCliente.tsx`
 * ("Pago confirmado") y `PoolCliente.tsx` ("Retiro confirmado"): `etiqueta`
 * cubre esa diferencia sin duplicar el componente.
 *
 * Las pantallas ya guardan solo el hash (`pagoConfirmado`/`retiroConfirmado`:
 * `Hex | null`) — no hace falta que empiecen a guardar el recibo completo.
 * Este componente busca bloque y gas el mismo con `getTransactionReceipt`: el
 * hash ya esta disponible de entrada (la tx que lo dejo ya se espero con
 * `waitForTransactionReceipt` antes de guardarse), asi que solo el bloque y
 * el gas quedan en un estado de carga breve mientras se resuelve la lectura;
 * el hash se puede mostrar (via `HashVivo`) desde el primer render.
 */
export function ReciboTransaccion({
  hash,
  etiqueta,
  className = "",
}: {
  hash: Hex;
  etiqueta: string;
  className?: string;
}) {
  const publicClient = usePublicClient();
  const [estado, setEstado] = useState<EstadoRecibo>({ tipo: "cargando" });

  useEffect(() => {
    if (!publicClient) return;
    let cancelado = false;

    // El `.then()` (en vez de llamar `setEstado` directo en el cuerpo del
    // efecto) evita el render en cascada que marca `react-hooks/set-state-in-effect`
    // — mismo patrón que el refresco de saldo en PagarCliente.tsx.
    Promise.resolve().then(async () => {
      if (cancelado) return;
      setEstado({ tipo: "cargando" });
      try {
        const recibo = await publicClient.getTransactionReceipt({ hash });
        if (cancelado) return;
        setEstado({ tipo: "ok", bloque: recibo.blockNumber, gasUsado: recibo.gasUsed });
      } catch (e) {
        if (cancelado) return;
        setEstado({
          tipo: "error",
          mensaje: e instanceof Error ? e.message : "No se pudo leer el recibo de la transacción",
        });
      }
    });

    return () => {
      cancelado = true;
    };
  }, [publicClient, hash]);

  return (
    <div data-surface="chain" className={`bg-chain text-on-chain px-4 py-3 ${className}`}>
      <p className="mono text-xs uppercase tracking-wide">{etiqueta}</p>

      <dl className="mono text-on-chain/70 mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs">
        <div className="flex items-center gap-1.5">
          <dt className="uppercase tracking-wide">Bloque</dt>
          <dd>
            {estado.tipo === "ok"
              ? `#${estado.bloque.toString()}`
              : estado.tipo === "error"
                ? "—"
                : "…"}
          </dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="uppercase tracking-wide">Gas</dt>
          <dd>
            {estado.tipo === "ok" ? estado.gasUsado.toString() : estado.tipo === "error" ? "—" : "…"}
          </dd>
        </div>
      </dl>

      {estado.tipo === "error" ? (
        <p className="mono text-on-chain/70 mt-2 text-xs">{estado.mensaje}</p>
      ) : null}

      <div className="mt-2">
        <HashVivo valor={hash} superficie="chain" />
      </div>
    </div>
  );
}
