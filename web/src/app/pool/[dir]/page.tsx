import { PoolCliente } from "./PoolCliente";

/**
 * D6 (TASKS.md § D6, docs/ARCHITECTURE.md §3): pantalla de participante del
 * pool. `page.tsx` se queda como server component — solo desenvuelve el
 * `[dir]` de la ruta — mismo patrón que `/acuerdo/[id]/page.tsx`.
 */
export default async function PaginaPool({ params }: PageProps<"/pool/[dir]">) {
  const { dir } = await params;
  return <PoolCliente dir={dir} />;
}
