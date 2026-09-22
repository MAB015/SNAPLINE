import { RetiroCopCliente } from "./RetiroCopCliente";

/**
 * D7 (TASKS.md § D7, docs/ARCHITECTURE.md §3, §5): salida a pesos
 * simulada. `page.tsx` se queda como server component — solo desenvuelve
 * el `[dir]` de la ruta — mismo patrón que `/pool/[dir]/page.tsx`.
 */
export default async function PaginaRetiroCop({ params }: PageProps<"/retiro-cop/[dir]">) {
  const { dir } = await params;
  return <RetiroCopCliente dir={dir} />;
}
