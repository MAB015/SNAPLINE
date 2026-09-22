import Link from "next/link";
import { ContadorFuzz } from "@/components/ContadorFuzz";
import { ContadorTests } from "@/components/ContadorTests";
import { EjemploBarraHero } from "@/components/EjemploBarraHero";
import { HashVivo } from "@/components/HashVivo";
import { InterruptorTema, ProveedorTema } from "@/components/InterruptorTema";
import { PantallaCarga } from "@/components/PantallaCarga";
import { RevelaEnScrollDiv, RevelaEnScrollUl } from "@/components/RevelaEnScroll";
import { TarjetaMetrica } from "@/components/TarjetaMetrica";
import { FACTORY_ADDRESS } from "@/lib/firma";
import { MOCK_USDT_ADDRESS } from "@/lib/token";

/**
 * Dos invariantes de contabilidad × 1000 casos fuzz cada una, más 1000
 * casos fuzz de firmas EIP-712 (STATUS.md § contracts, "Validación"): la
 * cifra grande de la tarjeta de fuzzing. Constante literal por el mismo
 * motivo que `SPLIT_POOL_IMPLEMENTATION_ADDRESS` de abajo: no hay un
 * artefacto de build que sobreviva a Vercel para leerlo en runtime.
 */
const TOTAL_CASOS_FUZZ = 2 * 1000 + 1000;

/**
 * Implementación de referencia de los clones EIP-1167 (deployments/hashkey-
 * testnet.json → contracts.SplitPool). No tiene su propia transacción — la
 * crea el constructor del factory — así que no hay una constante existente
 * en `web/src/lib/` para reutilizar. Mismo patrón de literal-copiado que
 * `FACTORY_ADDRESS` en `web/src/lib/firma.ts` y `MOCK_USDT_ADDRESS` en
 * `web/src/lib/token.ts`: el JSON de `deployments/` no sobrevive el build de
 * Vercel, así que no se importa.
 */
const SPLIT_POOL_IMPLEMENTATION_ADDRESS = "0x88ceD9e81cF88DfD6f2f4435DF9047Cb89A5FE7F";

const CONTRATOS_VERIFICADOS = [
  { nombre: "SplitPoolFactory", direccion: FACTORY_ADDRESS },
  { nombre: "SplitPool (implementación)", direccion: SPLIT_POOL_IMPLEMENTATION_ADDRESS },
  { nombre: "MockUSDT", direccion: MOCK_USDT_ADDRESS },
] as const;

const CASOS_DE_USO = [
  {
    titulo: "Agencia de diseño",
    detalle:
      "5 personas, pago en USDT: cada quien retira sin pasar por la cuenta de nadie.",
  },
  {
    titulo: "Estudio de desarrollo",
    detalle:
      "4 devs en Colombia, Argentina y Perú, con reparto fijo por sprint que no se renegocia.",
  },
  {
    titulo: "Colectivo creativo",
    detalle:
      'Freelancers sin estructura legal compartida, donde nadie quiere ser el que "tiene la plata de los demás".',
  },
] as const;

export default function Inicio() {
  return (
    <ProveedorTema>
      {/* Autocontenida (docs D-034: nada de esto va en layout.tsx, es UI
          local a la pantalla de entrada). Se monta dentro de `ProveedorTema`
          para heredar `data-theme` y los tokens `bg-doc`/`text-ink`
          correctos si el interruptor de tema ya se anulo en esta sesion. */}
      <PantallaCarga />
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <div className="mb-12 flex items-start justify-between gap-4">
          <p className="mono text-ink-60 text-xs tracking-wide uppercase">
            HSKChain Testnet
          </p>
          <InterruptorTema />
        </div>

        <section>
          <h1 className="font-serif text-2xl leading-tight sm:text-3xl">
            SNAPLINE convierte un acuerdo de reparto en una dirección de cobro.
            El grupo firma, se despliega el pool del proyecto, y cuando llega
            el dinero el reparto ya está decidido.
          </h1>
          <p className="mt-6 max-w-prose text-sm">
            Cobrar en equipo cruzando fronteras significa que alguien termina
            de banco humano: recibe la plata en su cuenta y reparte a mano.
            SNAPLINE saca esa cuenta de en medio.
          </p>

          <EjemploBarraHero />
        </section>

        <section className="mt-16">
          <h2 className="text-ink-60 text-xs tracking-wide uppercase">
            Para quién es
          </h2>
          <RevelaEnScrollUl className="border-ink mt-3 border-t">
            {CASOS_DE_USO.map((caso) => (
              <li key={caso.titulo} className="border-b border-rule py-4">
                <p className="text-sm">{caso.titulo}</p>
                <p className="text-ink-60 mt-1 max-w-prose text-sm">{caso.detalle}</p>
              </li>
            ))}
          </RevelaEnScrollUl>
        </section>

        <section
          data-surface="chain"
          className="bg-chain text-on-chain relative mt-16 overflow-hidden border border-transparent px-6 py-8"
        >
          <div className="textura-rejilla pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="relative">
            <h2 className="mono text-xs tracking-wide uppercase opacity-80">
              Verificado en cadena
            </h2>

            <RevelaEnScrollDiv className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TarjetaMetrica etiqueta="Auditoría">
                <p className="mono text-2xl">
                  <ContadorTests valor={40} />
                </p>
              </TarjetaMetrica>

              <TarjetaMetrica etiqueta="Casos fuzz">
                <p className="mono text-2xl">
                  <ContadorFuzz valor={TOTAL_CASOS_FUZZ} />
                </p>
              </TarjetaMetrica>

              <TarjetaMetrica etiqueta="Contratos verificados" className="sm:col-span-2">
                <ul>
                  {CONTRATOS_VERIFICADOS.map((contrato, i) => (
                    <li
                      key={contrato.direccion}
                      className={
                        i === CONTRATOS_VERIFICADOS.length - 1
                          ? "py-3"
                          : "border-on-chain/20 border-b py-3"
                      }
                    >
                      <p className="text-sm">{contrato.nombre}</p>
                      <div className="mt-1">
                        <HashVivo
                          valor={contrato.direccion}
                          superficie="chain"
                          dispararEnVista
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </TarjetaMetrica>
            </RevelaEnScrollDiv>

            <div className="mt-8 max-w-prose">
              <p className="text-sm">
                Sin fallos ni omitidos. Las dos invariantes de contabilidad
                corrieron 1000 casos fuzz cada una, y otros 1000 casos fuzz
                validaron las firmas EIP-712 — {TOTAL_CASOS_FUZZ} en total. El
                análisis con Slither encontró seis hallazgos sobre el código,
                ninguno alto ni accionable.
              </p>
              <p className="mono text-on-chain/60 mt-3 text-xs">
                Reporte crudo: contracts/audit/slither-2026-09-20.txt
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <Link
            href="/nuevo"
            className="mono border-ink bg-ink text-doc inline-block border px-6 py-3 text-xs tracking-wide uppercase"
          >
            Crear tu acuerdo
          </Link>
        </section>
      </main>
    </ProveedorTema>
  );
}
