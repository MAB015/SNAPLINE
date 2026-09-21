"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { abreviarDireccion, urlExplorador } from "@/lib/acuerdo";

gsap.registerPlugin(ScrambleTextPlugin);

/**
 * Hash vivo (docs/BRAND.md §9): hover despliega el valor completo, clic
 * copia y cambia la etiqueta a "copiado" en el mismo sitio (sin toasts), y
 * un icono de 1px abre el explorador. Al aparecer, el valor abreviado se
 * descifra caracter por caracter con `ScrambleTextPlugin` de GSAP, una sola
 * vez, al montar — no en cada hover ni en cada clic.
 *
 * El span con el valor abreviado se queda siempre montado (nunca se
 * desmonta al copiar) para que el scramble no se vuelva a disparar cada vez
 * que la etiqueta "copiado" desaparece y el valor vuelve a mostrarse: eso
 * repetiria la animacion, y la regla es "una vez, no en bucle".
 */
/** `doc` (por defecto) usa `ink`, pensado para el papel. `chain` usa
 *  `on-chain`: sin esto, un hash dentro del bloque sellado quedaria en
 *  `ink` (casi negro) sobre el fondo oscuro de la superficie `chain` y se
 *  volveria ilegible en tema claro, donde `ink` tambien es oscuro. */
type Superficie = "doc" | "chain";

const TEXTO_POR_SUPERFICIE: Record<Superficie, string> = {
  doc: "text-ink-60 hover:text-ink",
  chain: "text-on-chain/70 hover:text-on-chain",
};

export function HashVivo({
  valor,
  superficie = "doc",
  className = "",
}: {
  valor: string;
  superficie?: Superficie;
  className?: string;
}) {
  const [copiado, setCopiado] = useState(false);
  const colorTexto = TEXTO_POR_SUPERFICIE[superficie];
  const abreviado = abreviarDireccion(valor);
  const scrambleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = scrambleRef.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    // docs/BRAND.md §10: con reduced motion, el valor final entra directo,
    // sin pasar por el plugin de scramble.
    mm.add("(prefers-reduced-motion: reduce)", () => {
      el.textContent = abreviado;
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tween = gsap.to(el, {
        duration: 0.6,
        ease: "none",
        scrambleText: {
          text: abreviado,
          chars: "0123456789abcdef",
          speed: 0.4,
        },
      });

      return () => {
        tween.kill();
      };
    });

    return () => {
      mm.revert();
    };
  }, [abreviado]);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // Sin portapapeles disponible (permisos, http): no hay nada mas que
      // hacer que dejar el valor visible para copiarlo a mano.
    }
  }

  return (
    <span className={`group/hash relative inline-flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={copiar}
        aria-label={`Copiar ${valor}`}
        className={`mono text-xs -m-1 p-1 ${colorTexto}`}
      >
        {/* El span del valor abreviado se queda siempre en el DOM (ver
            comentario de arriba): "copiado" lo tapa con un span aparte en
            lugar de reemplazarlo, para no desmontar el que anima el scramble. */}
        <span className={copiado ? "hidden" : ""} ref={scrambleRef}>
          {abreviado}
        </span>
        {copiado ? <span>copiado</span> : null}
      </button>

      {/* El tooltip siempre se ve como papel, sea cual sea la superficie de
          debajo: es una anotacion efimera, no parte del bloque. */}
      <span
        role="presentation"
        data-surface="doc"
        className="border-rule bg-doc text-ink pointer-events-none absolute -top-8 left-0 z-10 border px-2 py-1 text-xs whitespace-nowrap opacity-0 transition-opacity group-hover/hash:opacity-100 group-focus-within/hash:opacity-100 mono"
      >
        {valor}
      </span>

      <a
        href={urlExplorador(valor)}
        target="_blank"
        rel="noreferrer"
        aria-label="Ver en el explorador de HSKChain"
        className={`-m-2 p-2 ${colorTexto}`}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M4 1H9V6" stroke="currentColor" />
          <path d="M9 1 4 6" stroke="currentColor" />
          <path d="M6.5 1H1V9H8.5V3.5" stroke="currentColor" />
        </svg>
      </a>
    </span>
  );
}
