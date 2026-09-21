"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  formatearBps,
  tokenParticipante,
  type Participante,
} from "@/lib/acuerdo";

type Props = {
  participantes: Participante[];
  /** Cuando el acuerdo queda firmado, la linea se tensa una sola vez. */
  tensada?: boolean;
  /**
   * Se llama cuando termina la secuencia del snap (linea + marcas), pasos 1 y
   * 2 de docs/BRAND.md §13. Es un prop propio de este componente, no algo que
   * `page.tsx` tenga que pasar: si nadie lo usa, no pasa nada. Sirve para que
   * quien anime el paso 3 (el cruce de `doc` a `chain` y el sello de tinta,
   * ver `SelloTinta.tsx`) pueda encadenar esa animacion justo despues de que
   * esta termine, sin acoplar los dos componentes entre si.
   */
  onSnapCompleto?: () => void;
};

/** Posicion de cada corte, en porcentaje acumulado. El ultimo cierra en 100. */
function cortesAcumulados(participantes: Participante[]): number[] {
  return participantes.reduce<number[]>((cortes, p) => {
    const previo = cortes.length > 0 ? cortes[cortes.length - 1] : 0;
    return [...cortes, previo + p.bps / 100];
  }, []);
}

/**
 * El dispositivo de la linea (docs/BRAND.md §13).
 *
 * Una sola barra horizontal dividida en segmentos proporcionales: cada uno
 * lleva la trama de su participante en su color (§6-7), en lugar de tinta
 * lisa. Los cortes internos quedan marcados en `stamp`; el borde exterior
 * hace de extremo de linea. Sigue siendo un solo objeto, no cuatro
 * rectangulos sueltos.
 *
 * Por debajo de `sm` las etiquetas proporcionales no caben sin cortarse, asi
 * que se apilan. La barra, que es lo que carga la metafora, no cambia.
 *
 * El snap (pasos 1-2 de docs/BRAND.md §13) va con un timeline de GSAP, no con
 * las keyframes de CSS que existian antes: 1) la linea se tensa de 0 a 100%
 * de ancho con desaceleracion, bajo 380ms; 2) las marcas de corte aparecen de
 * golpe apenas termina, sin un fade largo. El estado "de reposo antes del
 * snap" (linea en scaleX(0), marcas en opacidad 0) se escribe directo en el
 * JSX cuando `tensada` es true, para que el primer pintado -- server o
 * cliente, antes de que el efecto corra -- ya arranque en ese punto y GSAP
 * solo anime desde ahi, sin parpadeo de "linea completa que se encoje".
 */
export function BarraSegmentada({
  participantes,
  tensada = false,
  onSnapCompleto,
}: Props) {
  const cortes = cortesAcumulados(participantes);
  const cortesInternos = cortes.slice(0, -1);

  const lineaRef = useRef<HTMLDivElement>(null);
  const marcasRef = useRef<HTMLDivElement>(null);
  const onSnapCompletoRef = useRef(onSnapCompleto);

  useEffect(() => {
    onSnapCompletoRef.current = onSnapCompleto;
  }, [onSnapCompleto]);

  useEffect(() => {
    if (!tensada) return;
    const linea = lineaRef.current;
    const marcas = marcasRef.current;
    if (!linea || !marcas) return;

    const disparar = () => onSnapCompletoRef.current?.();
    const mm = gsap.matchMedia();

    // docs/BRAND.md §10: con reduced motion, todo aparece en su estado final
    // sin transiciones.
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(linea, { scaleX: 1 });
      gsap.set(marcas, { opacity: 1 });
      disparar();
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ onComplete: disparar });
      tl.fromTo(
        linea,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.38, ease: "power3.out", transformOrigin: "left center" },
      ).fromTo(
        marcas,
        { opacity: 0 },
        // Golpe corto, no un fade largo: "las marcas caen de golpe".
        { opacity: 1, duration: 0.1, ease: "power1.out" },
      );

      return () => {
        tl.kill();
      };
    });

    return () => {
      mm.revert();
    };
  }, [tensada]);

  return (
    <figure className="m-0">
      <div
        ref={lineaRef}
        className="border-ink relative h-8 border"
        style={tensada ? { transform: "scaleX(0)", transformOrigin: "left center" } : undefined}
      >
        <div className="flex h-full w-full overflow-hidden" aria-hidden="true">
          {participantes.map((p, i) => (
            <div
              key={p.direccion}
              className={`trama-${tokenParticipante(i)} h-full`}
              style={{ width: `${p.bps / 100}%` }}
            />
          ))}
        </div>

        <div
          ref={marcasRef}
          className="pointer-events-none absolute inset-0"
          style={tensada ? { opacity: 0 } : undefined}
          aria-hidden="true"
        >
          {cortesInternos.map((x, i) => (
            <span
              key={participantes[i].direccion}
              className="bg-stamp absolute top-0 h-full w-px"
              style={{ left: `${x}%` }}
            />
          ))}
        </div>
      </div>

      <figcaption className="mt-3">
        {/* Proporcional: cada etiqueta cuelga del segmento que le toca. */}
        <div className="hidden sm:flex">
          {participantes.map((p, i) => (
            <div
              key={p.direccion}
              className={i === participantes.length - 1 ? "" : "pr-4"}
              style={{ width: `${p.bps / 100}%` }}
            >
              <div className="mono text-sm">{formatearBps(p.bps)}</div>
              <div className="text-ink-60 flex items-center gap-1.5 text-xs">
                <span
                  className={`trama-${tokenParticipante(i)} h-2 w-2 shrink-0`}
                  aria-hidden="true"
                />
                {p.nombre}
              </div>
            </div>
          ))}
        </div>

        {/* Apilado: mismo contenido, sin cortar cifras. */}
        <ul className="sm:hidden">
          {participantes.map((p, i) => (
            <li
              key={p.direccion}
              className="border-rule flex items-center justify-between border-b py-2"
            >
              <span className="text-ink-60 flex items-center gap-1.5 text-xs">
                <span
                  className={`trama-${tokenParticipante(i)} h-2 w-2 shrink-0`}
                  aria-hidden="true"
                />
                {p.nombre}
              </span>
              <span className="mono text-sm">{formatearBps(p.bps)}</span>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
