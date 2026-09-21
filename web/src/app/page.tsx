import Link from "next/link";
import { SelloSimulado } from "@/components/SelloSimulado";
import { ACUERDO_DE_MUESTRA } from "@/lib/acuerdo";

export default function Inicio() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="font-serif text-3xl leading-tight">SNAPLINE</h1>
      <p className="mt-4 max-w-prose text-sm">
        Acuerdos de reparto de ingresos por proyecto. El grupo define los
        porcentajes, todos firman, y en el momento de la firma se despliega el
        pool de cobro.
      </p>

      <p className="mono mt-12 text-xs uppercase tracking-wide text-ink-60">
        Sistema visual · D3
      </p>
      <ul className="mt-3 border-t border-rule">
        <li className="border-b border-rule py-3">
          <Link
            className="underline underline-offset-4"
            href={`/acuerdo/${ACUERDO_DE_MUESTRA.id}`}
          >
            /acuerdo/[id] · tres de cuatro firmas
          </Link>
        </li>
        <li className="border-b border-rule py-3">
          <Link
            className="underline underline-offset-4"
            href={`/acuerdo/${ACUERDO_DE_MUESTRA.id}?firmado=1`}
          >
            /acuerdo/[id] · firmado, con el snap de la línea
          </Link>
        </li>
      </ul>

      <p className="mono mt-12 text-xs uppercase tracking-wide text-ink-60">
        Sello de simulado
      </p>
      <p className="mt-2 max-w-prose text-xs text-ink-60">
        Va en toda superficie donde el dinero no se mueve de verdad: la salida a
        pesos de D7 y el faucet de MockUSDT.
      </p>
      <div className="mt-3">
        <SelloSimulado detalle="La salida a pesos no existe: no hay proveedor, no hay transferencia bancaria y el comprobante es de mentira." />
      </div>
    </main>
  );
}
