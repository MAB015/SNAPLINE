import Link from "next/link";
import { InterruptorTema, ProveedorTema } from "@/components/InterruptorTema";
import { SelloSimulado } from "@/components/SelloSimulado";
import {
  ACUERDO_DE_MUESTRA,
  OTRO_ACUERDO_DE_MUESTRA,
  tokenParticipante,
  type Acuerdo,
} from "@/lib/acuerdo";

function FilaAcuerdo({ acuerdo }: { acuerdo: Acuerdo }) {
  return (
    <li className="border-b border-rule py-4">
      <div className="flex items-center gap-3">
        <div className="flex" aria-hidden="true">
          {acuerdo.participantes.map((p, i) => (
            <span
              key={p.direccion}
              className={`trama-${tokenParticipante(i)} -ml-1 h-4 w-4 border border-doc first:ml-0`}
            />
          ))}
        </div>
        <div>
          <p className="text-sm">{acuerdo.proyecto}</p>
          <p className="mono text-xs text-ink-60">Acuerdo {acuerdo.id}</p>
        </div>
      </div>
      <div className="mt-2 flex gap-4 pl-1">
        <Link className="mono text-xs underline underline-offset-4" href={`/acuerdo/${acuerdo.id}`}>
          Papel
        </Link>
        <Link
          className="mono text-xs underline underline-offset-4"
          href={`/acuerdo/${acuerdo.id}?firmado=1`}
        >
          Sellado en cadena
        </Link>
      </div>
    </li>
  );
}

export default function Inicio() {
  return (
    <ProveedorTema>
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <div className="mb-12 flex items-start justify-between gap-4">
          <p className="mono text-ink-60 text-xs tracking-wide uppercase">
            HSKChain Testnet
          </p>
          <InterruptorTema />
        </div>
        <h1 className="font-serif text-3xl leading-tight">SNAPLINE</h1>
        <p className="mt-4 max-w-prose text-sm">
          Acuerdos de reparto de ingresos por proyecto. El grupo define los
          porcentajes, todos firman, y en el momento de la firma se despliega el
          pool de cobro.
        </p>

        <p className="mono text-ink-60 mt-12 text-xs tracking-wide uppercase">
          Sistema visual · D3
        </p>
        <ul className="border-ink mt-3 border-t">
          <FilaAcuerdo acuerdo={ACUERDO_DE_MUESTRA} />
          <FilaAcuerdo acuerdo={OTRO_ACUERDO_DE_MUESTRA} />
        </ul>

        <p className="mono text-ink-60 mt-12 text-xs tracking-wide uppercase">
          Sello de simulado
        </p>
        <p className="text-ink-60 mt-2 max-w-prose text-xs">
          Va en toda superficie donde el dinero no se mueve de verdad: la
          salida a pesos de D7 y el faucet de MockUSDT.
        </p>
        <div className="mt-3">
          <SelloSimulado detalle="La salida a pesos no existe: no hay proveedor, no hay transferencia bancaria y el comprobante es de mentira." />
        </div>
      </main>
    </ProveedorTema>
  );
}
