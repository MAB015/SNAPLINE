import { BarraSegmentada } from "@/components/BarraSegmentada";
import { CodigoBarras } from "@/components/CodigoBarras";
import { EstadoAcuerdo } from "@/components/EstadoFirma";
import { HashVivo } from "@/components/HashVivo";
import { InterruptorTema, ProveedorTema } from "@/components/InterruptorTema";
import { TablaReparto } from "@/components/TablaReparto";
import {
  ACUERDO_DE_MUESTRA,
  ACUERDOS_DE_MUESTRA,
  direccionSimulada,
  todasFirmadas,
  type Acuerdo,
} from "@/lib/acuerdo";

/** D3: la pantalla se dibuja con datos falsos y sin logica. El acuerdo real
 *  llega del relay y de la cadena en D5.
 *
 *  Hay dos acuerdos de muestra (docs/DEMO-SCRIPT.md y uno extra para probar
 *  la maqueta con otro reparto); cualquier otro id cae en el primero.
 *
 *  `?firmado=1` fuerza el acuerdo completo. Es un interruptor de maqueta para
 *  ver el snap sin backend; se cae cuando entren los datos reales. */
async function cargarAcuerdo(id: string, forzarFirmado: boolean): Promise<Acuerdo> {
  const base = ACUERDOS_DE_MUESTRA[id] ?? ACUERDO_DE_MUESTRA;
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
    <ProveedorTema>
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <div className="mb-12 flex items-start justify-between gap-4">
          <p className="mono border-rule text-ink-60 border px-3 py-2 text-xs tracking-wide uppercase">
            Maqueta estática · datos falsos · sin lógica
          </p>
          <InterruptorTema />
        </div>

        <header className="border-ink border-b pb-6">
          <h1 className="font-serif text-2xl leading-tight sm:text-3xl">
            {acuerdo.proyecto}
          </h1>
          <p className="mono text-ink-60 mt-4 text-xs">
            Acuerdo {acuerdo.id} · {acuerdo.fecha} · HSKChain Testnet
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
          <h2 className="text-ink-60 text-xs tracking-wide uppercase">
            Términos
          </h2>
          <p className="mt-3 text-sm">{acuerdo.terminos}</p>
          <div className="mt-4 flex items-center gap-3">
            <HashVivo valor={acuerdo.terminosHash} />
          </div>
          <div className="mt-2 max-w-xs">
            <CodigoBarras hash={acuerdo.terminosHash} />
          </div>
        </section>

        {completo ? (
          <section
            data-surface="chain"
            className="bg-chain text-on-chain relative mt-16 overflow-hidden border border-transparent px-6 py-8"
          >
            <div className="textura-rejilla pointer-events-none absolute inset-0" aria-hidden="true" />
            <div className="relative">
              <p className="mono text-xs tracking-wide uppercase opacity-80">
                Bloque del acuerdo · sellado en cadena
              </p>
              <p className="mt-4 text-sm">Dirección del pool</p>
              <div className="mt-1">
                <HashVivo valor={direccionSimulada(acuerdo.id)} superficie="chain" />
              </div>
            </div>
          </section>
        ) : (
          <section className="mt-16 border-t border-dashed border-ink-60 pt-8">
            <p className="text-ink-60 text-xs">
              El bloque cruza de papel a cadena cuando entra la última firma.
            </p>
          </section>
        )}

        <section className="mt-16 border-ink border-t pt-8">
          <button
            type="button"
            className="mono border-ink bg-ink text-doc disabled:border-rule disabled:text-ink-60 border px-6 py-3 text-xs tracking-wide uppercase disabled:cursor-not-allowed disabled:bg-transparent"
            disabled={completo}
          >
            {completo ? "Acuerdo firmado" : "Firmar acuerdo"}
          </button>
        </section>
      </main>
    </ProveedorTema>
  );
}
