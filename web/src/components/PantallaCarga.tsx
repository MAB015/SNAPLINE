"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * Pantalla de carga de marca al abrir SNAPLINE. Encargo puntual del CEO, no
 * estaba en `TASKS.md`: es lo primero que ve cada toma del video, asi que
 * tiene que cumplir `docs/BRAND.md` al pie de la letra, no ser un spinner
 * generico.
 *
 * Es una prima de `BarraSegmentada`/`ContadorNumero`, no un componente con
 * estetica propia: linea recta con corte duro, sin degradados ni sombras ni
 * esquinas redondeadas, numero de porcentaje en mono con numerales
 * tabulares, y el mismo patron de `gsap.matchMedia` para separar el caso de
 * `prefers-reduced-motion` del caso animado.
 *
 * DURACION: docs/BRAND.md §10 limita cada pieza a <400ms "salvo la secuencia
 * del snap". Esta pantalla es la segunda excepcion razonable por la misma
 * logica que ahi se le da al snap: una barra de 0 a 100% en 380ms se leeria
 * como un parpadeo, no como una intro de marca. Se elige un tramo perceptible
 * (1.4s) sin buscar un numero magico.
 */
const DURACION_SEGUNDOS = 1.4;

/**
 * Honestidad (nota directa de CEO): esta barra es de tiempo fijo, no
 * representa una carga real de datos, wallet ni conexion — no hay assets
 * pesados que cargar en esta pantalla. Por eso la copia visible es neutra
 * ("iniciando" + el numero), nunca algo que insinue una operacion real como
 * "Conectando a HSKChain Testnet…" o "Verificando firma…".
 */
const ETIQUETA = "iniciando";

/**
 * Clave de sesion para no repetir la intro completa si el usuario vuelve a
 * "/" dentro de la misma sesion de SPA (ej. con el boton atras). Se decide
 * despues del primer render, nunca durante el, para que el HTML del primer
 * pintado — servidor o cliente, antes de que el efecto corra — sea siempre
 * el mismo (la pantalla completa en su estado de reposo) y no haya un
 * desajuste de hidratacion entre lo que Next manda por SSR (que no tiene
 * `sessionStorage`) y lo que decide el cliente. El efecto la retira en el
 * mismo ciclo de render, asi que en la practica no se percibe una segunda
 * vez.
 */
const CLAVE_SESION = "snapline:intro-vista";

function marcarVista() {
  try {
    sessionStorage.setItem(CLAVE_SESION, "1");
  } catch {
    // Sin sessionStorage disponible (privado/bloqueado): no es un caso que
    // valga la pena resolver mejor, simplemente se repite la intro.
  }
}

function yaFueVista(): boolean {
  try {
    return sessionStorage.getItem(CLAVE_SESION) === "1";
  } catch {
    return false;
  }
}

export function PantallaCarga() {
  const [terminado, setTerminado] = useState(false);
  const lineaRef = useRef<HTMLDivElement>(null);
  const porcentajeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const linea = lineaRef.current;
    const porcentaje = porcentajeRef.current;
    if (!linea || !porcentaje) return;

    const mm = gsap.matchMedia();

    // docs/BRAND.md §10: con reduced motion, todo aparece en su estado final
    // sin transiciones. Aca eso significa no mostrar la barra en 100% y
    // recien despues retirarla: no tiene sentido tapar el contenido con un
    // delay artificial tan largo como la animacion si no va a haber
    // movimiento. Se retira directo.
    mm.add("(prefers-reduced-motion: reduce)", () => {
      setTerminado(true);
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (yaFueVista()) {
        setTerminado(true);
        return;
      }

      const contador = { n: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          marcarVista();
          setTerminado(true);
        },
      });

      // Corte duro al terminar, sin fade de salida: es la misma logica de
      // "las marcas caen de golpe" del snap (docs/BRAND.md §13), no un
      // parpadeo tapado con una transicion de opacidad.
      tl.fromTo(
        linea,
        { scaleX: 0 },
        { scaleX: 1, duration: DURACION_SEGUNDOS, ease: "power3.out", transformOrigin: "left center" },
        0,
      ).to(
        contador,
        {
          n: 100,
          duration: DURACION_SEGUNDOS,
          ease: "power3.out",
          onUpdate: () => {
            porcentaje.textContent = `${Math.round(contador.n)}%`;
          },
        },
        0,
      );

      return () => {
        tl.kill();
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  // Se retira sola, sin boton "continuar": desmonta el overlay y revela
  // `Inicio()`, que ya esta montado debajo. Sin elementos enfocables adentro,
  // no hay foco que atrapar ni que devolver.
  if (terminado) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-doc fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 px-6"
    >
      {/* Contenido que cambia sin interaccion del usuario (docs/BRAND.md
          §10): el texto vivo del live region es fijo a proposito, no el
          numero que cambia cuadro a cuadro -- anunciar cada porcentaje
          saturaria al lector de pantalla. */}
      <span className="sr-only">Cargando SNAPLINE</span>

      <div className="textura-grano pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative flex flex-col items-center gap-8" aria-hidden="true">
        <p className="font-serif text-ink text-3xl leading-none">SNAPLINE</p>

        <div className="flex w-full max-w-xs flex-col items-center gap-3">
          <div className="border-ink relative h-2 w-full border">
            <div
              ref={lineaRef}
              className="bg-ink absolute inset-y-0 left-0 h-full w-full"
              style={{ transform: "scaleX(0)", transformOrigin: "left center" }}
            />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="mono text-ink-60 text-xs tracking-wide uppercase">{ETIQUETA}</span>
            <span ref={porcentajeRef} className="mono text-ink text-2xl">
              0%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
