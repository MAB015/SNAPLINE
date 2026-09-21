"use client";

import { useEffect, useState } from "react";
import { BarraSegmentada } from "@/components/BarraSegmentada";
import { ACUERDO_DE_MUESTRA } from "@/lib/acuerdo";

/** Respiro breve antes de que la línea del hero se tense (ms). */
const RETRASO_AUTOPLAY_MS = 350;

/**
 * Barra segmentada del hero de "/" (D-039): mismo componente y el mismo
 * acuerdo de muestra que ya usa el resto de la app (docs/DEMO-SCRIPT.md),
 * rotulado como ejemplo para que nadie lo lea como un acuerdo real propio.
 *
 * Autoplay del hero: `tensada` arranca en `false` y pasa a `true` con un
 * temporizador corto al montar (no un `IntersectionObserver` — el hero es la
 * primera sección de "/" y siempre está en el viewport ni bien carga, sin
 * necesidad de scroll). El retraso es solo un acento de entrada, no una
 * espera larga. `BarraSegmentada` ya resuelve `prefers-reduced-motion`
 * internamente con `gsap.matchMedia` (salta al estado final sin transición),
 * así que esa lógica no se duplica acá; lo único que hace este componente es
 * saltarse el propio temporizador cuando reduced motion está activo, para no
 * imponerle al usuario una espera artificial sin sentido: con reduced motion
 * el retraso es 0 (dispara en el próximo tick, sin espera perceptible) en vez
 * del respiro completo.
 */
export function EjemploBarraHero() {
  const [tensada, setTensada] = useState(false);

  useEffect(() => {
    const prefiereMenosMovimiento = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const id = setTimeout(
      () => setTensada(true),
      prefiereMenosMovimiento ? 0 : RETRASO_AUTOPLAY_MS,
    );
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="mt-10">
      <p className="mono text-ink-60 text-xs tracking-wide uppercase">
        Ejemplo — Campaña Tropicana
      </p>
      <div className="mt-3">
        <BarraSegmentada
          participantes={ACUERDO_DE_MUESTRA.participantes}
          tensada={tensada}
        />
      </div>
    </div>
  );
}
