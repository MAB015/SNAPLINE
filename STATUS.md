# Estado del proyecto — SNAPLINE

**Última actualización:** 2026-09-20 · **Bloque cerrado:** D2 · Contratos, firmas y despliegue · **D3 en curso:** parcial, falta portar a Acta Viva
**Cierre del hackathon:** 1 de octubre de 2026 · **Días restantes de trabajo:** 10

Este archivo se actualiza en el mismo commit que el trabajo que describe.

---

## Resumen

| Área | Estado | Siguiente |
|---|---|---|
| `docs` | ✅ Listo | Solo mantenimiento del tracking |
| `infra` | 🟡 CI validado | Fondeo de testnet; viem/wagmi en D4 |
| `contracts` | ✅ D2 desplegado | D5 · despliegue del pool desde la web |
| `design` | 🟡 D3 parcial | Portar tokens/componentes a Acta Viva |
| `web` | 🟡 Andamiaje | D4 · Privy y creación de acuerdo |
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

**Falta:** fondeo de las cuatro cuentas de testnet. El andamiaje de Next.js
se adelantó a D3 y lo hizo `design`; falta añadirle viem/wagmi en D4.

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

Por solicitud del usuario, el trabajo siguiente usa un coordinador principal
y tres agentes con ramas y worktrees separados, creados desde el cierre de D1.
El coordinador fija interfaces, asigna archivos, resuelve dependencias, revisa
entregas y ejecuta los tests integrados antes de cerrar tareas. `main` no recibe
cambios automáticamente.

| Responsable | Rama | Archivos asignables |
|---|---|---|
| Implementación | `feat/contracts-implementation` | `contracts/src/` |
| Pruebas | `feat/contracts-tests` | `contracts/test/` |
| Infraestructura | `feat/infra-validation` | CI y configuración de herramientas |

Worktrees locales bajo `F:/Projects/SNAPLINE-AI-agents/`: `implementation`,
`tests`, `infra` e `integration`. Otro proceso consolidó D1 en main y guardó
los tests en 60e021e. Tras autorización del usuario, el coordinador conservó
esos commits y creó `integration` con `feat/contracts-split-pool` desde 4e6163d.
El checkout principal permanece en main; no se fusionó D2 allí.
Cada agente trabaja únicamente en su directorio; ninguno cambia ramas en el
checkout de otro. Las interfaces compartidas se acuerdan antes de escribir.

Los agentes entregan cambios y evidencia de validación; el coordinador integra
una tarea por commit junto con su tracking. Solo el coordinador modifica
STATUS, TASKS y DECISIONS, para evitar conflictos. Se mantienen cuatro puestos
simultáneos: coordinador y tres agentes. Factory, tests y CI entregados; los
agentes alcanzaron su límite de uso durante la revisión adicional y el
coordinador terminó la integración. En los tests recuperados se corrigieron
aritmética uint16 y una expectativa de revert que interceptaba un getter.
Despliegue pendiente de configuración externa.

## `design` — 🟡 D3 parcial: base en código, falta portar a Acta Viva

**Hecho:** dirección visual revisada de Acta a **Acta Viva** (D-029) y
documentada en `docs/BRAND.md`: narrativa papel → cadena, temas claro y
oscuro, cuatro colores de participante con trama (contraste AA medido),
texturas, hash vivo, inventario de movimiento con GSAP y el anillo 3D del
pool en caja de un día (D-030).

**Hecho en código** (rama `feat/design-sistema-visual`, escrita antes de que
existiera la revisión a Acta Viva): andamiaje de Next.js 16 con App Router,
TypeScript y Tailwind 4, adelantado de D4 (D-032); tokens de Tailwind en
`web/src/app/globals.css` — seis colores, las tres familias de `docs/BRAND.md`
y la escala cerrada de 12 a 56, con las escalas de radio y sombra anuladas
(D-033); cuatro componentes en `web/src/components/`: tabla de reparto con
filetes visibles y cifras en mono tabular, barra segmentada, estado de
firma —por fila y del acuerdo completo— y sello de simulado. Maqueta de
`/acuerdo/[id]` con los datos de `docs/DEMO-SCRIPT.md`, marcada en pantalla
como maqueta. `next build` y `eslint` pasan; las dos pantallas revisadas en
el navegador a 800px y a 375px. El snap de la línea está implementado —380ms,
una vez, sin rebote, y anulado con `prefers-reduced-motion`— y se ve con
`?firmado=1`. No hay tests automáticos de interfaz: la comprobación es visual.

**Desactualizado frente a Acta Viva.** Lo construido sigue la dirección
anterior ("Acta"): un solo acento rojo (`stamp`, visible solo en las marcas de
la línea y en el estado del acuerdo firmado), sin tema oscuro y sin color ni
trama por participante — la tabla y la barra son monocromas. Antes de dar D3
por cerrado hay que portarlo a la especificación vigente.

**Falta:** tema oscuro con interruptor; color y trama por participante en la
barra y en la tabla; texturas en SVG en línea (grano, rejilla, cuatro tramas,
tinta de sello, franjas de precaución), revisadas en un fotograma exportado;
identicon 5×5 desde la dirección; componente de hash vivo (hover, copiar,
enlace al explorador, código de barras del hash de términos); maqueta de
`/acuerdo/[id]` en los dos temas y en los dos estados (papel y sellado en
cadena). El pulido y el sello en el resto de superficies siguen en D7.

**Riesgo:** D3 creció con las texturas, el identicon y el segundo tema, y D7
suma el anillo. El orden de corte está en `TASKS.md`: primero cae el stretch
de D8, luego el anillo. El snap 2D no se corta.

**Bloqueado por:** nada.

## `web` — 🟡 Solo el andamiaje

**Hecho:** andamiaje de Next.js 16 con App Router, TypeScript y Tailwind 4,
adelantado de D4 para poder escribir el sistema visual en su sitio definitivo
(D-029). Dos rutas dibujadas y sin lógica: `/` y `/acuerdo/[id]`. Rutas y
responsabilidades definidas en `docs/ARCHITECTURE.md` §3.

**Falta:** todo lo que toca datos o cadena. viem/wagmi, Privy, Supabase y las
cuatro pantallas restantes.

**Bloqueado por:** nada. Empieza en D4 con Privy.

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
| Las wallets embebidas se crean sin gas y no pueden retirar | Goteo de HSK desde la cuenta de despliegue al crearse (tarea de D4). Confirmar soporte de esta red en Privy durante D4 |
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
