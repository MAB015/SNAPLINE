"use client";

import Link from "next/link";
import { InterruptorTema } from "@/components/InterruptorTema";

/**
 * Barra compartida en las seis pantallas: "SNAPLINE" a la izquierda,
 * `InterruptorTema` a la derecha. Mismo lugar y mismo aspecto en todas —
 * pedido explícito del usuario tras ver el interruptor en un sitio distinto
 * en cada captura. Se monta como primer hijo dentro de cada
 * `<ProveedorTema>` (no en `layout.tsx`, que es territorio de `web`), así
 * que el interruptor deja de estar suelto en cada pantalla y vive acá.
 *
 * Ancho completo real, sin `max-w-3xl`: así el aspecto es idéntico en la
 * landing a ancho completo (D-045) y en las cinco pantallas de columna
 * angosta, sin que el cap de contenido de cada `<main>` la recorte de forma
 * distinta. El padding horizontal replica el de la landing
 * (`px-6 sm:px-8 lg:px-16`) para que la marca quede alineada con el
 * contenido de esa pantalla también.
 *
 * "SNAPLINE" en serif (docs/BRAND.md §5: títulos y encabezados en Instrument
 * Serif) a `text-lg` (20, el primer peldaño "grande" de la escala 12·14·16·
 * 20·32·56) — voz de marca, pero por debajo de los `<h1>` de cada pantalla
 * (32/56) para no competir con ellos.
 *
 * Filete inferior de 1px en `rule`, no sombra (docs/BRAND.md §12: cero
 * degradados, cero sombras, cero esquinas redondeadas — regla dura, no
 * estilo).
 */
export function NavBar() {
  return (
    <nav className="border-b border-rule">
      <div className="mx-auto flex w-full items-center justify-between px-6 py-4 sm:px-8 lg:px-16">
        <Link href="/" className="font-serif text-lg leading-none">
          SNAPLINE
        </Link>
        <InterruptorTema />
      </div>
    </nav>
  );
}
