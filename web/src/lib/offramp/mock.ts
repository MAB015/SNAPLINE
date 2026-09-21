import type { Address } from "viem";
import type { BankAccount, OffRampProvider, PayoutStatus, Quote, Receipt } from "./types";

/**
 * Tasa COP/USD ilustrativa, fija en el código — **no es una cotización de
 * mercado real** y no se actualiza contra ninguna API. Declarada acá, a la
 * vista de quien lea el código, tal como pide `docs/ARCHITECTURE.md` §5.
 * MockUSDT (`web/src/lib/token.ts`) se trata como paridad 1:1 con USD, que
 * es el diseño del token de prueba, no una cotización real tampoco.
 */
const TASA_COP_POR_USD_ILUSTRATIVA = 4100;

/** Comisión fija y plausible de un off-ramp con licencia (el orden de
 *  magnitud que cobran Littio/Koywe hoy). 150 bps = 1.5 %. */
const COMISION_BPS = 150;

/** MockUSDT tiene 6 decimales (`web/src/lib/token.ts`), único ERC-20 del
 *  proyecto — límite duro de `CLAUDE.md`. */
const DECIMALES_TOKEN = 6;

function bpsDe(monto: bigint, bps: number): bigint {
  return (monto * BigInt(bps)) / BigInt(10_000);
}

/** Unidades base de MockUSDT (10^6) a COP enteros, aplicando la tasa fija
 *  de arriba. COP no tiene subunidad de uso corriente, así que el
 *  resultado se trunca a entero. */
function tokenACop(monto: bigint, tasaCopPorUsd: number): bigint {
  return (monto * BigInt(Math.round(tasaCopPorUsd))) / BigInt(10 ** DECIMALES_TOKEN);
}

/** Comprobantes emitidos en esta sesión de página, solo para que `status()`
 *  tenga algo que responder. No persiste entre recargas — un comprobante
 *  simulado no tiene nada que recuperar: no hay dinero ni estado real
 *  detrás (docs/THREAT-MODEL.md punto 8). */
const comprobantes = new Map<string, Receipt>();

/**
 * Implementación mock de `OffRampProvider`. **No mueve dinero real y no
 * habla con ningún banco.** Sirve para que la pantalla `/retiro-cop/[dir]`
 * tenga algo real que llamar mientras no hay un proveedor con licencia
 * integrado (horizonte 2 de `docs/PITCH.md`).
 */
export class MockOffRamp implements OffRampProvider {
  async quote(amount: bigint, token: Address): Promise<Quote> {
    const comisionToken = bpsDe(amount, COMISION_BPS);
    const netoToken = amount - comisionToken;
    return {
      id: crypto.randomUUID(),
      token,
      montoToken: amount,
      tasaCopPorUsd: TASA_COP_POR_USD_ILUSTRATIVA,
      comisionBps: COMISION_BPS,
      comisionToken,
      netoToken,
      netoCop: tokenACop(netoToken, TASA_COP_POR_USD_ILUSTRATIVA),
      creadaEn: Date.now(),
    };
  }

  async execute(quote: Quote, account: BankAccount): Promise<Receipt> {
    const receipt: Receipt = {
      id: crypto.randomUUID(),
      quoteId: quote.id,
      status: "completado",
      cuenta: account,
      netoCop: quote.netoCop,
      referencia: crypto.randomUUID(),
      creadoEn: Date.now(),
      simulado: true,
      nota: "Comprobante simulado: no se movió dinero real ni se contactó a ningún banco.",
    };
    comprobantes.set(receipt.id, receipt);
    return receipt;
  }

  async status(receiptId: string): Promise<PayoutStatus> {
    return comprobantes.get(receiptId)?.status ?? "pendiente";
  }
}
