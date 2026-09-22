import type { PrivyClientConfig } from "@privy-io/react-auth";
import { hashkeyTestnetParaPrivy } from "./wagmi";

export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

/**
 * Correo -> wallet embebida, o conectar la que ya se tiene: una sola puerta
 * (D-007, docs/ARCHITECTURE.md §3). `createOnLogin: "users-without-wallets"`
 * es lo que hace que quien entra por correo salga con dirección sin verla
 * elegir.
 */
export const privyConfig: PrivyClientConfig = {
  loginMethods: ["email", "wallet"],
  embeddedWallets: {
    ethereum: {
      createOnLogin: "users-without-wallets",
    },
  },
  defaultChain: hashkeyTestnetParaPrivy,
  supportedChains: [hashkeyTestnetParaPrivy],
  appearance: {
    walletChainType: "ethereum-only",
  },
};
