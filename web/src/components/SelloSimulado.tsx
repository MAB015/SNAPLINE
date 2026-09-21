/**
 * Sello de simulado (docs/BRAND.md §8 y §15).
 *
 * Bloque de filete en `caution` que ocupa espacio a proposito: tiene que
 * verse en el video sin que nadie lo senale. No es un tooltip ni una nota
 * al pie, y no se puede cerrar. Las franjas de precaucion (§7) se distinguen
 * aun en el tema oscuro o sin color, a diferencia de un fondo plano.
 */
export function SelloSimulado({ detalle }: { detalle?: string }) {
  return (
    <aside className="border-caution text-caution relative border px-4 py-3">
      <span
        className="franjas-precaucion pointer-events-none absolute inset-x-0 top-0 h-1.5"
        aria-hidden="true"
      />
      <p className="mono mt-1 text-xs tracking-wide uppercase">
        Simulado · no mueve dinero real
      </p>
      {detalle ? <p className="mt-1 text-xs">{detalle}</p> : null}
    </aside>
  );
}
