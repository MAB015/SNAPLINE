"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { animarRevelaEnScroll } from "@/lib/revelaEnScroll";

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * Envolturas finas de reveal por scroll (docs/BRAND.md §10, ver
 * `lib/revelaEnScroll.ts` para la animación compartida). Dos variantes en
 * vez de una sola polimórfica: cada una fija el elemento exacto que ya
 * usaba el markup de "/" — `<ul>` para la lista de "Para quién es",
 * `<div>` para la grilla de tarjetas de "Verificado en cadena" — sin
 * introducir tipado genérico de `ref` por tag dinámico. `page.tsx` es un
 * componente de servidor; estas envolturas son de cliente (necesitan
 * `useEffect`/GSAP), mismo patrón que `EjemploBarraHero.tsx` — reciben el
 * contenido ya renderizado como `children` de servidor.
 *
 * La clase `revela-en-scroll` (`globals.css`) deja los hijos directos en
 * `opacity:0`/desplazados desde el primer pintado -- servidor o cliente,
 * antes de que este `useEffect` corra -- para no repetir el parpadeo que ya
 * se corrigió en `ContadorNumero` (D5): sin ese estado de reposo en CSS, el
 * contenido aparecería completo, luego GSAP lo escondería, y recién
 * entonces animaría de vuelta al entrar en viewport. El `gsap.set` dentro de
 * `animarRevelaEnScroll` deja el mismo valor (no-op) antes de animar hacia
 * adelante. Con `prefers-reduced-motion: reduce` la media query de esa clase
 * ni aplica, así que el contenido nunca pasa por oculto.
 */
export function RevelaEnScrollUl({ children, className = "" }: Props) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return animarRevelaEnScroll(el);
  }, []);

  return (
    <ul ref={ref} className={`revela-en-scroll ${className}`}>
      {children}
    </ul>
  );
}

export function RevelaEnScrollDiv({ children, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return animarRevelaEnScroll(el);
  }, []);

  return (
    <div ref={ref} className={`revela-en-scroll ${className}`}>
      {children}
    </div>
  );
}
