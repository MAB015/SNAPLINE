# Estado del proyecto — SNAPLINE

**Última actualización:** 2026-09-21 · **Bloque cerrado:** D3 y D4 · Diseño en Acta Viva, Privy, viem/wagmi y borrador
**Cierre del hackathon:** 1 de octubre de 2026 · **Días restantes de trabajo:** 10

Este archivo se actualiza en el mismo commit que el trabajo que describe.

---

## Resumen

| Área | Estado | Siguiente |
|---|---|---|
| `docs` | ✅ Listo | Solo mantenimiento del tracking |
| `infra` | 🟡 D4 casi listo | Fondeo de testnet; Vercel en D9–D10 |
| `contracts` | ✅ D2 desplegado | D5 · despliegue del pool desde la web |
| `design` | ✅ D3 listo, Acta Viva | D5 · snap 2D con GSAP |
| `web` | ✅ D4 listo | D5 · `/acuerdo/[id]` a datos reales |
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

## `design` — ✅ D3 listo, en Acta Viva

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

**Validación:** `next build` y `eslint` pasan (verificado 2026-09-21, tras
reinstalar `node_modules` — la corrupción era del entorno local, no del
código). Sin tests automáticos de interfaz: la comprobación es visual.

**Falta:** nada del alcance de D3. El pulido y el sello en el resto de
superficies, y el anillo 3D, siguen en D7. El snap 2D con GSAP es D5.

**Riesgo:** D7 suma el anillo 3D en su caja de un día. El orden de corte
sigue en `TASKS.md`: primero cae el stretch de D8, luego el anillo.

**Bloqueado por:** nada.

## `web` — ✅ D4 listo

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

**Validación:** `next build` y `eslint` pasan (verificado 2026-09-21). Sin
`DEPLOYER_PRIVATE_KEY` en `web/.env.local` el goteo responde 500, sin tumbar
el resto de la app — falta ponerlo, ver sección `infra`.

**Falta:** conectar `/acuerdo/[id]` a datos reales y firma EIP-712 (D5);
`/pagar/[dir]` y `/pool/[dir]` (D6); salida a pesos (D7).

**Bloqueado por:** nada. Sigue en D5.

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
