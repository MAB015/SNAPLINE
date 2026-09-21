import { NextResponse } from "next/server";
import { hashkeyTestnet } from "@/lib/wagmi";

/**
 * Proxy same-origin al RPC de HSKChain Testnet (bug bloqueante en
 * verificación conductual D5/D6). El RPC público no manda
 * `Access-Control-Allow-Origin`, así que un `fetch` JSON-RPC hecho desde el
 * navegador (Privy/wagmi vía `usePublicClient()`) se bloquea por CORS. Este
 * endpoint corre server-side — igual que `web/src/app/api/goteo/route.ts` —
 * y reenvía el POST tal cual, sin restricción de CORS porque es
 * server-to-server.
 *
 * `wagmiConfig` (ver `web/src/lib/wagmi.ts`) apunta su `transport` acá en vez
 * de al RPC externo directo. `hashkeyTestnet.rpcUrls.default.http` se deja
 * intacto: lo sigue usando `api/goteo/route.ts` server-side, donde no hay
 * problema de CORS.
 */
const RPC_URL = hashkeyTestnet.rpcUrls.default.http[0];

export async function POST(request: Request) {
  const body = await request.text();

  const respuesta = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const datos = await respuesta.text();

  return new NextResponse(datos, {
    status: respuesta.status,
    headers: { "Content-Type": "application/json" },
  });
}
