import { celdasIdenticon, type TokenParticipante } from "@/lib/acuerdo";

/**
 * Identicon (docs/BRAND.md §8): rejilla simetrica 5x5, cuadrados sin radio,
 * en el color del participante. La direccion le da la forma, el acuerdo le
 * da el color — por eso recibe el token de color, no un hex.
 */
export function Identicon({
  direccion,
  token,
  tamano = 20,
}: {
  direccion: string;
  token: TokenParticipante;
  tamano?: number;
}) {
  const filas = celdasIdenticon(direccion);

  return (
    <svg
      viewBox="0 0 5 5"
      width={tamano}
      height={tamano}
      className="bg-rule shrink-0"
      aria-hidden="true"
    >
      {filas.map((fila, y) =>
        fila.map((activa, x) =>
          activa ? (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={`var(--raw-${token})`}
            />
          ) : null,
        ),
      )}
    </svg>
  );
}
