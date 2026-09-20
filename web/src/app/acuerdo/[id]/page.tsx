import { BarraSegmentada } from "@/components/BarraSegmentada";
import { EstadoAcuerdo } from "@/components/EstadoFirma";
import { TablaReparto } from "@/components/TablaReparto";
import {
  ACUERDO_DE_MUESTRA,
  todasFirmadas,
  type Acuerdo,
} from "@/lib/acuerdo";

/** D3: la pantalla se dibuja con datos falsos y sin logica. El acuerdo real
 *  llega del relay y de la cadena en D5.
 *
 *  `?firmado=1` fuerza el acuerdo completo. Es un interruptor de maqueta para
 *  ver el snap sin backend; se cae cuando entren los datos reales. */
async function cargarAcuerdo(id: string, forzarFirmado: boolean): Promise<Acuerdo> {
  const base = ACUERDO_DE_MUESTRA;
  return {
    ...base,
    id,
    participantes: forzarFirmado
      ? base.participantes.map((p) => ({ ...p, firma: "firmado" as const }))
      : base.participantes,
  };
}

export default async function PaginaAcuerdo({
  params,
  searchParams,
}: PageProps<"/acuerdo/[id]">) {
  const { id } = await params;
  const { firmado } = await searchParams;
  const acuerdo = await cargarAcuerdo(id, firmado === "1");
  const { participantes } = acuerdo;
  const firmadas = participantes.filter((p) => p.firma === "firmado").length;
  const completo = todasFirmadas(participantes);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <p className="mono mb-12 border border-rule px-3 py-2 text-xs uppercase tracking-wide text-ink-60">
        Maqueta estática · datos falsos · sin lógica
      </p>

      <header className="border-b border-ink pb-6">
        <h1 className="font-serif text-2xl leading-tight sm:text-3xl">
          {acuerdo.proyecto}
        </h1>
        <p className="mono mt-4 text-xs text-ink-60">
          Acuerdo {acuerdo.id} · {acuerdo.fecha}
        </p>
      </header>

      <section className="py-16">
        <BarraSegmentada participantes={participantes} tensada={completo} />
      </section>

      <section>
        <TablaReparto participantes={participantes} />
        <div className="mt-4 flex justify-end">
          <EstadoAcuerdo firmadas={firmadas} total={participantes.length} />
        </div>
      </section>

      <section className="mt-16 max-w-prose">
        <h2 className="text-xs uppercase tracking-wide text-ink-60">Términos</h2>
        <p className="mt-3 text-sm">{acuerdo.terminos}</p>
        <p className="mono mt-4 text-xs break-all text-ink-60">
          {acuerdo.terminosHash}
        </p>
      </section>

      <section className="mt-16 border-t border-ink pt-8">
        <button
          type="button"
          className="mono border border-ink bg-ink px-6 py-3 text-xs uppercase tracking-wide text-paper disabled:cursor-not-allowed disabled:border-rule disabled:bg-transparent disabled:text-ink-60"
          disabled={completo}
        >
          {completo ? "Acuerdo firmado" : "Firmar acuerdo"}
        </button>
      </section>
    </main>
  );
}
