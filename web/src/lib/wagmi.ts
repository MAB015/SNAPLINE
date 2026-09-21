import { defineChain } from "viem";
import { http } from "wagmi";
import { createConfig } from "@privy-io/wagmi";

/**
 * Valores de `deployments/hashkey-testnet.json` (raíz del repo). Se copian
 * como literales en vez de importar el JSON entre paquetes: `web/` es la raíz
 * de build de Next.js/Vercel y un import fuera de ella no sobrevive el
 * despliegue.
 */
const RPC_URL = "https://testnet.hsk.xyz";
const EXPLORER_URL = "https://testnet-explorer.hskchain.net";
const CHAIN_ID = 133;

/**
 * viem trae "HSKChain Testnet" con un `blockExplorers.default.url` que no
 * resuelve (`testnet-explorer.hsk.xyz`, con "chain" fuera de lugar). Se
 * redefine la cadena entera con el explorador real en vez de parchear la de
 * viem: así el resto del código lee una sola fuente de verdad.
 */
export const hashkeyTestnet = defineChain({
  id: CHAIN_ID,
  name: "HSKChain Testnet",
  nativeCurrency: { name: "HashKey Testnet Token", symbol: "HSK", decimals: 18 },
  rpcUrls: {
    default: { http: [RPC_URL] },
  },
  blockExplorers: {
    default: {
      name: "HashKey Chain Testnet Explorer",
      url: EXPLORER_URL,
    },
  },
  testnet: true,
});

export const wagmiConfig = createConfig({
  chains: [hashkeyTestnet],
  transports: {
    [hashkeyTestnet.id]: http(RPC_URL),
  },
});
