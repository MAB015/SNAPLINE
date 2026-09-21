import { formatUnits, parseUnits, type Address } from "viem";

/**
 * ABI mínimo de `MockUSDT` (contracts/src/MockUSDT.sol) y dirección de
 * `deployments/hashkey-testnet.json`. Mismo patrón que `web/src/lib/firma.ts`:
 * literal en vez de importar el JSON entre paquetes, porque `web/` es la raíz
 * de build de Next.js/Vercel y un import fuera de ella no sobrevive el
 * despliegue.
 *
 * `mint` es intencionalmente público y sin permisos en el contrato (faucet de
 * testnet): cualquiera puede acuñar para cualquier dirección, no solo para sí
 * mismo. `transfer` no devuelve `bool` — el contrato imita el USDT real, que
 * tampoco lo hace — así que el ABI declara `outputs: []` en vez de un booleano
 * que nunca llega.
 */
export const MOCK_USDT_ADDRESS: Address = "0xc84d2E59be565EDd8e6394127390E7fdD295b2D6";
export const MOCK_USDT_DECIMALS = 6;
export const MOCK_USDT_SYMBOL = "mUSDT";

export const mockUsdtAbi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

/** "1234.5" (mUSDT) -> unidades base de 6 decimales. Lanza si el texto no es
 *  un número válido — quien llama decide qué hacer con eso. */
export function montoAUnidades(monto: string): bigint {
  return parseUnits(monto, MOCK_USDT_DECIMALS);
}

/** Unidades base -> "1234.500000" para mostrar (formatUnits ya trae los
 *  ceros a la derecha; no hace falta redondear para una pantalla de saldo). */
export function unidadesAMonto(unidades: bigint): string {
  return formatUnits(unidades, MOCK_USDT_DECIMALS);
}
