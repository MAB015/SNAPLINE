"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Sello de tinta "SELLADO" (docs/BRAND.md §13, paso 3): cuando el bloque del
 * acuerdo cruza de `doc` a `chain`, cambia la superficie, cambia la textura
 * y aparece este sello. Reutiliza la textura `tinta-sello` (el mismo
 * `--raw-stamp` que ya usa el chip de `EstadoFirma`), no inventa un color ni
 * una mascara nueva.
 *
 * Entrada de golpe seco: escala + opacidad, `power3.out`, sin rebote ni
 * elastico (docs/BRAND.md §10 y §12 lo prohiben). Una sola vez.
 *
 * Autocontenido a proposito: `/acuerdo/[id]/page.tsx` es de la rama de
 * plataforma web y hoy hace el cruce `doc` -> `chain` como un swap de JSX
 * sin animacion. Este componente queda listo para que esa rama lo monte
 * dentro de la seccion `data-surface="chain"` cuando conecten la firma real.
 * El prop `activo` esta pensado para encadenarlo al callback
 * `onSnapCompleto` de `BarraSegmentada`: se monta con `activo={false}` (queda
 * invisible, sin ocupar layout raro porque ya nace en su tamano final, solo
 * transparente) y se pasa a `true` en el mismo callback, para que el sello
 * entre justo despues de que la linea termine de tensarse y las marcas
 * caigan.
 */
export function SelloTinta({
  activo = true,
  className = "",
}: {
  /** Si es false, el sello queda montado pero invisible hasta que el padre
   *  lo dispare. Por defecto se anima solo, apenas se monta. */
  activo?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activo) return;
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(el, { scale: 1, opacity: 1 });
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline();
      tl.fromTo(
        el,
        { scale: 0.7, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "power3.out" },
      );

      return () => {
        tl.kill();
      };
    });

    return () => {
      mm.revert();
    };
  }, [activo]);

  return (
    <div
      ref={ref}
      className={`border-stamp inline-flex items-center gap-2 border px-3 py-2 ${className}`}
      // Estado de reposo antes de dispararse: invisible. Igual que en
      // BarraSegmentada, esto se escribe inline para que el primer pintado
      // ya arranque ahi y GSAP solo anime desde ese punto, sin parpadeo.
      style={{ opacity: 0 }}
    >
      <span className="tinta-sello h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="text-stamp mono text-xs tracking-wide uppercase">
        Sellado
      </span>
    </div>
  );
}
