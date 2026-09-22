import Link from "next/link";
import { ContadorFuzz } from "@/components/ContadorFuzz";
import { ContadorTests } from "@/components/ContadorTests";
import { EjemploBarraHero } from "@/components/EjemploBarraHero";
import { HashVivo } from "@/components/HashVivo";
import { InterruptorTema, ProveedorTema } from "@/components/InterruptorTema";
import { PantallaCarga } from "@/components/PantallaCarga";
import { RevelaEnScrollDiv, RevelaEnScrollUl } from "@/components/RevelaEnScroll";
import { TarjetaMetrica } from "@/components/TarjetaMetrica";
import { tokenParticipante } from "@/lib/acuerdo";
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
      {/* Sin cap de ancho (antes `max-w-3xl`, luego se evaluó `max-w-7xl`):
          se optó por ancho completo real porque el usuario lo pidió
          explícitamente ("no quiero que se vea acotado, en la mitad"). El
          `<h1>` y la grilla de la sección "Verificado en cadena" van a
          estirarse a todo el viewport en monitores ultra-wide (2560px+) —
          es la consecuencia esperada de esta decisión, no un descuido. Los
          párrafos largos siguen protegidos por `max-w-prose` donde ya se
          usaba, así que la legibilidad del texto no se pierde aunque el
          contenedor raíz ya no tenga límite. `overflow-x-hidden` evita que
          el sangrado de la sección `chain` de abajo (`w-screen` +
          `left-1/2` + `-translate-x-1/2`) fuerce scroll horizontal por
          redondeos de `100vw` vs. la barra de scroll. */}
      <main className="mx-auto w-full overflow-x-hidden px-6 py-16 sm:px-8 lg:px-16">
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
            {/* Marcador de color de participante (no filete: docs/BRAND.md
                §12 fija los filetes en color `rule`, así que el acento va en
                un chip aparte, no en el borde). Reusa `trama-${token}` tal
                cual `BarraSegmentada.tsx` la aplica en su leyenda — mismo
                color + trama ya auditados (docs/BRAND.md §7), sin inventar
                un token nuevo. Asigna por orden en la lista, igual que
                `tokenParticipante` ya hace con los participantes reales. */}
            {CASOS_DE_USO.map((caso, i) => (
              <li key={caso.titulo} className="border-b border-rule py-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`trama-${tokenParticipante(i)} h-2 w-2 shrink-0`}
                    aria-hidden="true"
                  />
                  <p className="text-sm">{caso.titulo}</p>
                </div>
                <p className="text-ink-60 mt-1 max-w-prose text-sm">{caso.detalle}</p>
              </li>
            ))}
          </RevelaEnScrollUl>
        </section>

        {/* Sangra a todo el ancho del viewport (truco del contenedor
            centrado: `left-1/2` + `-translate-x-1/2` + `w-screen` recentran
            un bloque de ancho de pantalla completo dentro de un padre
            centrado). El contenido interno ya no vuelve a capearse a
            `max-w-7xl` como en el intento anterior — sigue el mismo criterio
            de ancho completo real del `<main>` de arriba. */}
        <section
          data-surface="chain"
          className="bg-chain text-on-chain relative left-1/2 mt-16 w-screen -translate-x-1/2 overflow-hidden border border-transparent"
        >
          <div className="textura-rejilla pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="relative px-6 py-8 sm:px-8 lg:px-16">
            <h2 className="mono text-xs tracking-wide uppercase opacity-80">
              Verificado en cadena
            </h2>

            {/* `lg:grid-cols-4`: en ancho completo real (sin cap de 1280px),
                dos columnas dejarian cada tarjeta de cifra unica demasiado
                ancha y vacia. A 4 columnas las dos tarjetas de una sola
                cifra ocupan una columna cada una y la de contratos (que
                lleva una lista, no una cifra) sigue en `sm:col-span-2`, asi
                que 1+1+2 completa la fila entera en vez de dejarla suelta. */}
            <RevelaEnScrollDiv className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
