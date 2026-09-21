import { EstadoFirma } from "@/components/EstadoFirma";
import { HashVivo } from "@/components/HashVivo";
import { Identicon } from "@/components/Identicon";
import {
  formatearBps,
  sumaBps,
  tokenParticipante,
  type Participante,
} from "@/lib/acuerdo";

/**
 * Tabla de reparto (docs/BRAND.md §7, punto 3).
 *
 * Filetes visibles de 1px, porcentajes en mono tabular alineados a la
 * derecha y un total que siempre se muestra: la suma es el contrato.
 */
export function TablaReparto({
  participantes,
}: {
  participantes: Participante[];
}) {
  const total = sumaBps(participantes);

  return (
    <table className="w-full border-collapse text-sm">
      <caption className="sr-only">
        Reparto del acuerdo por participante
      </caption>
      <thead>
        <tr className="border-b border-ink">
          <th
            scope="col"
            className="py-2 text-left text-xs font-medium uppercase tracking-wide text-ink-60"
          >
            Participante
          </th>
          <th
            scope="col"
            className="py-2 text-left text-xs font-medium uppercase tracking-wide text-ink-60"
          >
            Dirección
          </th>
          <th
            scope="col"
            className="py-2 text-right text-xs font-medium uppercase tracking-wide text-ink-60"
          >
            Parte
          </th>
          <th
            scope="col"
            className="py-2 text-right text-xs font-medium uppercase tracking-wide text-ink-60"
          >
            Firma
          </th>
        </tr>
      </thead>
      <tbody>
        {participantes.map((p, i) => (
          <tr key={p.direccion} className="border-b border-rule">
            <td className="py-3 align-baseline">
              <div className="flex items-center gap-2">
                <Identicon direccion={p.direccion} token={tokenParticipante(i)} />
                <div>
                  {p.nombre}
                  <span className="ml-2 hidden text-xs text-ink-60 sm:inline">
                    {p.rol}
                  </span>
                </div>
              </div>
            </td>
            <td className="py-3 align-baseline">
              <HashVivo valor={p.direccion} />
            </td>
            <td className="mono py-3 text-right align-baseline">
              {formatearBps(p.bps)}
            </td>
            <td className="py-3 text-right align-baseline">
              <EstadoFirma estado={p.firma} />
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-b border-ink">
          <td className="py-3 text-xs uppercase tracking-wide text-ink-60" colSpan={2}>
            Total
          </td>
          <td className="mono py-3 text-right font-medium">
            {formatearBps(total)}
          </td>
          <td />
        </tr>
      </tfoot>
    </table>
  );
}
