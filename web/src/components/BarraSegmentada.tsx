import {
  formatearBps,
  tokenParticipante,
  type Participante,
} from "@/lib/acuerdo";

type Props = {
  participantes: Participante[];
  /** Cuando el acuerdo queda firmado, la linea se tensa una sola vez. */
  tensada?: boolean;
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
 */
export function BarraSegmentada({ participantes, tensada = false }: Props) {
  const cortes = cortesAcumulados(participantes);
  const cortesInternos = cortes.slice(0, -1);

  return (
    <figure className="m-0">
      <div className={`border-ink relative h-8 border ${tensada ? "snap-linea" : ""}`}>
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
          className={`pointer-events-none absolute inset-0 ${tensada ? "snap-marcas" : ""}`}
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
