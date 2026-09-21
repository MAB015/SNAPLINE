import type { Address, PublicClient } from "viem";
import { MOCK_USDT_ADDRESS } from "./token";

/**
 * ABI mínimo de `SplitPool` (contracts/src/SplitPool.sol), el clon que
 * despliega `SplitPoolFactory` en `web/src/lib/firma.ts`. No hay dirección
 * literal acá: cada acuerdo tiene su propio pool, la dirección llega por el
 * parámetro `[dir]` de la ruta, nunca hardcodeada.
 *
 * El contrato no tiene función de depósito: los tokens llegan por
 * `transfer` directo (ver `web/src/lib/token.ts`) y el nativo por su
 * `receive()`. `totalReceived`/`releasable`/`withdrawn` son de vista pública,
 * así que "total recibido", "mi parte" y "ya retirado" se leen directo de la
 * cadena, sin ninguna tabla nueva en Supabase (límite duro del proyecto).
 */
export const splitPoolAbi = [
  {
    type: "function",
    name: "totalReceived",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "releasable",
    stateMutability: "view",
    inputs: [
      { name: "token", type: "address" },
      { name: "account", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "withdrawn",
    stateMutability: "view",
    inputs: [
      { name: "", type: "address" },
      { name: "", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [{ name: "token", type: "address" }],
    outputs: [{ name: "amount", type: "uint256" }],
  },
] as const;

export type CifrasPool = {
  totalRecibido: bigint;
  miParte: bigint;
  yaRetirado: bigint;
};

/** Las tres cifras de `TASKS.md` § D6 en una sola lectura: total recibido del
 *  pool, la parte liberable de `cuenta` y lo que `cuenta` ya retiró. Siempre
 *  en `MockUSDT` — único ERC-20 del proyecto (límite duro). */
export function leerCifrasPool(
  publicClient: PublicClient,
  pool: Address,
  cuenta: Address,
): Promise<CifrasPool> {
  return Promise.all([
    publicClient.readContract({
      address: pool,
      abi: splitPoolAbi,
      functionName: "totalReceived",
      args: [MOCK_USDT_ADDRESS],
    }),
    publicClient.readContract({
      address: pool,
      abi: splitPoolAbi,
      functionName: "releasable",
      args: [MOCK_USDT_ADDRESS, cuenta],
    }),
    publicClient.readContract({
      address: pool,
      abi: splitPoolAbi,
      functionName: "withdrawn",
      args: [MOCK_USDT_ADDRESS, cuenta],
    }),
  ]).then(([totalRecibido, miParte, yaRetirado]) => ({ totalRecibido, miParte, yaRetirado }));
}

/** Solo el total recibido, para cuando no hay wallet conectada todavía y por
 *  lo tanto no hay "mi parte" que calcular. */
export function leerTotalRecibido(publicClient: PublicClient, pool: Address): Promise<bigint> {
  return publicClient.readContract({
    address: pool,
    abi: splitPoolAbi,
    functionName: "totalReceived",
    args: [MOCK_USDT_ADDRESS],
  });
}
