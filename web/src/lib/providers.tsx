"use client";

import { useEffect, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { useAccount, useBalance } from "wagmi";
import { PRIVY_APP_ID, privyConfig } from "./privy";
import { wagmiConfig } from "./wagmi";

const queryClient = new QueryClient();

/**
 * Goteo de gas (TASKS.md D4): una wallet embebida recién creada tiene saldo
 * cero y no puede ni retirar. En cuanto una cuenta conectada aparece con
 * saldo cero se pide un goteo al backend, que manda desde la cuenta de
 * despliegue. La clave privada nunca sale del servidor — ver
 * `web/src/app/api/goteo/route.ts`.
 *
 * Se pide por cada dirección una sola vez por sesión de pestaña: el servidor
 * ya es idempotente (no gotea si el saldo no es cero), esto solo evita
 * pedidos repetidos mientras el saldo tarda en reflejarse.
 */
function GoteoDeGas() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const pedidos = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!isConnected || !address || balance === undefined) return;
    if (balance.value !== BigInt(0)) return;
    if (pedidos.current.has(address)) return;
    pedidos.current.add(address);

    fetch("/api/goteo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direccion: address }),
    }).catch(() => {
      // Sin goteo la demo sigue: el participante puede fondearse a mano con
      // el faucet de HSK. Se avisa en consola, no se interrumpe el flujo.
      console.warn("Goteo de gas falló para", address);
    });
  }, [address, isConnected, balance]);

  return null;
}

/**
 * Sin `NEXT_PUBLIC_PRIVY_APP_ID` el SDK de Privy revienta al montar (y con
 * él, la prerenderización de toda la app: `/` no tiene nada que ver con
 * identidad). Sin la variable, el sitio se sirve sin Privy/wagmi — sin
 * login ni escritura en el relay, pero sin tumbar `npm run build` — y se
 * avisa una sola vez en consola. Con la variable puesta, este atajo no se
 * toca.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  if (!PRIVY_APP_ID) {
    if (typeof window !== "undefined") {
      console.warn(
        "NEXT_PUBLIC_PRIVY_APP_ID no está configurada en web/.env.local: identidad y firma deshabilitadas.",
      );
    }
    return children;
  }

  return (
    <PrivyProvider appId={PRIVY_APP_ID} config={privyConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <GoteoDeGas />
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
