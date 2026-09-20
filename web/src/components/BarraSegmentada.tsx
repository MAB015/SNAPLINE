import { formatearBps, type Participante } from "@/lib/acuerdo";

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
 * El dispositivo de la linea (docs/BRAND.md §6).
 *
 * Una sola linea horizontal en `ink` con los cortes en `stamp` y las
 * etiquetas colgando debajo en mono. No es una barra apilada de colores:
 * es un objeto unico, marcado.
 *
 * Por debajo de `sm` las etiquetas proporcionales no caben sin cortarse, asi
 * que se apilan. La linea, que es lo que carga la metafora, no cambia.
 */
export function BarraSegmentada({ participantes, tensada = false }: Props) {
  const cortes = cortesAcumulados(participantes);

  return (
    <figure className="m-0">
      <div className="relative h-4" aria-hidden="true">
        <div
          className={`absolute inset-x-0 top-1/2 h-px bg-ink ${tensada ? "snap-linea" : ""}`}
        />
        <div className={tensada ? "snap-marcas" : ""}>
          {/* Marca de apertura mas una por cada corte, la ultima cierra. */}
          <span className="absolute top-0 left-0 h-4 w-px bg-stamp" />
          {cortes.map((x, i) => (
            <span
              key={participantes[i].direccion}
              className="absolute top-0 h-4 w-px bg-stamp"
              style={{ left: `${x}%`, transform: "translateX(-100%)" }}
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
              <div className="text-xs text-ink-60">{p.nombre}</div>
            </div>
          ))}
        </div>

        {/* Apilado: mismo contenido, sin cortar cifras. */}
        <ul className="sm:hidden">
          {participantes.map((p) => (
            <li
              key={p.direccion}
              className="flex justify-between border-b border-rule py-2"
            >
              <span className="text-xs text-ink-60">{p.nombre}</span>
              <span className="mono text-sm">{formatearBps(p.bps)}</span>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
