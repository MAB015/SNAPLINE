import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Reveal por scroll (docs/BRAND.md §10): mismo criterio que "Filas de la
 * tabla" del inventario cerrado de movimiento — entrada escalonada, una
 * sola vez — pero disparado por `ScrollTrigger` en vez de al montar. Es
 * para contenido bajo el pliegue de "/" (secciones "Para quién es" y
 * "Verificado en cadena"): el hero no lo necesita porque siempre está a la
 * vista al cargar y usa un temporizador simple (`EjemploBarraHero.tsx`).
 *
 * Anima los hijos DIRECTOS de `contenedor`: opacidad + un desplazamiento
 * vertical corto, sin escala ni glow (docs/BRAND.md §12 — el peso visual es
 * timing y desplazamiento, no luz). Bajo 400ms por pieza, `power3.out`, sin
 * rebote (docs/BRAND.md §10, reglas 2-3). `once: true` en el
 * `ScrollTrigger`: dispara una sola vez al entrar, no en cada scroll hacia
 * arriba y abajo.
 *
 * Devuelve la función de limpieza (`gsap.matchMedia().revert()`) para
 * llamar desde el cleanup del `useEffect` de quien la use.
 */
export function animarRevelaEnScroll(contenedor: HTMLElement): () => void {
  const hijos = Array.from(contenedor.children) as HTMLElement[];
  const mm = gsap.matchMedia();

  if (hijos.length === 0) {
    return () => mm.revert();
  }

  // docs/BRAND.md §10: con reduced motion, todo aparece en su estado final
  // sin transiciones.
  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set(hijos, { opacity: 1, y: 0 });
  });

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // 28px de desplazamiento (antes 16px) y 0.12s de stagger (antes 0.08s):
    // ajuste de magnitud para el layout de ancho completo de Fase A
    // (docs/DECISIONS.md D-044), no un cambio de mecanismo. Con la grilla de
    // "Verificado en cadena" en `lg:grid-cols-4`, las tarjetas quedan una al
    // lado de la otra en vez de apiladas en una columna angosta de 768px: un
    // desplazamiento de 16px se leía casi como un simple fundido a esa
    // distancia visual, y un stagger de 0.08s entre cuatro tarjetas en la
    // misma fila (0.24s de punta a punta) pasaba casi desapercibido al barrer
    // la vista horizontalmente. 28px es el tope del rango evaluado (24-28px)
    // por ser el mayor desplazamiento que sigue leyéndose como una entrada
    // corta y no como un deslizamiento largo. `duration` (0.38s) y `ease`
    // quedan sin cambios: es la duración POR PIEZA la que tiene que quedar
    // bajo 400ms (docs/BRAND.md §10 regla 3), no la ventana total del
    // stagger, y ese número ya cumplía antes de este ajuste.
    gsap.set(hijos, { opacity: 0, y: 28 });

    const tween = gsap.to(hijos, {
      opacity: 1,
      y: 0,
      duration: 0.38,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: {
        trigger: contenedor,
        start: "top 85%",
        once: true,
      },
    });

    return () => {
      tween.kill();
    };
  });

  return () => {
    mm.revert();
  };
}
