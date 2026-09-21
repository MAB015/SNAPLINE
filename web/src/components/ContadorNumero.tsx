"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Contador GSAP (docs/BRAND.md §10, inventario "Montos"): cuenta de 0 al
 * valor final una sola vez al montar, con desaceleracion (`power3.out`),
 * bajo 400ms.
 *
 * Hoy lo usa `TablaReparto` para los porcentajes (columna "Parte" y el
 * total del `tfoot`), pasando `formatearBps` como formateador. En D6 se
 * reutiliza tal cual para los montos de dinero de `/pool/[dir]`: solo cambia
 * el `valor` (centavos o unidad que corresponda) y el `formatear`.
 */
export function ContadorNumero({
  valor,
  formatear,
  className = "",
}: {
  /** Valor final ya en la unidad numerica que consume `formatear`. */
  valor: number;
  /** Formatea el numero animado a texto, ej. bps -> "40.00%". */
  formatear: (n: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    // docs/BRAND.md §10: con reduced motion, el valor final entra directo.
    mm.add("(prefers-reduced-motion: reduce)", () => {
      el.textContent = formatear(valor);
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const contador = { n: 0 };
      const tween = gsap.to(contador, {
        n: valor,
        duration: 0.38,
        ease: "power3.out",
        onUpdate: () => {
          el.textContent = formatear(contador.n);
        },
      });

      return () => {
        tween.kill();
      };
    });

    return () => {
      mm.revert();
    };
  }, [valor, formatear]);

  return (
    <span ref={ref} className={className}>
      {formatear(0)}
    </span>
  );
}
