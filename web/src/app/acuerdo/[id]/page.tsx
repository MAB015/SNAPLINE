import { AcuerdoCliente } from "./AcuerdoCliente";

/**
 * D5: la pantalla se conecta al relay de Supabase y a HSKChain Testnet
 * (docs/ARCHITECTURE.md §3-4). `page.tsx` se queda como server component —
 * solo desenvuelve el `[id]` de la ruta — porque todo lo demás (Privy,
 * wagmi, firma EIP-712, escritura/lectura del relay) necesita hooks de
 * cliente, y un componente async no puede tener `"use client"` en el mismo
 * archivo. `AcuerdoCliente` es quien hace ese trabajo.
 */
export default async function PaginaAcuerdo({ params }: PageProps<"/acuerdo/[id]">) {
  const { id } = await params;
  return <AcuerdoCliente id={id} />;
}
