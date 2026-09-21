/**
 * Sello de simulado (docs/BRAND.md §8).
 *
 * Bloque de filete en `caution` que ocupa espacio a proposito: tiene que
 * verse en el video sin que nadie lo senale. No es un tooltip ni una nota
 * al pie, y no se puede cerrar.
 */
export function SelloSimulado({ detalle }: { detalle?: string }) {
  return (
    <aside className="border border-caution px-4 py-3 text-caution">
      <p className="mono text-xs uppercase tracking-wide">
        Simulado · no mueve dinero real
      </p>
      {detalle ? <p className="mt-1 text-xs">{detalle}</p> : null}
    </aside>
  );
}
