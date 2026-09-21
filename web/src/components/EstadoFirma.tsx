import type { EstadoFirma as Estado } from "@/lib/acuerdo";

/**
 * Estado de firma de una fila (docs/BRAND.md §8): chip con forma ademas de
 * color, para que se lea aunque no se distinga el color. Pendiente es un
 * contorno punteado; firmado se rellena con la textura de tinta de sello.
 *
 * El rojo `stamp` solo aparece aqui cuando ya esta firmado: repetido en cada
 * fila pendiente dejaria de pesar (docs/BRAND.md §6).
 */
export function EstadoFirma({ estado }: { estado: Estado }) {
  const firmado = estado === "firmado";

  if (firmado) {
    return (
      <span className="border-stamp inline-flex items-center gap-2 border px-2 py-1">
        <span className="tinta-sello h-2.5 w-2.5 shrink-0" aria-hidden="true" />
        <span className="text-ink mono text-xs tracking-wide uppercase">
          Firmado
        </span>
      </span>
    );
  }

  return (
    <span className="border-ink-60 inline-flex items-center gap-2 border border-dashed px-2 py-1">
      <span
        className="border-ink-60 h-2.5 w-2.5 shrink-0 border border-dashed"
        aria-hidden="true"
      />
      <span className="text-ink-60 mono text-xs tracking-wide uppercase">
        Pendiente
      </span>
    </span>
  );
}

/**
 * Estado del acuerdo completo. Antes de la ultima firma es texto plano; al
 * completarse pasa a ser la "plancha de cadena" de docs/BRAND.md §8: una
 * superficie `chain` real, no solo un color, con su propio `data-surface`
 * para que cualquier token que caiga adentro resuelva a su variante oscura.
 */
export function EstadoAcuerdo({
  firmadas,
  total,
}: {
  firmadas: number;
  total: number;
}) {
  const completo = firmadas === total;

  if (completo) {
    return (
      <p
        data-surface="chain"
        className="bg-chain text-on-chain mono inline-flex items-center px-3 py-2 text-xs tracking-wide uppercase"
      >
        Desplegado · pool en cadena
      </p>
    );
  }

  return (
    <p className="text-ink-60 mono text-xs tracking-wide uppercase">
      {`${firmadas} de ${total} firmas`}
    </p>
  );
}
