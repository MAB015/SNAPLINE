"use client";

import { useState } from "react";
import { BarraSegmentada } from "@/components/BarraSegmentada";
import { ACUERDO_DE_MUESTRA } from "@/lib/acuerdo";

/**
 * Barra segmentada del hero de "/" (D-039): mismo componente y el mismo
 * acuerdo de muestra que ya usa el resto de la app (docs/DEMO-SCRIPT.md),
 * rotulado como ejemplo para que nadie lo lea como un acuerdo real propio.
 *
 * PENDIENTE — segundo paso de creative-director sobre este mismo archivo:
 * `tensada` arranca en `false` a propósito, así que hoy la línea se ve en su
 * estado de reposo (sin snap). El autoplay del hero — cuándo y con qué
 * disparador pasa a `true` (temporizador corto al montar, o un
 * IntersectionObserver si el hero no siempre está en el viewport al cargar)
 * — se cablea acá mismo, tocando el `useState` de abajo. No hace falta tocar
 * `BarraSegmentada` ni `page.tsx` para eso.
 */
export function EjemploBarraHero() {
  const [tensada] = useState(false);

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
