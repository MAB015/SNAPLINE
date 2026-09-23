"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useBlockNumber } from "wagmi";

/**
 * Indicador de red (docs/BRAND.md §8): "HSKChain Testnet · bloque #…" fijo,
 * en mono, con el numero de bloque leido en vivo (`useBlockNumber({ watch:
 * true })`, el equivalente reactivo de mirar la cadena bloque a bloque) y un
 * pulso corto que marca cada bloque nuevo.
 *
 * Reemplaza el texto estatico que hoy repiten `PagarCliente.tsx` y
 * `PoolCliente.tsx` a mano ("HSKChain Testnet · pago real, link publico" /
 * "· lectura directa de cadena"): `detalle` conserva esa cola especifica de
 * cada pantalla sin duplicar el componente, mismo patron que `detalle` en
 * `SelloSimulado`.
 *
 * El pulso es un punto de 1.5px que pega un golpe corto de opacidad/escala
 * (menos de 400ms, docs/BRAND.md §10) cada vez que cambia el numero de
 * bloque — no un glow ni un loop. Con reduced motion, el punto se queda fijo
 * en su estado de reposo.
 */
export function IndicadorRed({
  detalle,
  className = "",
}: {
  /** Cola despues de "HSKChain Testnet · bloque #N", ej. "pago real, link público". */
  detalle?: string;
  className?: string;
}) {
  const { data: bloque } = useBlockNumber({ watch: true });
  const pulsoRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (bloque === undefined) return;
    const el = pulsoRef.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    // docs/BRAND.md §10: con reduced motion, el punto se queda en reposo,
    // sin animar en cada bloque nuevo.
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(el, { opacity: 1, scale: 1 });
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline();
      tl.fromTo(
        el,
        { opacity: 1, scale: 1 },
        { opacity: 1, scale: 1.8, duration: 0.12, ease: "power2.out" },
      ).to(el, { scale: 1, duration: 0.22, ease: "power3.out" });

      return () => {
        tl.kill();
      };
    });

    return () => {
      mm.revert();
    };
  }, [bloque]);

  return (
    <p
      className={`mono border-rule text-ink-60 flex items-center gap-2 border px-3 py-2 text-xs tracking-wide uppercase ${className}`}
    >
      <span ref={pulsoRef} className="bg-ink-60 inline-block h-1.5 w-1.5 shrink-0" aria-hidden="true" />
      <span>
        HSKChain Testnet · bloque #{bloque !== undefined ? bloque.toString() : "…"}
        {detalle ? ` · ${detalle}` : ""}
      </span>
    </p>
  );
}
