import { PagarCliente } from "./PagarCliente";

/**
 * D6 (TASKS.md § D6, docs/ARCHITECTURE.md §3): link público de cobro. `page.tsx`
 * se queda como server component — solo desenvuelve el `[dir]` de la ruta —
 * porque todo lo demás (Privy, wagmi, lectura/escritura de cadena) necesita
 * hooks de cliente. Mismo patrón que `/acuerdo/[id]/page.tsx`.
 */
export default async function PaginaPagar({ params }: PageProps<"/pagar/[dir]">) {
  const { dir } = await params;
  return <PagarCliente dir={dir} />;
}
