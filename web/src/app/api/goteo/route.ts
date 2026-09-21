import { NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http, isAddress, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hashkeyTestnet } from "@/lib/wagmi";

/**
 * Goteo de gas (TASKS.md D4). Corre solo en el servidor: `DEPLOYER_PRIVATE_KEY`
 * nunca llega al navegador. Cantidad chica y fija, suficiente para las
 * transacciones de un participante en el demo (firmar es gratis, fuera de
 * cadena; retirar y desplegar el pool sí gastan gas).
 *
 * Idempotente por diseño: solo gotea si el saldo actual es cero. Una wallet
 * ya fondeada, por el goteo o a mano, no vuelve a recibir.
 */
const MONTO_GOTEO = parseEther("0.01");

export async function POST(request: Request) {
  const { direccion } = await request.json();

  if (typeof direccion !== "string" || !isAddress(direccion)) {
    return NextResponse.json({ error: "Dirección inválida" }, { status: 400 });
  }

  const clavePrivada = process.env.DEPLOYER_PRIVATE_KEY;
  if (!clavePrivada) {
    return NextResponse.json(
      { error: "DEPLOYER_PRIVATE_KEY no está configurada en web/.env.local" },
      { status: 500 },
    );
  }

  const publicClient = createPublicClient({
    chain: hashkeyTestnet,
    transport: http(),
  });

  const saldo = await publicClient.getBalance({ address: direccion });
  if (saldo !== BigInt(0)) {
    return NextResponse.json({ goteado: false, motivo: "ya tiene saldo" });
  }

  const cuentaDespliegue = privateKeyToAccount(
    clavePrivada.startsWith("0x") ? (clavePrivada as `0x${string}`) : `0x${clavePrivada}`,
  );
  const walletClient = createWalletClient({
    account: cuentaDespliegue,
    chain: hashkeyTestnet,
    transport: http(),
  });

  const hash = await walletClient.sendTransaction({
    to: direccion,
    value: MONTO_GOTEO,
  });

  return NextResponse.json({ goteado: true, hash });
}
