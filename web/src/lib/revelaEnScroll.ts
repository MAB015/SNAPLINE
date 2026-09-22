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
    gsap.set(hijos, { opacity: 0, y: 16 });

    const tween = gsap.to(hijos, {
      opacity: 1,
      y: 0,
      duration: 0.38,
      ease: "power3.out",
      stagger: 0.08,
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
