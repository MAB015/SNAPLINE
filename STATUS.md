# Estado del proyecto — SNAPLINE

**Última actualización:** 2026-09-21 · **Bloque cerrado:** D6 · `/pagar/[dir]` y `/pool/[dir]` en main, código verificado por build/eslint y lectura de cadena real contra un pool de prueba manual; verificación conductual real diferida a propósito a D8 junto con la de D5 (decisión del usuario)
**Cierre del hackathon:** 1 de octubre de 2026 · **Días restantes de trabajo:** 10

Este archivo se actualiza en el mismo commit que el trabajo que describe.

---

## Resumen

| Área | Estado | Siguiente |
|---|---|---|
| `docs` | ✅ Listo | Solo mantenimiento del tracking |
| `infra` | 🟡 D4 casi listo | Fondeo de testnet; Vercel en D9–D10 |
| `contracts` | ✅ D2 desplegado | Consumido desde D5 web; sin tareas propias hasta D8 |
| `design` | ✅ D5 listo, snap con GSAP | D7 · anillo 3D y pulido |
| `web` | ✅ D6 código listo, corrida real en D8 | D7 · salida a pesos y pulido |
| `demo` | 🟡 Guion escrito | D8 · datos y ensayos |

---

## `docs` — ✅ Listo

**Hecho:** PRD, arquitectura, modelo de amenazas, plan por día, roadmap,
dirección visual, guion de demo y pitch. Los ocho documentos están completos
y no se reescriben; a partir de aquí solo se actualiza el tracking.

**Falta:** nada en el MVP.

**Bloqueado por:** nada.

## `infra` — 🟡 Parcial

**Hecho:** repositorio inicializado, estructura de carpetas, `.gitignore`,
licencia MIT, `.env.example` con las variables previstas. Foundry 1.8.3
instalado con autorización, compilador 0.8.24 y dependencias fijadas; primer
`forge test` en verde dentro de la caja de 30 minutos en Windows/Git Bash.

**Hecho en D2:** workflow de GitHub Actions con Foundry 1.8.3, acciones
fijadas por SHA, submódulos recursivos, formato y tests en cada push y PR.
Validado localmente y en GitHub: formato y tests pasan en Linux en la
[ejecución 35537664699](https://github.com/MAB015/SNAPLINE/actions/runs/35537664699)
del commit 9d96b48. Rama publicada en origin/feat/contracts-split-pool.

**Andamiaje de Next.js**, adelantado a D3 por `design` (D-032): App Router,
TypeScript y Tailwind 4.

**viem/wagmi**, sumado en D4: `web/src/lib/wagmi.ts` redefine la cadena
HSKChain Testnet completa (no la parchea) porque el `blockExplorers` que trae
viem por defecto no resuelve. Fuente única: los literales se copian de
`deployments/hashkey-testnet.json` porque `web/` es la raíz de build de
Next.js/Vercel y un import fuera de ella no sobrevive el despliegue.

**Relay de firmas**, adelantado desde D4 en `feat/infra-plataforma` porque no
depende del ABI ni del diseño: proyecto `snapline` en Supabase, tablas `drafts`
y `signatures` con RLS, lectura por función para que la clave anónima no pueda
listar borradores ajenos, y sin `update` ni `delete` para nadie. Migración
versionada en `supabase/migrations/`. Ver D-031. Ya en uso: `/nuevo` guarda
bordadores ahí.

**Falta:** fondeo de las cuatro cuentas de testnet; `DEPLOYER_PRIVATE_KEY` en
`web/.env.local` (documentada en `.env.example`, sin valor puesto — sin ella
el goteo de gas responde 500 pero no bloquea el resto de la app); proyecto de
Vercel y primer despliegue, bloqueado en `TASKS.md` hasta D9–D10.

**Nota:** el CI no se añade hasta que haya algo que construir. Un `main` con
CI en rojo incumple la regla de "siempre desplegable".

**Bloqueado por:** faltan las cuatro direcciones públicas y fondos de testnet.
Remoto configurado: https://github.com/MAB015/SNAPLINE.git.

## `contracts` — 🟡 D2 local validado

**Hecho:** D1 completo en `feat/contracts-split-pool`: MockUSDT de seis
decimales, faucet público y transferencias sin retorno; SplitPool para clones
con inicialización única, contabilidad por token, receive vacío y retiro pull
con estado antes de transferir mediante SafeERC20. Sin roles ni pausas.

**Hecho en D2:** factory con dominio EIP-712, firmas ordenadas, acuerdo con
salt y consumo por structHash, validación de participantes/bps, implementación
inmutable y clon inicializado atómicamente. Sin cambios a contratos D1.

**Validación:** 40 tests pasan, cero fallos y cero omitidos; `forge fmt
--check` pasa. Incluye reparto ERC-20/nativo, pagos sucesivos, doble retiro,
tres activos independientes, rollback de receptor fallido, reentrada,
reinicialización y ETH forzado. Caso límite uint256 máximo para mulDiv.
Cada una de las dos invariantes ejecuta 1000 casos fuzz con 1–10 participantes:
dust tras liquidar todos (hasta ocho rondas) y conservación tras cada operación
(hasta 32 pagos/retiros intercalados). Oracle de entradas y salidas independiente
del ledger del pool. Otros 1000 casos fuzz validan acuerdos firmados con bps,
términos y salt variables. Los 24 tests nuevos calculan el digest de forma
independiente y cubren dominio de otra cadena/factory, cambio de chainId,
firmas faltantes/sobrantes/malformadas/desordenadas, replay, alteración de
campos, evento, runtime EIP-1167, inicialización y ciclo pago/retiro.
Toda la lista de THREAT-MODEL §6 está cubierta. No constituye prueba formal
de todas las secuencias. `forge lint src --severity high med` sin hallazgos.

**Nota de compilación:** advertencia de selfdestruct solo en el helper de test
que fuerza ETH; no aparece en los contratos de producción.

**Desplegado:** HSKChain Testnet, chainId 133, desde
`0x7153D224638aA1670Ce4698F96E19d3D9d90b038` con `forge create`, sin scripts en
Solidity. Las tres direcciones están en
[`deployments/hashkey-testnet.json`](deployments/hashkey-testnet.json) y en el
README: factory `0x2da2f4E4…a559` (bloque 33379462), implementación de los
clones `0x88ceD9e8…FE7F` y MockUSDT `0xc84d2E59…b2D6` (bloque 33379454). Las
tres verificadas en el explorador con solc 0.8.24, optimizador a 200 runs;
`is_verified` confirmado por la API, no solo el envío aceptado.

**Comprobado en cadena, no solo en el recibo:** el factory responde
`implementation()` con la dirección desplegada; MockUSDT responde `mUSDT` y 6
decimales; llamar a `initialize` sobre la implementación revierte con
`AlreadyInitialized` (`0x0dc149f0`), así que el clon de referencia está quemado
y nadie puede secuestrarlo. Coste real del despliegue: 0,00195 HSK a 1,001
gwei. Quedan 0,098 HSK para el goteo de gas de D4.

**Falta:** reservar HSK para las cuatro cuentas del demo. Esa tarea sigue
bloqueada porque las cuatro direcciones todavía no existen: dos son wallets
embebidas que Privy crea en D4.

**Cambio de red autorizado:** HSKChain Testnet, chainId 133, HSK de prueba para gas y MockUSDT para pagos (D-026). Configuración pública y referencias de red actualizadas; contracts/.env local e ignorado preparado. RPC y API del explorador responden. Fuentes ya verificadas.

**Validación del cambio:** formato y 40 tests pasan tanto localmente como en
fork de HSKChain Testnet (bloque 33376448), con 1000 casos por test fuzz.
Tres tests fallaron inicialmente porque una dirección de prueba ya tenía
saldo nativo en la red; se fijó saldo inicial cero en los fixtures de dos
suites. No se modificó Solidity de producción. El fork no sustituye el
despliegue ni demuestra por sí solo la compatibilidad del nodo remoto.


**Revisión previa al despliegue:** cerrada. Se leyeron testing, security y
addresses de ETHSKILLS. Revisados CEI, SafeERC20, contabilidad por activo,
redondeo, validación de arrays, consentimiento, dominio, replay y destino
inmutable del clon. No hay oráculos, swaps, mantenimiento, roles ni upgrade
authority: esos puntos no aplican. Se conserva CEI sin añadir nonReentrant y
salt/consumo sin añadir expiración, como fija la arquitectura. Tokens
maliciosos/rebasing quedan fuera del supuesto de confianza.

**Análisis automático:** Slither 0.11.5 en contenedor, sin instalar nada en la
máquina (D-027). Seis hallazgos sobre `src/`, ninguno alto, ninguno accionable;
salida cruda en [`contracts/audit/slither-2026-09-20.txt`](contracts/audit/slither-2026-09-20.txt).
`erc20-interface` sobre MockUSDT es el diseño pedido en D1: imitar a USDT sin
retorno booleano, absorbido por SafeERC20. `incorrect-equality` compara el
pendiente ya calculado, no un balance. `reentrancy-events` señala el orden del
evento `PoolCreated`, pero `initialize` no hace llamadas externas y el destino
es un clon de una implementación `immutable` creada por el propio factory.
`low-level-calls` es la transferencia nativa, con estado escrito antes y
retorno comprobado. `cyclomatic-complexity` es estilo. Las cuatro casillas
críticas de la guía quedan cubiertas: reentrada resuelta, retornos comprobados,
cero `delegatecall`/`selfdestruct` en producción y ninguna función de estado sin
protección. Mythril queda descartado con su porqué en D-027.

**Cerrado:** la verificación de fuentes en el explorador quedó hecha con el
despliegue. No queda nada abierto en la revisión previa.

**Decisiones:** D-023, D-024 y D-025 documentan núcleo, interfaz firmada y CI;
D-026 el cambio de testnet y D-027 el análisis estático en contenedor,
con alternativas descartadas. Guías ETHSKILLS leídas por URL sin instalar skills. La versión
actual de standards se centra en estándares de agentes y no desarrolla ERC-20
ni EIP-712 como esperaba D-022; prevaleció la arquitectura del repositorio.
Tests delegados con autorización explícita del usuario, en archivos separados.

**Candidatos nuevos a roadmap:** ninguno. No fue necesario recortar alcance.

### Organización de agentes

**Generación D1–D2 (contratos), cerrada.** Coordinador principal y tres
agentes (`feat/contracts-implementation`, `feat/contracts-tests`,
`feat/infra-validation`) con ramas y worktrees separados. Factory, tests y CI
entregados y fusionados a `main`. En los tests recuperados se corrigieron
aritmética uint16 y una expectativa de revert que interceptaba un getter.

**`feat/contracts-tests` descartada el 2026-09-21, confirmado por
blockchain-engineer.** Único commit (`60e021e`) sobre `SplitPoolFactory.t.sol`:
mismos 24 tests que ya están en `main`, misma cobertura de
`THREAT-MODEL.md` §6. Corrida contra los contratos actuales de `main` da
22/24 — los 2 que fallan tienen bugs de orden de evaluación en el propio
archivo de test (llamada externa encadenada con `vm.expectRevert`/dentro de
`assertEq`), ya resueltos en la versión que sí se integró. Nada para
rescatar. Rama y worktree (`F:/Projects/SNAPLINE-AI-agents/tests`)
eliminados con autorización del usuario.

**Generación D3-porte + D4 (diseño y plataforma web), cerrada.** Se
plantearon dos ramas en worktrees preparados bajo
`F:/Projects/SNAPLINE-AI-agents/` (`design` → `feat/design-porte-acta-viva`,
`plataforma` → `feat/web-identidad-borrador`), con el límite de archivos de
abajo. En la práctica el trabajo se hizo en dos sesiones aparte, cada una en
su propio worktree bajo `.claude/worktrees/`
(`claude/snapline-acta-viva-design-47b3ed` y
`claude/snapline-privy-borrador-0a3288`) — mismo reparto de alcance y de
archivos, worktrees distintos a los preparados. Las dos ramas `feat/*`
preparadas quedaron sin commits; siguen ahí, a limpiar cuando se confirme
que no hacen falta.

| Responsable | Alcance | Archivos asignables |
|---|---|---|
| Diseño | Portar D3 a Acta Viva | `web/src/app/globals.css`, `web/src/components/`, `web/src/app/acuerdo/[id]/page.tsx`, componentes nuevos (identicon, hash vivo, texturas) |
| Plataforma web | D4: Privy, wagmi, relay, `/nuevo` | `web/src/app/layout.tsx`, `web/src/app/nuevo/`, `web/src/lib/wagmi.ts`, `web/src/lib/privy.ts`, `web/src/lib/supabase.ts`, `web/package.json` |

**La interfaz fijada para evitar el choque en `layout.tsx` funcionó:** el
interruptor de tema (D-034) quedó contenido en cada pantalla que lo monta,
sin tocar el layout raíz, que la rama de plataforma usó para
`PrivyProvider`. Único conflicto real al integrar: `web/src/lib/acuerdo.ts`,
donde ambas ramas agregaron funciones — se resolvió combinando ambos
aportes, sin pérdida.

Ambas ramas se integraron a `main` fuera de este flujo de coordinación —
directamente por el usuario, sin pasar por una revisión previa del
coordinador ni actualizar STATUS/TASKS/DECISIONS en el mismo commit—. Esta
sección y el resto del tracking se reconstruyeron después, leyendo el código
ya fusionado: `next build` y `eslint` se corrieron recién en la revisión
posterior (2026-09-21), no antes de integrar. Se encontró y corrigió un bug
real (`text-paper`, clase de color inexistente tras el rename a Acta Viva,
en el botón de `/nuevo`) y un hueco de documentación (`DEPLOYER_PRIVATE_KEY`
faltaba en la sección `web/` de `.env.example`). Para el próximo bloque
paralelo: pedir que cada sesión avise al coordinador antes de fusionar a
`main`, no solo al terminar la tarea.

Cada agente trabaja únicamente en su worktree; ninguno cambia ramas en el
checkout de otro. El coordinador integra una tarea por commit junto con su
tracking. Solo el coordinador modifica STATUS, TASKS y DECISIONS.

**Formalizado el 2026-09-21 (D-036):** este patrón ya no se coordina solo a
mano. Los roles tienen nombre y definición propia en `.claude/agents/`, con
CEO como único contacto estratégico del orquestador y Product Manager como
el rol que hereda exactamente lo que decía el párrafo anterior — mapa de
quién trabaja dónde, dueño único de esta escritura, y gatekeeper de merges
a `main`. Ver `CLAUDE.md` § Orquestación de agentes.

**Generación D5 (web, firma y snap), primer bloque bajo el rol formal de
Product Manager.** Tres worktrees en paralelo, alcances sin cruce
(`web/src/app/acuerdo/[id]/*` y `web/src/lib/{firma,supabase}.ts` para CTO;
`web/src/components/*` y `web/package.json` para Design Lead): dos ramas
resultaron ser el mismo trabajo de CTO por una sesión duplicada
(`feat/web-firma-eip712`, con un fix crítico de `structHash` aplicado tras
triple verificación, y `feat/web-firma-snap`, idéntica pero sin el fix) más
una de Design Lead (`feat/design-snap-scramble`). Product Manager confirmó
con `git merge-tree` que las dos ramas reales a fusionar no tocaban archivos
en común, corrió `build`/`lint` sobre cada rama y sobre la combinación antes
de mergear, y descartó la rama duplicada sin el fix. Un merge de la rama de
diseño se hizo y se deshizo en el momento —local, nunca publicado— al llegar
un aviso del orquestador de que Design Lead había encontrado un bug real
(`ContadorNumero` saltaba a cero al montar) y pidió esperar el commit de fix
antes de integrar; llegado ese commit (`04927a8`), se repitió la
verificación y se fusionó. La única integración entre las dos ramas
—montar `SelloTinta` dentro del bloque `chain` de `AcuerdoCliente.tsx`,
archivo de CTO— no correspondía a ninguna de las dos sesiones según el
reparto de archivos, así que la hizo directamente Product Manager como
cambio mínimo de una línea, sin abrir una tarea nueva para otro agente.

**Fuera de generación, 2026-09-21 (D-038).** CEO aprobó con el usuario un
alcance nuevo a mitad del plan, sin pasar por `TASKS.md`: una pantalla de
carga de marca al abrir "/". Un único worktree
(`agent-a539e9c93480da821`, rama `worktree-agent-a539e9c93480da821`),
dirigido por Design Lead a `creative-director`, con `HEAD` en `56d0c0b` al
momento de trabajar —no en la punta de la rama de Product Manager en ese
momento—; se confirmó con `git merge-tree` que el merge contra `main` no
generaba conflicto antes de integrar. Archivos acotados a
`web/src/app/page.tsx` y el componente nuevo `PantallaCarga.tsx`; no tocó
`layout.tsx`. Product Manager repitió `lint`/`build` de forma independiente
sobre la rama y sobre `main` ya mergeado (commit `0406214`), no solo confió
en el reporte de Design Lead. Sin cruce con ningún archivo de D6/D7. Revisión
visual en navegador cerrada por el orquestador el 2026-09-21, sin hallazgos
—ver `design` más abajo y D-038 en `DECISIONS.md`.

**Generación D6 (web, cobro y retiro).** Un único worktree
(`agent-a374d5e4199c337c3`, rama `worktree-agent-a374d5e4199c337c3`),
dirigido por CTO a `frontend-engineer`. Archivos acotados a
`web/src/lib/pool.ts`, `web/src/lib/token.ts`, `web/src/app/pagar/[dir]/*`
y `web/src/app/pool/[dir]/*`, sin cruce con `acuerdo.ts`, `wagmi.ts` ni
`layout.tsx`. El trabajo llegó a Product Manager sin commitear (archivos
sin trackear en el worktree); se resolvió pidiendo que se commiteara antes
de mergear, en vez de que Product Manager commiteara en nombre de otro rol
— el commit (`e9f0551`) lo hizo quien construyó el código. Confirmado con
`git merge-tree` que la rama fusionaba sin conflicto contra `main` a pesar
de estar armada sobre un commit anterior a D-038 (sin cruce de archivos
real); `next build`/`eslint` corridos de forma independiente por Product
Manager antes de mergear (`7049ffe`), no solo el reporte de CTO. Aparte,
sin relación con D6: al revisar se encontraron dos commits de tracking
(regla de elección de modelo, entradas de roadmap) hechos por Product
Manager en un bloque anterior y nunca fusionados a `main` por quedar en una
rama sin push (`claude/snapline-agents-verification-d18624`); se
fusionaron en el mismo cierre (`0071107`) sin pérdida — las actualizaciones
de STATUS/TASKS/DECISIONS de esa rama duplicaban exactamente lo ya
integrado a `main` por otra vía (D-038), así que no hubo nada que
reconciliar ahí.

## `design` — ✅ D5 listo, snap con GSAP

**Hecho:** dirección visual revisada de Acta a **Acta Viva** (D-029) y
documentada en `docs/BRAND.md`: narrativa papel → cadena, temas claro y
oscuro, cuatro colores de participante con trama (contraste AA medido),
texturas, hash vivo, inventario de movimiento con GSAP y el anillo 3D del
pool en caja de un día (D-030).

**Hecho en código** (rama `feat/design-porte-acta-viva`, integrada en
c887b1f): la base D3 previa (andamiaje de Next.js, cuatro componentes,
maqueta), escrita contra la dirección "Acta" vieja, se portó entera a Acta
Viva. Colores por superficie con `--raw-*` resueltos en cascada por
`data-theme`/`data-surface`, no por rama de componente (D-034); texturas en
SVG como máscaras CSS (grano, rejilla, cuatro tramas, tinta de sello, franjas
de precaución); identicon 5×5 sin librería (`Identicon.tsx`,
`celdasIdenticon` en `web/src/lib/acuerdo.ts`); hash vivo con hover/copiar/
enlace al explorador (`HashVivo.tsx`) y código de barras del hash de
términos (`CodigoBarras.tsx`); interruptor de tema local a cada pantalla
(`InterruptorTema.tsx`, D-034) que sigue `prefers-color-scheme` por defecto.
`TablaReparto` y `BarraSegmentada` ahora llevan color y trama por
participante. `/acuerdo/[id]` funciona en los dos temas y en los dos estados
(papel y bloque sellado con superficie `chain` propia).

**Hecho en D5** (rama `feat/design-snap-scramble`, integrada en cc4b9f1):
`gsap` sumado a `web/package.json` (D-030 ya lo prevía). El snap de
`BarraSegmentada.tsx` pasa de keyframes CSS a un timeline de GSAP —línea que
se tensa bajo 380ms y marcas que caen de golpe, con `prefers-reduced-motion`
resuelto en JS vía `gsap.matchMedia`— y expone `onSnapCompleto`, prop
opcional para encadenar animación futura sin acoplar componentes.
`SelloTinta.tsx` (nuevo): el sello "Sellado" del paso 3 del snap
(docs/BRAND.md §13, cruce papel → cadena), autocontenido y pensado para que
lo monte quien tenga el archivo de la pantalla. `HashVivo.tsx` ahora hace
scramble del valor abreviado al montar con `ScrambleTextPlugin`, una sola
vez. `ContadorNumero.tsx` (nuevo) cuenta de 0 al valor final con
desaceleración; `TablaReparto` lo usa en la columna "Parte" y en el total.
Un bug real encontrado en la propia verificación de Design Lead antes de
pedir el merge —`ContadorNumero` mostraba el valor final en el primer
pintado y saltaba a 0 recién al montar el efecto, un glitch visible en
video— se corrigió en el mismo bloque (commit `04927a8`, arranca en
`formatear(0)`) antes de integrar.

**Integración con `web` cerrada por Product Manager:** `SelloTinta` no
estaba montado en ningún lado —correctamente, según el reparto de archivos:
`AcuerdoCliente.tsx` es de `web`, no de `design`—. Se agregó el import y una
línea de JSX dentro del bloque `data-surface="chain"` de
`web/src/app/acuerdo/[id]/AcuerdoCliente.tsx`, que solo se monta cuando
`estadoPool` ya confirmó el despliegue real en cadena. `onSnapCompleto` no
se cableó: encadenarlo al sello habría disparado el "Sellado" apenas se
completan las firmas en el relay, antes de que el pool exista de verdad en
cadena (puede tardar varios segundos más) — `SelloTinta` se anima solo al
montarse, que es el punto correcto. Cambio mínimo, sin alcance nuevo;
`build` y `eslint` verificados después.

**Validación:** `next build` y `eslint` pasan (verificado 2026-09-21, tras
reinstalar `node_modules` para D3 y de nuevo tras sumar `gsap` en D5). Sin
tests automáticos de interfaz: la comprobación es visual.

**Falta:** el anillo 3D y el pulido del resto de superficies siguen en D7.

**Riesgo:** D7 suma el anillo 3D en su caja de un día. El orden de corte
sigue en `TASKS.md`: primero cae el stretch de D8, luego el anillo.

**Fuera de plan, ya en `main` (D-038):** pantalla de carga de marca al abrir
"/" (`PantallaCarga.tsx`), encargo directo de CEO aprobado con el usuario a
mitad del plan, sin paso previo por `TASKS.md` — registrado ahora en el
mismo bloque que la integra. Dirigida por Design Lead a
`creative-director` (rama `worktree-agent-a539e9c93480da821`, commit
`10b367e`); autocontenida, no tocó `layout.tsx`, mismo patrón que el
interruptor de tema (D-034). Verificado por Product Manager, no solo por el
reporte de Design Lead: diff acotado a `web/src/app/page.tsx` (import y
montaje de una línea) y el componente nuevo; sin cruce con ningún alcance
activo de `TASKS.md` (D6/D7 no tocan `/`); `lint`/`build` corridos de forma
independiente sobre la rama y de nuevo sobre `main` ya mergeado (`0406214`),
los dos en verde.

**Revisión visual cerrada el 2026-09-21 por el orquestador** (navegador
real, ni Design Lead ni Product Manager tienen esa herramienta en su rol):
desktop y mobile (375px, confirmado por DOM), temas claro y oscuro, sin
defectos — barra, contador y textura correctos, transición a "/" sin
salto. Detalle sin relación con esta tarea: en la primera carga hay un
flash de un frame entre el tema por defecto y el real, del mecanismo de
detección de D-034, no de `PantallaCarga.tsx`; no bloquea nada. Ver D-038
en `DECISIONS.md`.

**Fuera de plan, auditoría de accesibilidad (ux-designer), mergeada en
`36db4cc`:** tres arreglos puntuales de bajo riesgo sobre `/acuerdo/[id]` —
`"use client"` faltante en `TablaReparto.tsx` (no rompía nada hoy, pero era
fragilidad latente si algo la monta desde un Server Component); tooltip de
`HashVivo.tsx` visible con foco por teclado además de hover (WCAG 1.4.13);
área de toque del botón de copiar y del enlace al explorador en
`HashVivo.tsx` llevada a 24×24px (WCAG 2.5.8), sin correr el layout visual
de la fila. Verificado por Design Lead (`lint`/`build`) antes de pedir el
merge; Product Manager repitió ambos sobre `main` ya combinado, en verde.
Sin entrada nueva en `DECISIONS.md`: son correcciones puntuales de
accesibilidad, no una decisión de arquitectura o alcance.

**Bloqueado por:** nada.

## `web` — ✅ D6 código listo, corrida real diferida a D8

**Hecho:** andamiaje de Next.js 16 con App Router, TypeScript y Tailwind 4,
adelantado de D4 a D3 (D-032). En D4 (rama `feat/web-identidad-borrador`,
integrada en 147e8b0): Privy con entrada por correo (wallet embebida) y
conexión de wallet externa (`web/src/lib/privy.ts`, `providers.tsx`);
viem/wagmi con la cadena HSKChain Testnet redefinida para el explorador
correcto (`web/src/lib/wagmi.ts`); goteo de gas idempotente del lado del
servidor (D-035, `web/src/app/api/goteo/route.ts`); `/nuevo` con formulario
de participantes, validación de bps a 10000 exacto, direcciones repetidas y
vista previa con los componentes de D3; guardado del borrador en el relay de
Supabase con generación del link (`web/src/lib/supabase.ts`). La app
degrada con gracia sin `NEXT_PUBLIC_PRIVY_APP_ID`: se sirve sin Privy en vez
de romper el build.

**Hecho en D5** (rama `feat/web-firma-eip712`, integrada en `bdfe39a`):
`/acuerdo/[id]` conectada a datos reales — `page.tsx` queda como server
component que solo desenvuelve el `[id]`, todo el resto pasa a
`AcuerdoCliente.tsx` (nuevo, cliente). Firma EIP-712 con `useSignTypedData`
de wagmi; `web/src/lib/firma.ts` (nuevo) trae el dominio, los tipos, el ABI
mínimo del `SplitPoolFactory` ya desplegado, `calcularStructHash` y
`recuperarFirmante`. Escritura y lectura de firmas en el relay
(`web/src/lib/supabase.ts` extendido: `obtenerBorrador`, `obtenerFirmas`,
`guardarFirma`) con verificación criptográfica de cada fila antes de
confiarla —recuperando el firmante y comparándolo contra el `signer`
declarado— porque el relay no tiene unicidad (D-031) y puede traer filas
basura. Estado de firmas por participante reflejado en `TablaReparto` y
`EstadoAcuerdo`. Despliegue del pool en una sola transacción con la última
firma, disparado desde la sesión de quien firma al completar el cupo, nunca
desde quien solo recarga la página. Protección anti-doble-despliegue en dos
capas: `consumed(structHash)` leído en cadena antes de firmar/desplegar
(fuente de verdad real) y una clave de `sessionStorage` por `structHash`
para resumir una tx ya enviada por esta misma pestaña sin reenviarla si la
página se recarga a mitad de la confirmación.

**Fix aplicado antes de mergear** (commit `36a5396`, ver D-037 en
`DECISIONS.md`): `calcularStructHash` empaquetaba `participants`/`bps` con
`encodePacked` pasando cada elemento suelto, que en viem no aplica el
relleno a 32 bytes que sí aplica `abi.encodePacked(array)` en Solidity. El
hash no coincidía con el que calcula el contrato ya desplegado, así que
`leerConsumido`/`buscarPoolDesplegado` nunca iban a encontrar el pool recién
creado — justo el paso posterior al momento más importante del video. La
firma EIP-712 en sí no tenía el bug. Verificado con un oráculo independiente
antes de integrar.

**Rama descartada, no mergeada:** `feat/web-firma-snap` (commit `6451032`)
es el mismo trabajo sin el fix de arriba. Queda sin fusionar; a borrar
cuando se confirme que no hace falta como referencia.

**Integración con `design`:** ver el sello de tinta en la sección `design`
de arriba — el cableado de `SelloTinta` en `AcuerdoCliente.tsx` lo hizo
Product Manager al mergear, cambio mínimo de una línea de import y una de
JSX.

**Validación:** `next build` y `eslint` pasan sobre las dos ramas ya
integradas y combinadas (verificado 2026-09-21). `NEXT_PUBLIC_PRIVY_APP_ID`
ya está puesto en `web/.env.local` (el usuario lo proveyó); un smoke check
con `next dev` contra `/acuerdo/[id]` confirmó que el SSR ya no cae en el
fallback "Falta NEXT_PUBLIC_PRIVY_APP_ID" sino en el estado normal de carga
— la variable está bien cableada. `DEPLOYER_PRIVATE_KEY` sigue sin estar en
ese `.env.local`: sin ella el goteo responde 500, sin tumbar el resto de la
app (gap conocido desde D4, ver sección `infra`); si la última firma de la
corrida real de D8 la completa una wallet embebida sin HSK, esto podría
bloquear el `createPool` final por falta de gas, no solo el goteo — a
confirmar cuando se arme esa corrida.

**Diferido a propósito, no bloqueante:** el criterio de terminado de D5 en
`docs/SCOPE-PLAN.md` —"tres sesiones distintas firman y el pool aparece en
el explorador"— **sigue sin verificarse de forma conductual**, solo por
tipos, build y criptografía (`structHash` con oráculo independiente,
D-037, y una revisión de código con triple cruce). El usuario decidió
avanzar igual a D6 y correr esa verificación real más adelante, junto con
los ensayos de punta a punta de D8, que ya la exigían de todos modos —no
duplica trabajo. Ver `TASKS.md` D8.

**Bug bloqueante encontrado y arreglado durante la corrida real de D5/D6
(2026-09-21, adelantada antes de D7 con luz verde de CEO — ver `TASKS.md`).**
`guardarBorrador` en `web/src/lib/supabase.ts` encadenaba
`.insert({...}).select("id").single()`, que Postgres traduce a `INSERT ...
RETURNING id`. La tabla `drafts` tiene política de `insert` para `anon` pero
a propósito no tiene política de `select` (D-031, se lee solo por
`get_draft`), y Postgres exige esa política inexistente para el
`RETURNING`, así que todo guardado de borrador fallaba con "new row
violates row-level security policy for table drafts". El orquestador
reprodujo la causa exacta con SQL directo contra el proyecto Supabase real
(`snapline`, `qevrbssusazpeeuhhgxk`), con `set local role anon`, antes de
mandarlo a arreglar. Arreglado por frontend-engineer (worktree
`agent-a2585982a4427b4de`, commit `8578c7e`): el `id` se genera en el
cliente con `crypto.randomUUID()` y se inserta explícito, sin encadenar
`.select()` — sin `RETURNING` no hace falta política de lectura, y D-031
no cambia. No toca `guardarFirma` (confirmado sin el mismo patrón),
migraciones ni políticas RLS. Verificado de forma independiente por Product
Manager antes de mergear: `next build`/`eslint` en verde sobre la rama,
diff de un solo archivo, `git merge-tree` limpio contra `main`. La corrida
real de D5/D6 sigue en curso: falta el click real en la UI a través de
Privy, que retoma el orquestador desde el checkout principal
(`F:\Projects\SNAPLINE-AI`, rama `main`) ahora que el fix está integrado.

**Segundo bug bloqueante encontrado y arreglado en la misma corrida real de
D5/D6 (2026-09-21).** El RPC público de HSKChain Testnet no manda
`Access-Control-Allow-Origin`, así que cualquier `fetch` JSON-RPC hecho
directo desde el navegador (Privy/wagmi vía `usePublicClient()`) se
bloqueaba por CORS — el mismo click real en la UI que retomaba el punto
anterior topaba con esto de inmediato. Arreglado (worktree
`agent-a3df3cf7dd07d021f`, commit `45533ec`): `web/src/app/api/rpc/route.ts`
(nuevo) es un proxy same-origin que reenvía el POST server-to-server, sin
restricción de CORS — mismo patrón que `web/src/app/api/goteo/route.ts`.
`wagmiConfig` (`web/src/lib/wagmi.ts`) apunta su `transport` a `/api/rpc` en
vez de al RPC externo directo; `RPC_URL` y
`hashkeyTestnet.rpcUrls.default.http` quedan intactos porque `api/goteo/route.ts`
corre server-side y no tiene el problema. Verificado de forma independiente
por Product Manager antes de mergear: `next build`/`eslint` en verde sobre
la rama, con `/api/rpc` registrado junto al resto de las rutas; diff de dos
archivos; sin cruce con ningún otro worktree activo. La corrida real de
D5/D6 sigue en curso, ahora con ambos fixes integrados en `main`.

**Hecho en D6** (worktree `agent-a374d5e4199c337c3`, rama
`worktree-agent-a374d5e4199c337c3`, commit `e9f0551`, integrada en
`7049ffe`): `web/src/lib/token.ts` (nuevo) trae el ABI mínimo de `MockUSDT`
—dirección literal copiada de `deployments/hashkey-testnet.json`, mismo
patrón que `firma.ts`— y los helpers de conversión de unidades.
`web/src/lib/pool.ts` (nuevo) trae el ABI mínimo de `SplitPool`, sin
dirección hardcodeada: llega por el parámetro `[dir]` de la ruta. `/pagar/[dir]`
(`page.tsx` + `PagarCliente.tsx`) es un link público sin sesión, con
`MockUSDT.mint()` como faucet a la vista —público y sin permisos en el
contrato, a propósito, distinto del goteo de HSK que sí necesita clave
privada— y transferencia directa al pool sin `approve`: `SplitPool.sol` no
tiene función de depósito. `/pool/[dir]` (`page.tsx` + `PoolCliente.tsx`)
lee total recibido, mi parte y ya retirado en una sola llamada
(`leerCifrasPool`), y el botón de retiro usa la misma protección
anti-doble-envío por `sessionStorage` que el despliegue de D5 en
`AcuerdoCliente.tsx`. Ninguno de los dos archivos nuevos ni las dos rutas
tocan `web/src/lib/acuerdo.ts`, `web/src/lib/wagmi.ts` ni `layout.tsx`.

**Validado por Product Manager antes de mergear, no solo por el reporte de
quien construyó:** `next build` y `eslint` en verde corridos de forma
independiente sobre la rama; `git merge-tree` contra `main` sin conflictos;
`MOCK_USDT_ADDRESS` en `token.ts` coincide con
`deployments/hashkey-testnet.json`. Lectura RPC directa contra un **pool de
prueba manual** en HSKChain Testnet (dirección `0x4A1e98488d6b5601F739362ceE0e45a6284c431d`,
bytecode de 45 bytes — tamaño de un clon EIP-1167, coherente con que salió
de `SplitPoolFactory.createPool()` y no de un despliegue directo, que
`SplitPool.sol` bloquea solo): `totalReceived` = 40.000000 mUSDT,
`totalWithdrawn` = 24.000000 mUSDT, `balanceOf(pool)` = 16.000000 mUSDT —
40 = 24 + 16. **No es el pool del demo** — ese sale del flujo real de firma
de D5, diferido a D8 — se anota así para no confundir con datos de D8.

**Diferido a propósito, no bloqueante (mismo motivo que D5):** ninguna
transacción de `/pagar/[dir]`/`/pool/[dir]` se firmó todavía desde una
wallet de navegador vía Privy — falta `NEXT_PUBLIC_PRIVY_APP_ID` en el
worktree donde se construyó D6. Verificación conductual diferida a D8,
junto con la de D5. Ver `TASKS.md` D8.

**Bloqueado por:** nada para seguir a D7. Las verificaciones conductuales
de D5 y D6 quedan anotadas como tareas de D8, no como bloqueo de `web`.

## `demo` — 🟡 Guion escrito

**Hecho:** guion plano por plano y datos de la demo fijados en
`docs/DEMO-SCRIPT.md`.

**Falta:** cargar los datos, tres ensayos de punta a punta, grabación y
edición.

**Bloqueado por:** necesita el flujo completo funcionando (D7).

---

## Riesgos abiertos

| Riesgo | Mitigación prevista |
|---|---|
| Privy consume más tiempo del previsto | Corte a las 3 horas en D4: se cae a wallet externa y la embebida pasa a stretch de D8 |
| El despliegue multi-firma (D5) se atrasa | Es el día crítico. Si se cae, se sacrifica D7 completo (pulido y animación) |
| El código de D5 (firma, despliegue, snap) y D6 (`/pagar`, `/pool`) está integrado a `main` pero la verificación conductual real (tres sesiones, Privy, pool en el explorador, pago y retiro desde navegador) queda diferida a D8 por decisión del usuario | `NEXT_PUBLIC_PRIVY_APP_ID` ya está puesto en `web/.env.local`; falta correr la prueba, prevista junto con los ensayos de punta a punta de D8 (ver `TASKS.md`). Si la última firma la completa una wallet embebida sin HSK, revisar si hace falta `DEPLOYER_PRIVATE_KEY` para esa corrida, no solo para el goteo |
| El faucet de HSKChain Testnet falla el día de grabar | MockUSDT tiene faucet propio. Para el gas: reservar HSK de testnet con anticipación en D2 |
| El stretch de pago en pesos se come tiempo del ensayo | Solo se toca si D1–D7 cerraron a tiempo. Corte a las 6 horas en D8 |
| Las wallets embebidas se crean sin gas y no pueden retirar | Goteo de HSK implementado (`web/src/app/api/goteo/route.ts`), pendiente de `DEPLOYER_PRIVATE_KEY` en `web/.env.local` para probarlo de punta a punta. Privy con HSKChain Testnet aún sin probar en el navegador |
| La guía de submission de Cali aparece tarde y exige algo no previsto | Conseguirla cuanto antes. Está en `TASKS.md` como bloqueada por información externa |

## Contexto del evento

Verificado en `eag-global-buildathon.devfolio.co` el 2026-09-20:

- Premio único de **$12.500 bajo "EAG Scholarship"**, sin bounties por
  patrocinador ni por cadena. El jurado financia continuación, no la demo:
  `docs/ROADMAP.md` y el cierre de `docs/PITCH.md` son material juzgado, no
  cortesía.
- Seis tracks públicos; el nuestro es **Real-World Ethereum Applications**.
  El track Colombia no figura en la página pública.
- Equipos de 1 a 4. Ir solo no penaliza.
- El envío se hace en Devfolio y pide un enlace en vivo.

### Estado del envío

Borrador creado en Devfolio el 2026-09-20: proyecto `snapline-1ece` en la
cuenta `mab015`, estado `draft`, sin publicar. Rellenado por el MCP de
Devfolio con datos del repositorio — tagline, ocho tecnologías, plataforma
web, enlace al repositorio público y las dos respuestas obligatorias del
organizador ("The problem it solves" y "Challenges we ran into"). Aplicado al
track **Real-World Ethereum Applications**, que confirma lo verificado arriba.

La ficha está escrita en inglés y declara sin maquillar lo que falta: que no
hay frontend, que el pago en pesos es simulado y que el fuzzing es empírico y
no prueba formal.

**Desactualizada desde el despliegue de D2.** La ficha todavía dice que nada
está desplegado en cadena. Ya no es cierto: hay tres contratos verificados en
HSKChain Testnet. Hay que corregir ese párrafo y añadir las direcciones antes
de publicar. No se toca ahora porque la ficha se cierra de una vez en D9–D10,
junto con las capturas.

**Falta para publicar: capturas.** Devfolio exige de 1 a 6 y que sean reales
del proyecto corriendo, no generadas. Sin interfaz no hay nada que capturar,
así que el envío no se puede cerrar antes de D4. Es el único requisito
pendiente; el resto del checklist de publicación ya está cubierto.

No se aplicó ningún track de sede — Cali, Brasil, Bolivia, Ghana, Nigeria —
porque depende de si se participa presencialmente. Sí aparecen en la lista de
tracks del MCP, aunque el de Colombia no figure en la página pública.

## Decisiones pendientes

Ninguna. Todas las decisiones de diseño abiertas se cerraron en D0 y están
en `DECISIONS.md`.
