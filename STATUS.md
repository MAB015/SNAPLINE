# Estado del proyecto — SNAPLINE

**Última actualización:** 2026-09-22 · **Bloque cerrado:** D6 · `/pagar/[dir]` y `/pool/[dir]` en main, código verificado por build/eslint y lectura de cadena real contra un pool de prueba manual; verificación conductual real diferida a propósito a D8 junto con la de D5 (decisión del usuario). En curso: D7 `design` (peso visual de `/` con referencia Sharplink.com, tarjetas y fix de parpadeo mergeados en `9849a5b`). Cerrado en esta pasada: mitigación del hang no determinista de Privy post-firma en `/pagar` y `/acuerdo/[id]` (D-043).
**Cierre del hackathon:** 1 de octubre de 2026 · **Días restantes de trabajo:** 10

Este archivo se actualiza en el mismo commit que el trabajo que describe.

---

## Resumen

| Área | Estado | Siguiente |
|---|---|---|
| `docs` | ✅ Listo | Solo mantenimiento del tracking |
| `infra` | 🟡 D4 casi listo | Cuentas del demo ya fondeadas; Vercel en D9–D10 |
| `contracts` | ✅ D2 desplegado | Consumido desde D5 web; sin tareas propias hasta D8 |
| `design` | ✅ D5 listo, landing D-039 cerrada | D7 · anillo 3D y pulido |
| `web` | ✅ D7 (parte web) código listo, corrida real en D8 | D7 · pulido de `design` (anillo 3D, sello, tema oscuro) |
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

**Fondeo de las cuatro cuentas del demo**, cerrado el 2026-09-21: las cuatro
direcciones de `docs/DEMO-SCRIPT.md` (Mariana y Julián con wallets externas,
Sofía y Andrés con wallets embebidas creadas por login de Privy) ya existen y
tienen 0,01 HSK cada una vía `/api/goteo`, confirmado en cadena con
`eth_getBalance`. Direcciones, roles y bps documentados en
[`docs/DEMO-ACCOUNTS.md`](docs/DEMO-ACCOUNTS.md); los correos reales detrás de
los alias quedan fuera del repo a propósito, en `local-notes/` (sin
versionar). Cierra las tareas de D2 y D8 sobre reserva y fondeo de cuentas —
ver `TASKS.md`. `DEPLOYER_PRIVATE_KEY` y `NEXT_PUBLIC_PRIVY_APP_ID` están
presentes y no vacías en `web/.env.local` del checkout principal, comprobado
sin exponer valores el 2026-09-21 (rama `main`, en paralelo al fondeo) — el
goteo también se verificó de forma independiente, ver más abajo en la
sección `web` y D-041 en `DECISIONS.md`.

**Falta:** proyecto de Vercel y primer despliegue, bloqueado en `TASKS.md`
hasta D9–D10.

**Nota:** el CI no se añade hasta que haya algo que construir. Un `main` con
CI en rojo incumple la regla de "siempre desplegable".

**Bloqueado por:** nada en este momento. Remoto configurado:
https://github.com/MAB015/SNAPLINE.git.

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
gwei. Del saldo de la cuenta de despliegue, 0,04 HSK ya se gastaron el
2026-09-21 fondeando las cuatro cuentas del demo con 0,01 HSK cada una (ver
`infra`); quedan ~0,058 HSK para el goteo de gas del resto del proyecto.

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

**Generación D8 (mitigación de hang post-firma), EN CURSO (2026-09-22).** Un
único worktree (`agent-ae7d6eb5fed5ef349`, rama `feat/web-fix-pagar-hang`,
`HEAD` en `7b08028` al arrancar —mismo commit que el merge-base con `main`,
sin commits propios todavía—), dirigido por CTO a `frontend-engineer`, para
cerrar el bug reportado a CTO en la corrida conductual en vivo de más abajo
("Corrida conductual en vivo"): la UI no confirma visualmente pago/despliegue
aunque la transacción sí se completa en cadena. Alcance de esta pasada:
`esperarRecibo` (nuevo, `web/src/lib/recibo.ts`) aplicado a
`web/src/app/pagar/[dir]/PagarCliente.tsx` y
`web/src/app/acuerdo/[id]/AcuerdoCliente.tsx` — timeout más fallback de
lectura de recibo tras la firma/pago, en vez de depender solo del evento del
wallet. Confirmado sin cruce con ningún otro worktree activo a esta fecha:
ninguna rama viva (`feat/web-firma-eip712`, `feat/web-privy-integracion` ni
los `worktree-agent-*` en pie) toca esos archivos. **Excluido de esta
pasada:** `web/src/app/pool/[dir]/PoolCliente.tsx` — sigue bloqueado porque
el orquestador está retirando en vivo desde esa pantalla ahora mismo (ver
"Corrida conductual en vivo" abajo); entra en una segunda pasada cuando esa
corrida libere el archivo. **Falta antes de revisar para mergear:** limpiar
logs de debug y comitear — el diff actual está sin trackear en el worktree.

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

**Fuera de plan, landing completa en "/" (D-039), mergeada en dos etapas:**
`web/src/app/page.tsx` reemplaza la vitrina de componentes de D3 por hero,
casos de uso en texto con filetes, bloque de confianza en superficie `chain`
(tres direcciones con hash vivo y cifras exactas de auditoría) y un único
CTA "Crear tu acuerdo" → `/nuevo`. Componentes nuevos: `ContadorTests.tsx`
(envuelve `ContadorNumero` porque `page.tsx` es de servidor y no puede
pasarle una función como prop a un componente de cliente) y
`EjemploBarraHero.tsx`. Construida por Design Lead/creative-director (rama
`feat/design-landing-acta-viva`): primer commit `1c55134` con el hero sin
autoplay (`tensada` fijo en `false`), segundo commit `12432ac` cableando el
autoplay — temporizador de 350ms al montar en vez de
`IntersectionObserver` (el hero siempre está en el viewport ni bien carga),
y `BarraSegmentada` ya resuelve `prefers-reduced-motion` internamente con
`gsap.matchMedia`, así que `EjemploBarraHero` solo evita la espera
artificial (retraso 0) cuando reduced motion está activo. D-039 cierra sin
salvedades. Verificado por Product Manager antes de mergear, no solo por el
reporte del especialista: `next build`/`eslint` en verde sobre la rama
completa, `git status` confirmó que el segundo commit tocó un solo archivo,
`git merge-tree` contra el `main` ya integrado con CORS y D7-web sin
conflictos, y `lint`/`build` repetidos sobre `main` ya combinado. Ver D-039
en `DECISIONS.md`.

**Fuera de plan, peso visual de la sección de confianza en "/" con
referencia Sharplink.com, mergeada en `9849a5b`:** dos commits de
creative-director sobre el mismo worktree
(`agent-ab2ab49c168025e3a`/`worktree-agent-ab2ab49c168025e3a`), integrados
juntos por venir apilados. `caf5e70` reemplaza el bloque de texto corrido
de "Verificado en cadena" por `TarjetaMetrica.tsx` (nuevo, reusable):
tarjeta de superficie `chain` con etiqueta chica y contenido libre, sin
glow ni degradado (`docs/BRAND.md` §12 — el peso lo dan tamaño, contraste y
espacio, no luz), patrón adaptado de `docs/DESIGN-REFERENCES.md`. Tres
tarjetas: auditoría (`ContadorTests`), casos de fuzzing (`ContadorFuzz.tsx`,
nuevo) y contratos verificados (`HashVivo`). `TarjetaMetrica` queda aislada
para reusarse en `/pool/[dir]` cuando ese archivo se libere (en espera de
CTO, que hoy lo tiene tomado por la investigación de Privy).

**Lenis reevaluado para `/`, a pedido explícito del usuario**, con este
mismo pivote de layout de Fase A como disparador: CEO concluyó que sigue
prematuro, la condición de reapertura de `docs/ROADMAP.md` todavía no se
cumple. Detalle completo en D-044, `DECISIONS.md`.

El segundo commit (`54d9c40`) corrige un bug real encontrado por Design
Lead en su propia verificación visual antes de pedir el merge: parpadeo
"aparece completo → desaparece → reaparece al hacer scroll" en la lista de
"Para quién es" y la grilla de "Verificado en cadena" — mismo patrón que el
bug de `ContadorNumero` en D5. `RevelaEnScrollUl`/`RevelaEnScrollDiv`
(nuevos, `web/src/components/RevelaEnScroll.tsx`) envuelven ese contenido;
la clase `revela-en-scroll` (`globals.css`, gateada por
`prefers-reduced-motion: no-preference`) fija opacidad 0 y desplazamiento
en los hijos directos desde el primer pintado, antes de que corra el
`useEffect` de GSAP (`web/src/lib/revelaEnScroll.ts`), para que el reveal
nazca ya oculto en vez de aparecer y recién después esconderse.
`HashVivo.tsx` suma el prop opcional `dispararEnVista` (default `false`,
sin cambio de comportamiento en ningún uso existente — `AcuerdoCliente.tsx`,
`PagarCliente.tsx`, `PoolCliente.tsx` siguen disparando al montar) para que
el scramble del hash dispare al entrar en viewport en vez de al montar,
porque esos hashes quedan bajo el pliegue. Con `prefers-reduced-motion:
reduce` la regla CSS no aplica y GSAP resuelve la misma preferencia en JS,
así que el contenido nunca pasa por un estado oculto.

**Verificado en el navegador, no solo por el reporte de Design
Lead/creative-director:** el orquestador confirmó que la regla mediaquery
está realmente en la hoja de estilos servida (`document.styleSheets`) antes
de cualquier JS, con el texto exacto de la regla. Product Manager repitió
`next build`/`eslint` de forma independiente tres veces —sobre la parte ya
commiteada del worktree, sobre el fix ya commiteado, y de nuevo sobre
`main` ya combinado (`9849a5b`)— las tres en verde, con las nueve rutas
esperadas generadas. `git merge-tree` confirmó sin conflictos contra el
`main` real vigente (`7b08028`, que ya tenía el proxy de Privy de D-041)
antes de integrar.

**Nota de proceso:** el fix llegó al worktree sin commitear, mismo patrón
que D6, pero a diferencia de esa vez no había una sesión propia de
creative-director a la que devolverle el pedido de "commiteá antes de
mergear" dentro de esta corrida — el pedido llegó ya empaquetado como
encargo de cierre para Product Manager, sin otra sesión activa a mano. Se
commiteó como Product Manager (`54d9c40`) en vez de dejarlo sin cerrar,
desviación puntual del patrón de D6 que queda anotada aquí; para el
próximo bloque, seguir prefiriendo que cada especialista commitee su
propio trabajo cuando haya una sesión activa a la que pedírselo.

**Fase A del pivote de layout a ancho completo, cerrada (merge de
integración en `main`), tres commits del worktree
`agent-a8c86285bae941d3d`:** cambio de metáfora visual en `/` — de columna
centrada (`max-w-3xl`) a ancho completo real, a pedido explícito del
usuario ("no quiero que se vea acotado, en la mitad"). `page.tsx` pierde el
cap tanto del `<main>` como del contenido de la sección `chain`, sin volver
a poner `max-w-7xl` como se había evaluado antes; la sección `chain` sangra
a todo el viewport con el truco `left-1/2`/`-translate-x-1/2`/`w-screen`, y
el `<main>` suma `overflow-x-hidden` para que el redondeo de `100vw` contra
la barra de scroll no fuerce scroll horizontal. Los párrafos largos siguen
protegidos por `max-w-prose` donde ya lo estaban. La grilla de
`TarjetaMetrica` en "Verificado en cadena" pasa de `sm:grid-cols-2` a
`lg:grid-cols-4` porque, sin el cap de 1280px, dos columnas dejaban cada
tarjeta de cifra única demasiado ancha y vacía en desktop.

En el mismo bloque: `InterruptorTema.tsx` pasa de botón de texto a ícono
sol/luna en línea (área de toque 32×32, foco visible) y la preferencia
explícita del interruptor pasa a persistir en `localStorage`
(`snapline:tema`) vía `useSyncExternalStore`, así que ya no queda contenida
a cada pantalla por separado como fijó D-034 — ahora se comparte entre `/`
y `/acuerdo/[id]`. Los reveals de scroll se intensifican (desplazamiento de
16px a 28px, stagger de 0.08s a 0.12s en `revelaEnScroll.ts`, con el mismo
valor de reposo replicado en `globals.css` para no reintroducir el
parpadeo de D5) y la lista "Para quién es" suma un marcador de color por
participante (`trama-${tokenParticipante(i)}`, mismo patrón que la leyenda
de `BarraSegmentada.tsx`, sin token nuevo).

Esto es un cambio de dirección respecto de la columna angosta que fijaba
`docs/BRAND.md` hasta ahora; el documento todavía no está actualizado para
reflejar la metáfora de ancho completo. Queda pendiente para Design Lead
en un paso aparte — no lo reescribo yo por no tener el criterio completo
de sistema visual que sí tiene Design Lead.

**Verificado por Product Manager antes de mergear:** `eslint`/`next build`
en verde sobre la punta de la rama (nueve rutas esperadas), y de nuevo
sobre `main` ya combinado. Confirmado por lectura directa de código —no
solo por el reporte recibido— que `InterruptorTema.tsx` usa `localStorage`
(seis referencias) y que `page.tsx` no tiene `max-w-3xl` ni `max-w-7xl`
como clase real (las únicas coincidencias son comentarios explicando por
qué se sacaron). `git merge-tree` contra el `main` vigente sin marcadores
de conflicto; el único commit de `main` por delante de la base de esta
rama (`67980a7`) solo tocaba `STATUS.md`, sin cruce de archivos. Sin cruce
con el frente paralelo de Privy en `PoolCliente.tsx`
(`feat/web-pool-timeout-fallback`, sin commits propios por encima de
`main` al momento de este merge).

**Bloqueado por:** nada.

## `web` — ✅ D7 (parte web) código listo, corrida real diferida a D8

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
— la variable está bien cableada. `DEPLOYER_PRIVATE_KEY` está presente y no
vacía en ese `.env.local`, verificado por Product Manager el 2026-09-21 sin
mostrar valores, y confirmado funcional: ver el tercer bug bloqueante más
abajo, donde el goteo se probó de punta a punta contra la testnet real y el
`createPool` final de la corrida de D5/D6 se completó con gas pagado por una
wallet embebida de Privy (D-041).

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

**Tercer bug bloqueante encontrado y arreglado en la misma corrida real de
D5/D6 (2026-09-21).** El proxy same-origin de arriba resolvió las lecturas
que pasan por `wagmiConfig.transports`, pero el cliente interno de Privy
para operaciones de la wallet embebida (nonce, estimación de gas, broadcast)
no lee `wagmiConfig`: lee la cadena pasada a
`PrivyClientConfig.defaultChain`/`supportedChains`, que seguía apuntando al
RPC externo sin CORS — el mismo bloqueo de antes, ahora en el paso final de
`createPool`, que ni llegaba a abrir el modal de Privy. Arreglado (worktree
`agent-a7c2e6741788a6cd8`, commit `8dfcfce`): `addRpcUrlOverrideToChain`
(API oficial de `@privy-io/react-auth`, ver
docs.privy.io/basics/react/advanced/configuring-evm-networks) agrega una
entrada `rpcUrls.privyWalletOverride` que el cliente de Privy prioriza sobre
`rpcUrls.default`, sin mutar el objeto `hashkeyTestnet` que usan
`api/rpc/route.ts` y `api/goteo/route.ts` server-side. Ver D-041 en
`DECISIONS.md`.

Verificado de forma independiente por Product Manager antes de mergear:
`next build`/`eslint` en verde sobre la rama; diff acotado a
`web/src/lib/wagmi.ts` y `web/src/lib/privy.ts`, sin tocar
`api/rpc/route.ts` ni `api/goteo/route.ts`; `git merge-tree` contra `main`
sin conflictos. `/api/goteo` probado con `curl` contra la testnet real:
dirección fresca goteada con recibo confirmado
(`eth_getTransactionReceipt` con `status: 0x1`, minado en bloque real),
segunda llamada a la misma dirección no volvió a gotear (idempotencia),
dirección inválida rechazada con error.

**Con este tercer fix, la corrida real de D5 llegó a su paso final: CEO
hizo el click-through real en el navegador**, contra el dev server del
worktree del fix, con el acuerdo
`5a58a173-e81d-41f9-a961-efe927b0c386` (tres firmas ya puestas): el modal
real de Privy "Approve transaction" apareció por primera vez (antes ni
llegaba a mostrarse por el CORS) y el firmante P3
(`0x40a7a99D17F1020CcEf27a793C0A19D32e466875`) disparó `createPool`. Pool
desplegado en `0x4D434ab58bb4128FF656DaAD33C38D58eC88B7a5`, verificado de
forma independiente por RPC directo: `eth_getCode` en esa dirección
devuelve bytecode real de clon EIP-1167 (45 bytes) apuntando a la
implementación `0x88ceD9e8…FE7F`; `eth_getTransactionCount` de P3 pasó de
`0x0` a `0x1`.

**Sigue pendiente, no bloqueante:** la recarga a mitad de la confirmación
(protección anti-doble-despliegue) y la corrida real completa de D6
(`/pagar`/`/pool` con wallet de navegador: faucet, pago, retiro) no se
corrieron en esta sesión — el click-through cubrió el paso final de D5
(login, firma acumulada, `createPool`), no la corrida completa de D6. Ver
`TASKS.md` D8.

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

**Hecho en D7** (worktree `agent-abec8784811189666`, commit `4907ecf`):
interfaz `OffRampProvider` (`quote`/`execute`/`status`) y `MockOffRamp` como
única implementación del MVP (`web/src/lib/offramp/`), con tasa COP/USD y
comisión de 150 bps declaradas como ilustrativas en el código. Ruta nueva
`/retiro-cop/[dir]` (`page.tsx` + `RetiroCopCliente.tsx`): cotiza la parte
liberable del participante, muestra comisión y neto en pesos, pide una
cuenta destino simulada y emite un comprobante marcado como simulado en
tres lugares — el tipo (`simulado: true`), la nota del comprobante y
`SelloSimulado` en pantalla desde el primer frame. No toca `wagmi.ts`,
`pool.ts` ni `token.ts`; reusa `leerCifrasPool` para la parte liberable.

**Validado por Product Manager antes de mergear:** `next build`/`eslint` en
verde sobre la rama, con `/retiro-cop/[dir]` registrado; `git merge-tree`
contra `main` sin conflictos; sin cruce con ningún otro worktree activo.

**Diferido a propósito, no bloqueante:** sin verificación conductual real
contra una wallet de navegador vía Privy — mismo motivo que D5/D6, entra en
los ensayos de D8.

**Bloqueado por:** nada para seguir con el resto de D7 (`design`: sello de
simulado en el resto de superficies, anillo 3D, recibo de transacción,
tema oscuro). Las verificaciones conductuales de D5, D6 y D7 quedan
anotadas como tareas de D8, no como bloqueo de `web`.

**Bug bloqueante encontrado y arreglado durante la corrida conductual en
vivo de D8 (2026-09-22): hang no determinista de Privy post-firma.**
Con los tres fixes de CORS de D-041 ya integrados y el modal de Privy
abriendo bien, el orquestador encontró en `/pagar` y `/acuerdo/[id]` que
`writeContractAsync`/`waitForTransactionReceipt` a veces nunca resolvían su
promesa en el navegador — el botón quedaba colgado para siempre — aunque la
transacción ya estuviera confirmada en cadena real. Comportamiento conocido
de `@privy-io/react-auth` (wallet embebida), no reproducible fuera del
navegador, sin fix de código propio posible (SDK cerrado). Ver D-043 en
`DECISIONS.md` para la causa completa y las dos alternativas descartadas.

Mitigación en `web/src/lib/recibo.ts` (nuevo): timeout más fallback de
lectura de saldo/estado en cadena en vez de esperar indefinidamente, en dos
capas — `esperarRecibo` (con `hash`) y `conTimeout`/`esperarCondicion` (sin
`hash`, el caso más grave). Aplicado en `mintear()`/`pagar()` de
`web/src/app/pagar/[dir]/PagarCliente.tsx` y en `intentarDesplegar()`/el
efecto de resumen de `web/src/app/acuerdo/[id]/AcuerdoCliente.tsx`.
`web/src/app/pool/[dir]/PoolCliente.tsx` (retiro) queda fuera de esta
pasada, sin tocar.

**Verificado en vivo por el orquestador**, no solo por el reporte de quien
construyó: logueado con una identidad de prueba real vía Privy (correo,
código OTP real) contra el dev server del worktree del fix. Mint y pago
dispararon el timeout (bug reproducido en vivo) y el fallback detectó el
saldo real después en ambos casos — cada uno confirmado de forma
independiente con `eth_call` a `balanceOf` contra la wallet y el pool
reales. También se reprodujo el caso de fallo genuino (tx que nunca se
envía, nonce sin avanzar): mostró el error honesto en vez de colgarse.

**Validado por Product Manager antes de mergear:** `next build`/`eslint`
corridos de forma independiente, en verde, con las nueve rutas esperadas
generadas; `git merge-tree` contra el `main` real sin conflictos; diff
acotado a `web/src/lib/recibo.ts` (nuevo), `PagarCliente.tsx` y
`AcuerdoCliente.tsx`, sin tocar `PoolCliente.tsx` ni ningún archivo de otra
área. Mergeado en `7e1e552` (sobre el fix de commit `3f5bc32`).

**Nota de proceso, para CTO:** el worktree asignado originalmente a esta
tarea (`agent-ae7d6eb5fed5ef349`, rama `feat/web-fix-pagar-hang`) partió de
un `main` desactualizado (`7b08028`) y quedó con una versión incompleta del
fix sin commitear — el cierre real vino de otro worktree
(`agent-a8080241421fa3e54`) que también había partido de un `main` viejo
(`482aeb8`, anterior incluso a D-041) pero alcanzó a completar el trabajo
completo antes de mergear. Es la segunda vez en el mismo día que un
worktree nuevo arranca desde un `main` desactualizado — vale la pena
revisar cómo se crean los worktrees de `agent-*` para que partan del
`main` vigente. El worktree viejo (`agent-ae7d6eb5fed5ef349`) quedó con
cambios sin commitear que ya no hacen falta (versión superada, sin el caso
2 de `conTimeout`/`esperarCondicion`): a descartar en una limpieza, no a
mergear — no se tocó desde aquí.

**Sigue pendiente, no bloqueante:** `PoolCliente.tsx` (retiro) probablemente
tiene el mismo patrón de bug, sin confirmar ni tocado. Entra como tarea
aparte. Ver `TASKS.md` D8.
**Corrida conductual en vivo, EN CURSO ahora (2026-09-22).** Es la misma
corrida real de D5/D6 mencionada arriba, adelantada antes de D7 (ver
`TASKS.md` D8) y ya con los dos bugs bloqueantes de esta sección
integrados en `main`. La ejecuta el orquestador directamente contra el
navegador, desde la sesión principal — **no** es un agente con worktree
ni rama propia, así que no va a aparecer en `git log` ni en el mapa de
asignaciones mientras esté activa. Se deja esta nota para que cualquier
agente que revise este archivo sepa que hay actividad en vivo ahora
mismo, sin necesidad de que termine para quedar registrada.

Reportado por el orquestador (Product Manager no verificó estos pasos de
forma independiente, a diferencia de los fixes de arriba — quedan como
reporte de quien los corrió, a confirmar cuando cierre la corrida): las
tres firmas EIP-712 reales de un acuerdo de prueba, el despliegue real de
`createPool` (pool en `0x4D434ab58bb4128FF656DaAD33C38D58eC88B7a5`,
verificado con `eth_getCode`), un mint real de MockUSDT y un pago real de
100 mUSDT al pool (verificados con `eth_call` a `balanceOf`, aunque la UI
no llegó a confirmarlos visualmente — bug ya reportado a CTO, sin
resolver todavía). **Pendiente:** retiro real desde `/pool/[dir]`,
pausado — el orquestador está coordinando con Product Manager para no
cruzarse con ningún worktree que toque `PoolCliente.tsx` antes de
retomarlo.

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
| El código de D5 (firma, despliegue, snap) y D6 (`/pagar`, `/pool`) está integrado a `main`; el paso final de D5 (login, firma acumulada y `createPool`) se verificó el 2026-09-21 con wallet real de Privy tras el tercer fix de CORS (D-041) | Pendiente: recarga a mitad de la confirmación (anti-doble-despliegue) y la corrida real completa de D6 (`/pagar`/`/pool` con wallet de navegador) — ver `TASKS.md` D8 |
| El faucet de HSKChain Testnet falla el día de grabar | MockUSDT tiene faucet propio. Para el gas: reservar HSK de testnet con anticipación en D2 |
| El stretch de pago en pesos se come tiempo del ensayo | Solo se toca si D1–D7 cerraron a tiempo. Corte a las 6 horas en D8 |
| Las wallets embebidas se crean sin gas y no pueden retirar | Goteo de HSK verificado de punta a punta contra la testnet real el 2026-09-21 (`curl`, recibo confirmado, idempotencia). El bloqueo de CORS del cliente embebido de Privy para gastar ese gas está resuelto (D-041) |
| La guía de submission de Cali aparece tarde y exige algo no previsto | Conseguirla cuanto antes. Está en `TASKS.md` como bloqueada por información externa |
| La wallet embebida de Privy puede colgar el botón tras firmar (hang no determinista, sin fix de código propio posible) | Mitigado con timeout + fallback por saldo en `/pagar` y `/acuerdo/[id]` (D-043). Pendiente el mismo patrón en `/pool/[dir]` (retiro) |
| Worktrees de `agent-*` arrancando desde un `main` desactualizado (pasó dos veces el 2026-09-22) | Sin mitigación de proceso todavía — a revisar cómo CTO/orquestador crean los worktrees nuevos |
| La rama de sesión del orquestador (worktree separado del checkout donde vive `main` real) puede quedar varios commits sin mergear mientras `main` avanza en paralelo; el 2026-09-22 esto hizo que dos ramas asignaran D-043 a decisiones distintas (Privy en `main`, Lenis en la rama de sesión), detectado recién al ir a mergear — ver el merge `0a4eb90` que renumeró Lenis a D-044 | Sin mitigación automática todavía. Antes de asignar el próximo número de decisión, Product Manager revisa si hay una rama de sesión activa sin mergear con un número mayor pendiente — no es infalible, pero reduce el riesgo |

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
