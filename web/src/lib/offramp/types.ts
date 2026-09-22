import type { Address } from "viem";

/**
 * Tipos de la interfaz de salida a pesos (docs/ARCHITECTURE.md §5). La
 * forma es la de un proveedor real — Littio, Koywe, Bitso Business son los
 * candidatos del horizonte 2 (docs/PITCH.md) — aunque en el MVP la única
 * implementación es `MockOffRamp` (`./mock.ts`).
 */

/** Estados posibles de un comprobante. En el mock la transición es
 *  instantánea: `execute` ya devuelve `"completado"`. Un proveedor real
 *  dejaría rieles bancarios entre medio y usaría `"pendiente"`/`"fallido"`
 *  de verdad; `status()` existe en la interfaz para ese caso, no para el
 *  mock. */
export type PayoutStatus = "pendiente" | "completado" | "fallido";

/** Cuenta bancaria destino. Sin validación real: el mock no habla con
 *  ningún banco, así que no hay nada que validar contra un tercero
 *  (docs/THREAT-MODEL.md punto 8 — no hay riesgo financiero porque no hay
 *  dinero moviéndose). */
export type BankAccount = {
  titular: string;
  numeroCuenta: string;
};

/** Cotización: tasa, comisión y neto, fijadas en el momento de pedirla. */
export type Quote = {
  id: string;
  token: Address;
  montoToken: bigint;
  /** COP por 1 USD. Ilustrativa, no de mercado — ver `mock.ts`. */
  tasaCopPorUsd: number;
  comisionBps: number;
  comisionToken: bigint;
  netoToken: bigint;
  netoCop: bigint;
  creadaEn: number;
};

/** Comprobante de una ejecución. `simulado` y `nota` dejan constancia
 *  explícita en el dato mismo, no solo en el sello visual de la pantalla —
 *  "se dice en tres lugares" (docs/ARCHITECTURE.md §5). */
export type Receipt = {
  id: string;
  quoteId: string;
  status: PayoutStatus;
  cuenta: BankAccount;
  netoCop: bigint;
  referencia: string;
  creadoEn: number;
  simulado: true;
  nota: string;
};

/** Forma exacta acordada en `docs/ARCHITECTURE.md` §5: convierte el
 *  roadmap de "algún día integramos algo" en "el hueco ya tiene la forma
 *  del enchufe". */
export interface OffRampProvider {
  quote(amount: bigint, token: Address): Promise<Quote>;
  execute(quote: Quote, account: BankAccount): Promise<Receipt>;
  status(receiptId: string): Promise<PayoutStatus>;
}
