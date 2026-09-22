import { defineChain } from "viem";
import { http } from "wagmi";
import { createConfig } from "@privy-io/wagmi";
import { addRpcUrlOverrideToChain } from "@privy-io/react-auth";

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

/**
 * El RPC público no manda `Access-Control-Allow-Origin`: un `fetch` directo
 * desde el navegador (Privy/wagmi, todo lo que use `usePublicClient()`) se
 * bloquea por CORS. `wagmiConfig` corre en el cliente, así que su transport
 * apunta al proxy same-origin (`web/src/app/api/rpc/route.ts`) en vez de a
 * `RPC_URL` directo. `RPC_URL` y `hashkeyTestnet.rpcUrls.default.http` se
 * dejan intactos: los sigue usando `web/src/app/api/goteo/route.ts`
 * server-side, donde no hay problema de CORS.
 */
export const wagmiConfig = createConfig({
  chains: [hashkeyTestnet],
  transports: {
    [hashkeyTestnet.id]: http("/api/rpc"),
  },
});

/**
 * `wagmiConfig` de arriba resuelve el CORS porque su `transport` pasa por el
 * proxy (`http("/api/rpc")`). Pero el cliente interno de Privy para wallets
 * embebidas (el que arma el modal "Approve transaction" y consulta saldo) no
 * lee `wagmiConfig`: lee el objeto de cadena que se le pasa en
 * `defaultChain`/`supportedChains` de `PrivyClientConfig`, y si ahí ve
 * `RPC_URL` (el externo, sin CORS) se traba igual que antes de existir el
 * proxy.
 *
 * `addRpcUrlOverrideToChain` es la función que expone `@privy-io/react-auth`
 * para esto (docs.privy.io/basics/react/advanced/configuring-evm-networks):
 * agrega una entrada `rpcUrls.privyWalletOverride` que el cliente de Privy
 * prioriza por encima de `rpcUrls.default` — no reemplaza `default`, así que
 * no hace falta duplicar `hashkeyTestnet` a mano con `defineChain`. Se deja
 * como export aparte, en vez de mutar `hashkeyTestnet`, porque ese objeto lo
 * siguen usando intactos `web/src/app/api/goteo/route.ts` y
 * `web/src/app/api/rpc/route.ts` (ambos server-side, sin problema de CORS,
 * necesitan la URL externa real y no `/api/rpc` — no hay `window.location`
 * de referencia ahí para resolver una ruta relativa).
 */
export const hashkeyTestnetParaPrivy = addRpcUrlOverrideToChain(hashkeyTestnet, "/api/rpc");
