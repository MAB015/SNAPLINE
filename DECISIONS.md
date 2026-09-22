# Log de decisiones — SNAPLINE

Formato: fecha, decisión, por qué, y la alternativa descartada. Lo más
reciente arriba. Una decisión revertida no se borra: se añade una entrada
nueva que la revierte.

---

## 2026-09-22 · Lenis para la landing: todavía no hay caso concreto

### D-044 · Lenis sigue afuera de `/`, incluso reevaluado para el pivote de layout de Fase A
El usuario pidió explícitamente que CEO reevaluara Lenis (scroll suave)
específicamente para la landing, en el marco del pivote hacia un layout de
ancho completo/más inmersivo que Design Lead está por arrancar ("Fase A";
el commit `c61ccac` sincronizó su worktree con `main` antes de esa fase,
pero Fase A todavía no tiene ningún commit propio). `docs/ROADMAP.md` había
descartado Lenis por resolver un problema de scroll largo que SNAPLINE no
tiene, pero dejó la puerta abierta a reabrir la discusión "si en el trabajo
real de D7 aparece una animación puntual que a mano en GSAP salga
claramente más cara" — mismo criterio que se usó con Foundry.

CEO investigó el caso concreto, no solo releyó el ROADMAP: revisó
`web/src/app/page.tsx`, `web/src/components/RevelaEnScroll.tsx`,
`web/src/lib/revelaEnScroll.ts`, `docs/DESIGN-REFERENCES.md` y `STATUS.md`.
Dos hallazgos sostienen la conclusión. Primero, la landing sigue en
`max-w-3xl`, columna angosta, cuatro secciones cortas; el pivote de Fase A
no tiene aún ni brief ni commit, y `docs/DESIGN-REFERENCES.md` se declara a
sí mismo "research parcial, en curso", con patrones de peso visual
(tarjetas oscuras con glow, cifras grandes, hero con objeto 3D) pero nada
de scroll-scrubbing ni pinning. Segundo, el valor real de Lenis aparece
cuando hay animaciones atadas continuamente a la posición de scroll
(`ScrollTrigger` con `scrub` y/o `pin`), y todo lo que existe hoy —los
reveals de `RevelaEnScroll.tsx` y el scramble de `HashVivo.tsx`— dispara
una vez al entrar en viewport, sin `scrub` ni `pin` en ningún archivo de
`web/src` (confirmado por grep). Ese patrón funciona igual con scroll
nativo que con Lenis, así que sumarlo hoy no mejora nada de lo que ya
existe.

La condición que el propio ROADMAP puso para reabrir la discusión no se
cumplió todavía, porque la animación puntual que la justificaría (algo
scroll-scrubbed o pineado) ni existe ni está especificada. Si aparece en el
trabajo real de Fase A —una sección donde `ScrollTrigger` solo se vea con
jitter o cueste claramente más de un día hacerlo bien a mano—, ahí sí se
reevalúa como caso concreto, y quedaría acotado a `/` únicamente: el
argumento original del ROADMAP sigue aplicando sin cambios a
`/acuerdo/[id]` y al resto de pantallas de estado/formulario. Costo de
referencia si el caso llegara a confirmarse: Lenis pesa ~5-6kb gzip y su
integración con GSAP/ScrollTrigger es de pocas líneas (enganchar
`lenis.raf` al ticker de GSAP y `ScrollTrigger.update`), así que no sería
una inversión de varios días.

**Descartado:** no fue agregar Lenis para siempre, fue agregarlo *ahora*.
Se descarta sumarlo sin una animación scroll-scrubbed o pineada concreta
que lo justifique — la misma vara que ya fija `docs/ROADMAP.md`, aplicada
en este momento puntual del pivote de layout.

---

## 2026-09-22 · Gitignorar `web/AGENTS.md` y `web/CLAUDE.md`

### D-042 · `web/AGENTS.md` y `web/CLAUDE.md` van a `.gitignore`, no son contenido del repo
Aparecieron sin trackear en un worktree de `web` (`agent-abf58eefef5bc12db`,
reportado por frontend-engineer durante la mitigación del hang post-firma).
`web/AGENTS.md` empieza con `<!-- BEGIN:nextjs-agent-rules -->` y dice
textualmente que el bloque "is written and re-added by `next dev` — verify
at `node_modules/next/dist/server/lib/generate-agent-files.js`". Es Next 16
(`web/package.json` tiene `"next": "16.3.5"`) el que los genera solo al
correr `next dev`/`npm install`; `web/CLAUDE.md` es solo `@AGENTS.md`, una
referencia interna de esa misma función, sin relación con el `CLAUDE.md` de
raíz del repo (ese sí trackeado). Confirmado con `git ls-tree -r main` que
ninguno de los dos estuvo nunca trackeado: no hay contenido real que se
pierda al ignorarlos. Van a reaparecer en cualquier worktree que corra
`next dev` de nuevo mientras se use esta versión de Next.
**Descartado:** no hacer nada y confiar en que cada agente los deje fuera
del `git add` a mano — ya generó una alerta de un agente que no sabía si
era ruido de tooling o un archivo real; mejor que `.gitignore` lo resuelva
una sola vez.

### D-041 · `addRpcUrlOverrideToChain` para que el cliente embebido de Privy hable con el proxy `/api/rpc`
El proxy same-origin `/api/rpc` (commit `97a06ec`) resolvió las lecturas que
pasan por `wagmiConfig.transports`, pero el cliente interno de Privy para
operaciones de la wallet embebida (nonce, estimación de gas, broadcast) no
lee `wagmiConfig`: lee la cadena que se le pasa en
`PrivyClientConfig.defaultChain`/`supportedChains`, que seguía apuntando al
RPC externo sin `Access-Control-Allow-Origin`. Era el mismo bloqueo de CORS
de antes, ahora en el paso final de la corrida real de D5/D6: el modal de
Privy "Approve transaction" ni llegaba a abrirse al disparar `createPool`.

Arreglado por CTO (worktree `agent-a7c2e6741788a6cd8`, commit `8dfcfce`):
`addRpcUrlOverrideToChain`, función oficial de `@privy-io/react-auth` (ver
docs.privy.io/basics/react/advanced/configuring-evm-networks), agrega una
entrada `rpcUrls.privyWalletOverride` sobre `hashkeyTestnet` que el cliente
de Privy prioriza por encima de `rpcUrls.default`, sin reemplazarlo. Se
exporta como `hashkeyTestnetParaPrivy`, un objeto aparte, en vez de mutar
`hashkeyTestnet` — ese objeto lo siguen usando intactos
`web/src/app/api/rpc/route.ts` y `web/src/app/api/goteo/route.ts`
(server-side, sin problema de CORS, necesitan la URL externa real y no hay
`window.location` ahí para resolver una ruta relativa).

Verificado por Product Manager antes de mergear: `next build`/`eslint` en
verde; diff acotado a `web/src/lib/wagmi.ts` y `web/src/lib/privy.ts`, sin
tocar las dos rutas de API; `git merge-tree` contra `main` sin conflictos.
Verificación conductual real, hecha por CEO directo en el navegador contra
el dev server del worktree del fix: con el acuerdo
`5a58a173-e81d-41f9-a961-efe927b0c386` (tres firmas ya puestas), el
firmante P3 (`0x40a7a99D17F1020CcEf27a793C0A19D32e466875`) disparó
`createPool` — el modal real de Privy "Approve transaction" apareció por
primera vez. Pool desplegado en
`0x4D434ab58bb4128FF656DaAD33C38D58eC88B7a5`, confirmado con RPC directo:
`eth_getCode` devuelve bytecode de clon EIP-1167 (45 bytes) apuntando a la
implementación `0x88ceD9e8…FE7F`; `eth_getTransactionCount` de P3 pasó de
`0x0` a `0x1`. `/api/goteo` probado por separado con `curl` contra la
testnet real: goteo con recibo confirmado, idempotencia y rechazo de
dirección inválida, todo en verde.

**Pendiente, no bloqueante:** la recarga a mitad de la confirmación
(anti-doble-despliegue) y la corrida real completa de D6 (`/pagar`/`/pool`
con wallet de navegador: faucet, pago, retiro) no se corrieron en esta
sesión — el click-through cubrió el paso final de D5, no D6 completo. Ver
`TASKS.md` D8 y `STATUS.md` § `web`.

**Descartado:** duplicar `hashkeyTestnet` con `defineChain` y una URL
distinta a mano — `addRpcUrlOverrideToChain` es la API oficial para este
caso exacto y evita mantener dos objetos de cadena en paralelo que podrían
divergir.

## 2026-09-21 · Mesa estratégica: diseño excepcional y tracción creíble

### D-040 · Piloto sin nombrar en el pitch: perfil target, no un contacto inventado
CEO convocó a CTO, CMO, COO y Design Lead por separado —cada uno dio su
perspectiva desde su área, sin coordinarse entre sí— para pensar dos ejes en
conjunto: diseño excepcional y tracción creíble hacia nuevos clientes o
usuarios. CEO sintetizó acuerdos, tensiones y dejó una sola decisión
pendiente: si el pitch nombra un piloto candidato real o describe solo un
perfil target, porque CMO no tenía confirmado si existía algún contacto
real con una agencia o estudio. El usuario confirmó que no hay ningún
contacto real: se va con la recomendación de la mesa, un perfil de cliente
target descrito con precisión, sin nombrar una conversación que no existe.

Volcado en `docs/PITCH.md`: perfil de cliente nombrado en "El problema, sin
adornos" (agencia chica de 3 a 8 personas, sede en Colombia, colaboradores
freelance regionales, un socio que hace de "banco humano"); sección nueva
"La economía del clon" (0,00195 HSK de despliegue, clon EIP-1167 de 45
bytes, con disclaimer explícito de que es capacidad técnica, no tracción de
mercado); sección nueva "Listo para auditoría, no auditado" (40 tests, dos
invariantes con 1000 casos de fuzzing cada una, Slither limpio, sin decir
nunca "auditado" ni "seguro"); en "Qué sigue" (horizonte 2) nombra
Littio/Koywe/Bitso y aclara que `MockOffRamp` ya tiene la forma de esa
integración, junto con el perfil de piloto sin nombre ni conversación
iniciada; "Por qué Colombia" reescrita con el segmento nombrado y Bre-B
como infraestructura habilitante, no como diferencial inventado.

Volcado en `docs/ROADMAP.md`: "Mainnet y una estrategia de gas" (Horizonte
2) nombra el mecanismo concreto (relayer o paymaster ERC-4337, no
"patrocinio" genérico); "Historial de movimientos del pool" (Horizonte 1)
extendido con la vista consolidada "mis proyectos" como el mismo trabajo de
indexado con un segundo consumidor; ítem nuevo "Primer piloto de
validación" al inicio de Horizonte 2, con la misma nota de honestidad — no
hay contacto real todavía; dos ítems de outreach ("Conversaciones uno a uno
con candidatos al piloto" y "Presencia en comunidades de freelancers y
estudios LatAm"), cada uno acotado con el filtro "una persona, en una
tarde" que propuso COO como criterio de admisión para separar outreach
puntual —que sí cabe en el roadmap— de un plan de go-to-market formal, que
no cabe.

**Descartado:** nombrar una agencia o una conversación concreta en el pitch
para sonar más avanzado. Se descartó porque no existe, y `CLAUDE.md`
prohíbe maquillar lo que es mock o está incompleto — la misma regla que ya
rige `MockOffRamp` en la interfaz.

---

## 2026-09-21 · Landing completa en "/", fuera de plan

### D-039 · Landing de marketing completa en "/" en vez de la versión acotada
Diagnóstico: `web/src/app/page.tsx` sigue siendo literalmente la vitrina de
componentes de D3 — etiqueta "Sistema visual · D3" y dos acuerdos de
muestra —, no una landing de producto, y `docs/DEMO-SCRIPT.md` abre el
video ahí (0:00–0:20). CEO propuso primero una versión acotada: reusar la
línea del guion, CTA simple, sin reviews ni casos de uso desarrollados. Con
esa propuesta ya explicada, el usuario eligió explícitamente ir más allá:
storytelling desarrollado (qué es el producto, problema, usuarios, casos de
uso), muy visual según `docs/BRAND.md` (Acta Viva), CTA claro "Crear tu
acuerdo" → `/nuevo` (no "crear cuenta": no hay sistema de cuentas, y
`/nuevo` ya dispara el login de Privy).

Sobre la sección de "reviews" que CEO había descartado de entrada —no hay
usuarios reales y `CLAUDE.md` prohíbe maquillar—: el usuario decidió no
vaciar el espacio sino llenarlo con contenido honesto y verificable, una
sección de confianza con verificación en cadena real: direcciones de
contrato verificadas, enlace al explorador, y la cobertura real de los 40
tests + fuzzing ya documentados en `STATUS.md`. No se inventa ninguna
métrica de uso real.

Orden de ejecución, confirmado por CEO: CMO arma el brief de narrativa
(documento, no código) con el contenido concreto de cada sección; Design
Lead construye `web/src/app/page.tsx` y los componentes nuevos recién con
ese brief cerrado. Secuencial, no en paralelo — mismo patrón que D-038.
Product Manager registra el encargo en `TASKS.md` § Fuera de plan y hace
el merge cuando cada etapa cierre. No toca ni duplica `PantallaCarga.tsx`
(D-038). Sigue siendo el punto 5 de 6 en "Lo primero que se corta" de
`docs/SCOPE-PLAN.md`: si D7 se atrasa, es lo primero que se revierte a la
versión mínima actual.

**Descartado:** la versión acotada que propuso CEO primero (CTA simple,
sin storytelling desarrollado ni sección de confianza) — el usuario, ya
con esa opción explicada, prefirió la completa. También descartado:
testimonios o reviews inventados para llenar esa sección — maquillar sin
usuarios reales viola la regla de honestidad de `CLAUDE.md`; se reemplaza
por verificación en cadena real, que es honesta y además refuerza el
diferencial técnico del proyecto.

## 2026-09-21 · Pantalla de carga, fuera de plan

### D-038 · Pantalla de carga de marca, encargo directo de CEO fuera de `TASKS.md`
CEO aprobó con el usuario, a mitad del plan y sin pasar por `TASKS.md`, una
pantalla de carga de marca (barra 0→100%) al abrir "/": es lo primero que
ve cada toma del video de demo. Dirigida por Design Lead a
`creative-director` (rama `worktree-agent-a539e9c93480da821`, commit
`10b367e`, mergeada a `main` en `0406214`). Autocontenida en
`PantallaCarga.tsx`, montada solo desde `web/src/app/page.tsx`; no tocó
`layout.tsx`, mismo patrón de aislamiento que el interruptor de tema
(D-034).

Reutiliza el timeline GSAP ya existente (`gsap.matchMedia`, `power3.out`) y
declara una duración de 1.4s como segunda excepción al límite de <400ms de
`docs/BRAND.md` §10 — misma lógica que la excepción ya aceptada para el
snap papel→cadena. Copia neutra ("iniciando" + %): no insinúa una operación
real (conexión, verificación, carga de datos) que no está pasando, nota de
honestidad de CEO. `sessionStorage` evita repetir la intro dentro de la
misma sesión de SPA; `prefers-reduced-motion` salta directo al contenido.

Verificado por Product Manager antes de mergear, no solo el reporte de
Design Lead: diff acotado a los dos archivos declarados, confirmado con
`git merge-tree` que no había conflicto contra `main`, y sin cruce con
ningún alcance activo de `TASKS.md` (D6/D7 no tocan `/` ni esos archivos);
`npm run lint` y `npm run build` corridos de forma independiente sobre la
rama y de nuevo sobre `main` ya mergeado (`0406214`), los dos en verde.

**Revisión visual en navegador, cerrada el 2026-09-21 por el orquestador**
(ni Design Lead ni Product Manager tienen herramienta de navegador en su
rol): `next dev` contra el checkout real de `main`, desktop (~780px) y
mobile (375px, confirmado por DOM — un artefacto de la herramienta de
captura mostraba una columna angosta, pero `innerWidth`/ancho de `body`
medían 375px exactos, no es un bug del sitio), temas claro y oscuro. Sin
defectos: título serif, barra fina 0→100%, contador mono y textura de
fondo correctos en los cuatro casos; el progreso pasa 0/33/66/85/95/99/100%
con la desaceleración documentada y transiciona a "/" sin salto ni
parpadeo de layout.

**Hallazgo aparte, no de esta tarea:** en la primera carga el tema arranca
en claro (valor por defecto antes de hidratar) y cambia a oscuro un frame
después, cuando `useSyncExternalStore` (D-034) detecta el
`prefers-color-scheme` real. Es el mecanismo de detección de tema el que
lo produce, no `PantallaCarga.tsx`; no bloquea nada y queda fuera del
alcance de D-038. Candidato a revisar si algún día se quiere resolver a
nivel de sistema — no se abre tarea nueva por esto solo.

**Descartado:** no aplica — la decisión abierta era solo de alcance
(agregar la pantalla o no), y esa la tomó CEO con el usuario fuera de este
registro; aquí solo se documenta cómo se ejecutó y se verificó la
integración.

## 2026-09-21 · D5, web y snap

### D-037 · `calcularStructHash` empaqueta arrays completos, no elementos sueltos
`web/src/lib/firma.ts` calculaba el hash de `participants`/`bps` con
`encodePacked` pasando un tipo `address`/`uint16` suelto por cada elemento
(N argumentos). En viem eso empaqueta cada elemento sin relleno —20 y 2
bytes—, pero `SplitPoolFactory.sol` (ya desplegado, congelado) hace
`abi.encodePacked(array)` pasando el arreglo completo como un único
argumento, y la regla real de Solidity rellena cada elemento de un array a
32 bytes antes de empaquetarlo —la misma convención que usa el helper de
test `_structHash` en `SplitPoolFactory.t.sol`—. Con el bug, el hash del
cliente no coincidía con el que calcula el contrato, así que `leerConsumido`
y `buscarPoolDesplegado` nunca iban a encontrar un pool recién desplegado:
justo el paso posterior al momento más importante del video. La firma
EIP-712 en sí no tenía el bug, porque usa el `hashTypedData` interno de
viem, código separado de `calcularStructHash`.

Fix: `encodePacked(["address[]"], [participants])` y
`encodePacked(["uint16[]"], [bps])`, pasando el arreglo completo como un
único argumento tipado. Verificado con un oráculo independiente
(`encodeAbiParameters` elemento por elemento, 32 bytes cada uno) antes de
integrar a `main`; `npm run lint` y `npm run build` en verde.
**Descartado:** dejar el bug y depender solo de que el contrato confirme el
despliegue por otra vía (el evento `PoolCreated` filtrado por `structHash`
tampoco habría emparejado, así que no había una ruta alternativa sin este
fix).

## 2026-09-21 · Orquestación de agentes

### D-036 · Roles de agentes con nombre propio, y Product Manager como gatekeeper único de merges
Desde D1 el proyecto ya coordinaba varios agentes en paralelo a mano
(`STATUS.md` § Organización de agentes: un coordinador principal más
agentes por rama/worktree en D1–D2 y D3–D4). Eso funcionó hasta cuatro
agentes simultáneos, pero dependía de que el coordinador recordara a mano
quién tocaba qué archivo, y no le daba a la persona un punto de
conversación fijo para pedir trabajo nuevo ni una manera de quedarse al
tanto de qué hace cada agente sin leer cada worktree.

Se formalizan los roles como subagentes con nombre en `.claude/agents/`,
mapeados 1 a 1 sobre las seis áreas ya definidas en `CLAUDE.md` — no un
organigrama nuevo. CEO enmarca cada pedido nuevo contra el plan y es el
único contacto estratégico del orquestador; CTO, CMO, COO y Design Lead
dirigen sus áreas; blockchain-engineer, frontend-engineer, infra-engineer,
storyteller, ux-designer y creative-director ejecutan. Product Manager es
un rol nuevo, no una renombrada: institucionaliza al "coordinador" —sabe
qué agente trabaja dónde, aprueba y hace los merges a `main`, y es la
única escritura permitida de `STATUS.md`, `TASKS.md` y `DECISIONS.md`— y
es a quien cualquier agente pregunta ante un conflicto de archivos o para
confirmar si algo ya se está trabajando en otra rama, en vez de asumir o
sobrescribir.
**Descartado:** seguir coordinando a mano sin roles nombrados, que
funcionaba pero no daba trazabilidad ni un punto de contacto fijo; y
diseñar un organigrama de startup completo con áreas de producto o
crecimiento que este proyecto no tiene (`CLAUDE.md` ya prohíbe paneles de
administración, roles y complejidad que no se vea en el video) — cada rol
nuevo tiene que mapear a una de las seis áreas o a la función de
integración, sin excepción.

## 2026-09-20 · D3-porte y D4, en paralelo

### D-035 · Goteo de gas del lado del servidor, idempotente por saldo
`web/src/app/api/goteo/route.ts` guarda `DEPLOYER_PRIVATE_KEY` solo en el
servidor — nunca llega al navegador — y solo transfiere si `getBalance` da
cero: una wallet ya fondeada, por el goteo o a mano, no vuelve a recibir. El
disparo es un efecto en `Providers` que llama al endpoint una vez por
dirección conectada por sesión de pestaña; si el pedido falla, se avisa por
consola y el flujo sigue — el participante puede usar el faucet de HSK a
mano. Monto fijo de 0.01 HSK, pensado para las transacciones de un
participante en el demo. `Providers` también degrada con gracia sin
`NEXT_PUBLIC_PRIVY_APP_ID`: sirve la app sin Privy/wagmi en vez de tumbar
`npm run build`, avisando una sola vez en consola.
**Descartado:** exigir el goteo antes de continuar — una falla ahí no puede
bloquear el flujo de firma, que es lo crítico del demo.

`/nuevo` valida direcciones con `isAddress(dir, { strict: false })`: no exige
mayúsculas de checksum EIP-55, porque quien copia una dirección de un
explorador o de otra wallet no siempre la trae así, y Solidity compara bytes,
no casing.
**Descartado:** exigir checksum, que rechazaría direcciones válidas copiadas
de fuentes comunes sin ganar nada en seguridad.

### D-034 · El tema oscuro y las superficies se resuelven en cascada CSS, no por rama de componente
`docs/BRAND.md` pide temas claro/oscuro y superficies papel/cadena
independientes — un bloque de cadena en tema claro usa las variantes
oscuras. Se resuelve con variables `--raw-*` en `:root`, redefinidas bajo
`[data-theme="dark"]` y bajo `[data-surface="chain"]` (que gana en cascada
por ir después), y `@theme inline` solo re-expone esos crudos como tokens de
Tailwind sin fijar valores. El interruptor (`InterruptorTema.tsx`) es local a
la pantalla que lo monta — pone `data-theme` en un `div` propio, no en
`<html>` — sigue `prefers-color-scheme` por defecto vía
`useSyncExternalStore` y el interruptor lo anula.

Se declaró local a la pantalla, sin estado compartido ni persistencia,
específicamente para no tocar `web/src/app/layout.tsx`: esa rama corría en
paralelo con la que integraba Privy, que sí necesitaba envolver el layout con
`PrivyProvider`. Evitó el único punto de choque real entre las dos ramas.
**Descartado:** un `ThemeProvider` de terceros o estado en `layout.tsx`/
`localStorage` — exigía coordinar ese archivo con la otra rama, y D3 no pide
que el tema persista entre pantallas ni entre visitas.

## 2026-09-20 · Diseño en código

*(D-032 y D-033 se registraron como D-029 y D-030 en `feat/design-sistema-visual`,
números que ya ocupaba Acta Viva en `main`. Se renumeran al integrar la rama;
el contenido no cambia.)*

### D-033 · Los tokens borran las escalas de radio y sombra de Tailwind
`docs/BRAND.md` prohíbe esquinas redondeadas y sombras. En `@theme` se anulan
las dos escalas (`--radius-*` y `--shadow-*`), así que `rounded-lg` o `shadow-md`
dejan de existir como clases. La regla dura deja de depender de que nadie se
despiste.
**Descartado:** confiar en la revisión. Es la clase de detalle que se cuela a
las dos de la mañana del día de grabar.

### D-032 · El andamiaje de Next.js se adelanta de D4 a D3
D3 pide el sistema visual "en código" y la maqueta de `/acuerdo/[id]`, pero el
andamiaje de Next.js estaba agendado en D4. Se adelanta el andamiaje mínimo
—App Router, TypeScript y Tailwind 4, nada más— para que los componentes nazcan
en su sitio definitivo. Privy, viem/wagmi y Supabase siguen intactos en D4: lo
que se adelanta es el marco, no la integración.
**Descartado:** maquetar en un HTML suelto y portarlo en D4. Respetaba el plan
al pie de la letra a cambio de reescribir el marcado una vez, y una reescritura
a ocho días del cierre es más riesgo que la desviación.

## 2026-09-20 · Diseño

### D-030 · GSAP para el movimiento 2D y `@react-three/fiber` para el anillo
GSAP resuelve en una línea el scramble de hashes, los contadores y el timeline
del snap, que a mano son un día de trabajo con casos borde. El anillo 3D va en
`@react-three/fiber` + `drei` porque encajan con React, traen controles,
eventos de clic por malla y material *toon* listos, y se cargan con
`next/dynamic` sin SSR para que solo pesen en las dos pantallas que los usan.
La licencia de GSAP, que incluye ScrambleText, se confirma al instalarla en D4
y se anota aquí si cambia algo.
**Descartado:** Three.js a mano, que obliga a escribir el ciclo de render, los
eventos de puntero y la limpieza de memoria; y Framer Motion, que no trae
scramble de texto ni un timeline tan fino para encadenar el snap.

### D-029 · Dirección visual: "Acta Viva", que revisa "Acta"
Acta (D-012) se leía como documento, pero en video era blanca y plana, y no
distinguía a cada participante. Acta Viva conserva la tipografía, las cifras en
mono, los filetes y el radio 0, y añade cinco cosas: la narrativa papel →
cadena (lo verificable en el explorador vive en superficie oscura y el snap es
el cruce), un color y una trama por participante, texturas como identidad, hashes
interactivos y un solo objeto 3D (el anillo del pool) en caja de un día. Hay
tema claro y oscuro completos, y el video se graba en claro porque ahí el cruce
de capas se lee sin explicarlo.

El anillo cabe en la regla de simplicidad porque protagoniza el plano 0:45–1:20
y vuelve en el del pool. No bloquea nada: si no está listo, el snap se hace con
la barra 2D, que es obligatoria desde D5.

La paleta de participantes se midió contra WCAG AA: el naranja propuesto al
principio daba 3,9:1 sobre papel y se oscureció a `#AD5414` (4,88:1).
**Descartado:** interfaz toda oscura, más cripto clásico pero sin el tono de
documento ni la historia del cruce; quedarse en Acta con solo color, que era
lo más seguro pero seguía sin moverse en video; y 3D en más pantallas, incluida
la portada, que suma medio día sin cambiar el argumento. Queda en el roadmap.

## 2026-09-20 · Plataforma

### D-031 · El relay se lee por función, no por política de `select`
Proyecto `snapline` creado en Supabase (`us-east-1`, coste mensual 0) con las
dos tablas de `docs/ARCHITECTURE.md` §4. Tres desviaciones respecto al esquema
de una línea que había ahí, cada una con su motivo:

**Lectura por `security definer`.** Una política `select using (true)` habría
sido más simple, pero con la clave anónima en el navegador cualquiera podría
listar *todos* los borradores: el relay se vuelve un directorio público de
acuerdos ajenos. En su lugar no hay política de `select` y se lee por
`get_draft(id)` y `get_signatures(draft_id)`, que es exactamente lo que hace
el link para compartir. El linter de Supabase marca esas dos funciones con
WARN por ser ejecutables por `anon`: es intencional, solo aceptan un id y
devuelven una fila.
**Descartado:** `select using (true)`, que convierte el relay en un directorio.

**Sin unicidad por `(draft_id, signer)`.** Con ella, cualquiera que conozca el
id del borrador insertaría una firma basura a nombre de un participante y le
dejaría el hueco ocupado para siempre: un bloqueo del despliegue que no cuesta
nada montar. Se aceptan varias filas por firmante y el cliente se queda con la
que verifica.
**Descartado:** la restricción única, más limpia en la tabla y con una negación
de servicio abierta a cualquiera.

**Ni `update` ni `delete`, ni política ni privilegio.** El borrador es inmutable
por construcción. Es la misma propiedad que `docs/THREAT-MODEL.md` §4 da por
buena en la fila "el relay altera el borrador", solo que aquí se impone en la
base de datos en vez de confiarla al contrato.

Verificado con el rol `anon`: inserta borrador y firma, el `select` directo
devuelve cero filas en ambas tablas, `get_draft` y `get_signatures` devuelven
la suya, y `update`, `delete` y una dirección mal formada fallan. Filas de
prueba borradas.

### D-028 · Los nombres de las skills de Vercel estaban mal en `CLAUDE.md`
*(Registrada como D-025 antes de integrar la rama de D2, que ya usaba ese
número para el CI. Se renumera aquí; el contenido no cambia.)*
La organización es `vercel-labs`, no `vercel`, y `vercel-deploy` se llama en
realidad `deploy-to-vercel`. El CLI reporta el 404 de un repositorio inexistente
como fallo de autenticación, que es lo que despistó. Verificado contra la API de
GitHub: `vercel-labs/agent-skills` es público y trae catorce skills.

`next-best-practices` no existe con ese nombre en ninguna organización ni en el
registro. Lo más cercano son guías de una función concreta de Next —el bucle de
desarrollo, la adopción de cache components— o de composición de React, ninguna
de convenciones de App Router y fronteras RSC, que era lo que el plan quería.
**Descartado:** meter `vercel-composition-patterns` o `react-best-practices` en
su lugar. La segunda ya estaba descartada por ser optimización para apps grandes,
y sustituir una guía por otra que no resuelve el mismo problema es alcance que no
se ganó el puesto. Se revisa en D4 solo si las fronteras RSC dan guerra de verdad.

## 2026-09-20 · Revisión previa al despliegue

### D-027 · Slither en contenedor, Mythril descartado
La guía `ethskills.com/security/SKILL.md` exige "automated analysis run" antes
de desplegar. No nombra herramientas obligatorias: pide que el análisis exista
y que los hallazgos críticos queden resueltos. Se ejecuta Slither 0.11.5 desde
la imagen `trailofbits/eth-security-toolbox`, sin instalar Python ni ninguna
herramienta en la máquina: los contratos se copian dentro del contenedor y el
build de Windows queda intacto. Seis hallazgos, ninguno alto, todos triados
contra el código y ninguno accionable.
**Descartado:** instalar Python y `slither-analyzer` nativos en Windows. Deja
la máquina modificada para una ejecución que se repite dos veces en diez días.

**Descartado:** Mythril. Su ejecución simbólica sobre el bucle de verificación
de firmas de `createPool` cuesta entre una y dos horas y devuelve ruido que hay
que triar a mano. A diez días del cierre no se gana el puesto que pide la regla
de simplicidad, y la casilla de la guía ya queda cubierta por Slither más las
dos invariantes con fuzzing a 1000 casos. Si aparece un hallazgo que dependa de
caminos de ejecución, se reconsidera.

## 2026-09-20 · Cambio de testnet autorizado

### D-026 · HSKChain Testnet con HSK de prueba
El usuario solicita sustituir Base Sepolia por HSKChain Testnet y confirma
testnet, no mainnet. Revierte la selección de cadena de D-005, D-016 y D-017;
las entradas históricas se conservan. Una sola red: chainId 133, RPC
https://testnet.hsk.xyz, gas en HSK y pagos del demo en MockUSDT.
Foundry, contratos y dominio EIP-712 dinámico se conservan.
**Descartado:** mantener Base en paralelo, usar HSK real o sustituir MockUSDT
por el activo nativo: no son parte del cambio solicitado.

El explorador facilitado por el usuario, https://testnet-explorer.hskchain.net,
responde por HTTPS y su API pública de contratos responde. La documentación
https://docs.hskchain.net/docs/Build-on-HashKey-Chain/network-info indica
testnet-explorer.hsk.xyz, que no resolvió desde este equipo. Se usa el dominio
operativo; verificación de fuentes aún pendiente. Foundry usará el verificador
Blockscout y la ruta /api/. Esto actualiza la exclusión por cadena de D-018 y
D-022, sin instalar el plugin Blockscout ni adoptar Scaffold-ETH 2.
**Descartado:** conservar BaseScan o exigir su API key para otra cadena.

La autorización incluye actualizar referencias de red en los documentos
cerrados; no cambia el alcance funcional. Se comprobará Privy con esta red
en D4 y se fondearán las cuentas con HSK de prueba antes del demo.

## 2026-09-20 · Implementación D2

### D-025 · CI de contratos con versiones fijadas y sin secretos
GitHub Actions ejecuta formato y tests en cada push y pull request, con
Foundry 1.8.3 y submódulos fijados. Las acciones checkout y foundry-toolchain
se fijan por SHA comprobado en sus repositorios oficiales. Se descartan tags
flotantes para evitar cambios silenciosos. El workflow tiene permisos de
solo lectura y no necesita claves de despliegue ni RPC.

### D-024 · Interfaz compartida del factory y codificación del acuerdo
El constructor del factory crea una implementación de SplitPool y conserva su
dirección inmutable. Se descarta recibir una implementación arbitraria: no hay
necesidad de configuración y así el factory solo clona el código previsto.

La API es `createPool(Agreement, bytes[]) returns (address)`, con tipo firmado
exacto `Agreement(address[] participants,uint16[] bps,bytes32 termsHash,bytes32 salt)`.
Cada elemento de los arrays se codifica en 32 bytes antes de hashear, según
EIP-712. Se descarta empaquetar direcciones en 20 bytes o bps en dos: produciría
firmas incompatibles con clientes que implementan el estándar.

`PoolCreated(address indexed pool, bytes32 indexed structHash)` permite enlazar
el acuerdo consumido con su pool. Los tests construyen el digest sin usar un
helper del factory, para no reproducir el mismo error en ambos lados.
Sin nuevas restricciones de participantes ni cambios a las decisiones D1.

## 2026-09-20 · Implementación D1

### D-023 · Convenciones del núcleo y herramientas fijadas
Foundry 1.8.3, Solidity 0.8.24, OpenZeppelin Contracts v5.0.2 y forge-std
v1.9.7 quedan fijados para reproducir el build. Se usa `Math.mulDiv` de
OpenZeppelin para calcular la parte sin desbordar la multiplicación
intermedia. **Descartado:** dependencias flotantes y multiplicación directa
que puede revertir aunque el resultado final quepa en uint256.

`address(0)` identifica el activo nativo en los mismos mappings por token.
`withdraw(token)` paga únicamente a `msg.sender` y retorna cero sin llamada
externa cuando no hay saldo debido. **Descartado:** acumuladores separados
para nativo y destinatarios arbitrarios, que añaden superficies innecesarias.

La implementación bloquea su propia inicialización en el constructor; los
clones conservan estado inicial cero. Las validaciones del acuerdo y la
creación e inicialización atómicas corresponden al factory de D2, como fija
la arquitectura. **Descartado:** dejar inicializable la implementación o
duplicar hoy las validaciones del factory dentro del pool.

MockUSDT expone `transfer` y `transferFrom` sin valor de retorno en su ABI y
en ejecución. Tiene un ledger mínimo propio porque heredar ERC20 de
OpenZeppelin impone retorno booleano en esas firmas. **Descartado:** devolver
`true`, que no ejercitaría la compatibilidad USDT de SafeERC20.

## 2026-09-21

### D-022 · El índice raíz de ETHSKILLS se lee antes de escribir Solidity. **Amplía D-018**
D-018 fijó leer tres guías sueltas en su día. Faltaba el índice raíz
(`ethskills.com/SKILL.md`), que es un enrutador: dice qué guía corresponde a
cada tarea y corrige de entrada cosas que un modelo recuerda mal —el gas real,
que USDC tiene 6 decimales, que `SafeERC20` no es opcional porque USDT no
devuelve booleano—. Eso toca `MockUSDT.sol` y el retiro de D1 directamente.
Se añaden al inventario `standards` (ERC-20 y EIP-712, D1–D2) y `addresses`
(D2, al desplegar).

**Descartado:** seguir el índice completo. Enruta hacia piezas que chocan con
los límites del proyecto y quedan explícitamente fuera: `ship/` recomienda
mainnet frente a Base Sepolia (D-005), `frontend-ux/` y `frontend-playbook/`
ya estaban descartadas (D-018), `tools/` empuja Blockscout y Scaffold-ETH 2,
`audit/` lanza subagentes y abre issues por su cuenta —contra la regla de que
aquí nada se ejecuta solo— y `feedback/` hace POST a un servicio externo, que
se pregunta antes. La lista de conflictos queda en `CLAUDE.md` para que no
haya que releer el índice para recordarla.

### D-021 · El MCP de documentación de Foundry queda declarado aunque hoy no responda
`getfoundry.sh/introduction/agents` anuncia un servidor MCP en
`https://getfoundry.sh/api/mcp` con `search_docs`. Se declaró en `.mcp.json`.
Comprobado el 20 de septiembre: la URL redirige a `www` y devuelve 404 en GET
y en POST, igual que `/api/mcp/mcp`, `/api/mcp/sse` y `/mcp`. Se deja escrito
apostando a que se active: cuesta cuatro líneas y evita volver a investigarlo.

**Descartado:** borrarlo. Coste aceptado: hasta que responda, cada sesión lo
lista como servidor fallido. Mientras tanto la documentación se lee por URL
—`llms.txt` para el índice y `<ruta>.md` para la página—, que es lo que la
propia documentación de Foundry recomienda y no depende del servidor.

### D-020 · Foundry, no Hardhat. **Revierte D-004**
Dos razones que no se pesaron bien al tomar D-004:

1. **Existe una skill oficial de Foundry orientada a agentes**
   (`getfoundry.sh/introduction/agents`). Buena parte de este código lo
   escriben agentes, y una skill oficial significa guía correcta y actualizada
   en lugar de lo que el modelo recuerde. Hardhat 3 no tiene equivalente.
2. **Fuzzing e invariantes casi gratis.** Dos criterios de terminado del
   proyecto no son casos de prueba sino invariantes: que el residuo por
   redondeo nunca supere N−1 unidades mínimas, y que nadie retire más de lo
   debido sin importar el orden de pagos y retiros. En Foundry son un
   `testFuzz_` — una función y un parámetro. En Hardhat son casos escogidos a
   mano que prueban menos.

D-004 se apoyaba en tres argumentos y el principal era débil: se dio por
costoso instalar Foundry en Windows porque `forge --version` falló, cuando
`foundryup` corre en git bash en un par de minutos. El riesgo residual se
acota con una caja de tiempo de 30 minutos en D1: si `forge test` no corre, se
revierte a Hardhat y no se vuelve a discutir.

**Descartado:** Hardhat 3 + viem + TypeScript. Sigue siendo más cómodo de
depurar a mano para alguien con Solidity intermedio, y eso era el argumento
que sí aguantaba de D-004. Se acepta el coste.

**Efecto secundario:** `ethskills.com/testing/SKILL.md` es específica de
Foundry, así que pasa de valor parcial a directamente aplicable.

**Momento:** se cambia en D0, sin una línea de código escrita, cuando el coste
es cero. Después de D1 habría costado un día y no se habría hecho.

### D-019 · x402 y pagos de agentes van al roadmap, no al MVP
El evento tiene un track de "AI x Ethereum & Agent Economy" donde x402 y el
Machine Payment Protocol encajarían. Un pool de SNAPLINE como destino de una
API que cobra por llamada es una idea buena y legítima.
**Descartado:** meterlo al MVP. No es nuestro track, y agregar un protocolo de
pagos nuevo el día 4 de 10 revienta el alcance. Queda en el horizonte 3 del
roadmap, que además sirve de respuesta si un juez pregunta por agentes.

### D-018 · ETHSKILLS se consulta por URL, sin instalar nada
Las guías de `austintgriffith/ethskills` son archivos públicos en
`ethskills.com/<tema>/SKILL.md`. Se leen el día que hacen falta: `security`
antes de desplegar (D2), `qa` antes de grabar (D8), y `crops` una vez contra
la arquitectura.
**Descartado:** instalar el plugin — requiere un terminal interactivo y no
aporta nada frente a leer tres URLs. Se descartan también `frontend-ux` y
`frontend-playbook` en su parte de interfaz: son específicos de Scaffold-ETH 2
y sus reglas de UI empujan hacia una estética genérica que contradice
`docs/BRAND.md`. De `frontend-playbook` solo interesa la parte de despliegue.

### D-017 · No se despliega en HSKChain ni en Tempo
Verificado en la página de premios del buildathon: hay un único pool de
$12.500 bajo "EAG Scholarship", sin bounties por cadena. Desplegar en una
segunda cadena no compra nada medible.
**Descartado:** un despliegue secundario en HSKChain testnet (chain 133) el
D10 para optar a un premio de patrocinador que no existe.

### D-016 · Se mantiene Base Sepolia, revisada la evidencia
Los organizadores reparten ETH de Ethereum Sepolia en su canal, lo que fue
motivo para reconsiderar D-005. Se mantiene Base Sepolia porque el gas es
órdenes de magnitud más barato, y el problema operativo real del demo es
fondear wallets embebidas que se crean en el momento: con gas barato, un goteo
mínimo alcanza. Ethereum Sepolia queda documentada como alternativa.
**Nota:** los contratos son agnósticos de cadena. Cambiar es un flag de red y
un redespliegue, unos 20 minutos, hasta el D8. No es una decisión cara.

## 2026-09-20

### D-015 · La documentación de D0 se hace en secuencia, sin delegar
Los ocho documentos se referencian entre sí y tienen que sonar a una sola
voz. Coordinar áreas en paralelo habría costado más de lo que ahorraba.
**Descartado:** un subagente por documento.

### D-014 · El andamiaje inicial se commitea en `main`
`main` siempre desplegable, y el trabajo en ramas `feat/<área>-<slug>` — pero
no había nada que romper todavía. A partir de D1 todo va en ramas.
**Descartado:** una rama `docs/bootstrap` que se habría fusionado a un `main`
vacío.

### D-013 · El CI se añade en D2, no en D0
Un `main` con CI en rojo porque no hay nada que construir incumple la regla
de "siempre desplegable".
**Descartado:** añadir el workflow desde el primer commit.

### D-012 · Dirección visual: "Acta"
Serif con voz para títulos, mono tabular para todas las cifras, papel hueso,
un solo acento rojo de sello, filetes de 1px, cero degradados y cero sombras.
El criterio del proyecto es "seriedad de documento" y esta dirección lo
cumple sin pelear.
**Descartado:** la dirección "Plano" (Space Grotesk, azul tiza, líneas de
cota, estética de plano de obra) — más distintiva y con la metáfora más
explícita, pero menos alineada con el criterio. Se rescató de ella la barra
segmentada para la tabla de porcentajes.

### D-011 · El pago de entrada en pesos sale del MVP y queda como stretch de D8
Para que el cliente pague en pesos y el pool reciba stablecoin hace falta una
billetera caliente con fondos en un servidor. Eso es custodia real de fondos
ajenos, montada el día 7 de un hackathon.
**Descartado:** implementarlo en el plan base. Se hace solo si D1–D7 cierran a
tiempo; si no, va al roadmap y el video muestra al cliente pagando en cripto.
La **salida** a pesos sí está, y es donde vive el diferencial.

### D-010 · El mock de salida a pesos tiene forma de proveedor real
`OffRampProvider` con `quote`, `execute` y `status`. La única implementación
en el MVP es `MockOffRamp`, marcada como simulada en la interfaz, en el
comprobante y en el pitch.
**Descartado:** una pantalla puramente visual con un aviso. Media jornada más
de trabajo convierte el roadmap de "algún día integramos algo" en "el hueco ya
tiene la forma del enchufe".

### D-009 · El pagador es un rol del producto, con link público sin sesión
`/pagar/[dir]` muestra el acuerdo firmado y permite transferir. Da el segundo
acto del video y cuesta poco.
**Descartado:** el pool como destino anónimo sin pantalla propia, que obligaba
a decir "imaginemos que el cliente paga". Se descartó también cualquier cosa
que se pareciera a facturación: sin montos esperados, sin vencimientos, sin
estados de cobro.

### D-008 · Supabase como relay de firmas, sin tablas de autenticación
La firma de la persona 1 tiene que existir en algún lado mientras la persona
2 abre el link. La wallet no guarda estado compartido y la cadena todavía no
se ha tocado. Dos tablas: `drafts` y `signatures`. El relay no custodia
fondos y no puede alterar el acuerdo — cualquier cambio invalida las firmas
porque el `structHash` cambia.
**Descartado:** codificar las firmas en la URL (impracticable con 4
participantes) y hacer que todos firmen en el mismo dispositivo (barato y
falso). La identidad la da Privy, así que no hay tablas de auth.

### D-007 · Privy para identidad y wallet embebida
Entrar con correo genera una wallet sin que el usuario vea una frase semilla,
y la misma librería cubre a quien ya trae wallet. Es la pieza que sostiene el
diferencial: sin ella, "el receptor no tiene wallet" es una promesa vacía,
porque no habría dirección que poner en la tabla de bps al firmar.
**Descartado:** RainbowKit más un proveedor de wallets embebidas aparte (dos
librerías para un problema); y un "cupo reclamable" en el contrato, donde la
dirección se fija al reclamar — más lógica en cadena y más que explicar en
tres minutos. Coste aceptado: el usuario con wallet embebida confía en Privy
y en su correo, y así está declarado en el modelo de amenazas.

### D-006 · Faucet propio en `MockUSDT`
`mint()` público y sin permisos. El demo no puede depender de que un faucet
externo esté vivo el día de la grabación.
**Descartado:** usar un USDC de testnet ya existente, más "real" pero con un
faucet fuera de nuestro control.

### D-005 · Base Sepolia, una sola cadena
Faucets confiables, explorador decente y buena lectura en un track de
aplicaciones reales y LatAm.
**Descartado:** Ethereum Sepolia, más canónico para EAG pero con faucets más
frágiles a diez días del cierre.

### D-004 · Hardhat 3 con viem y TypeScript, no Foundry
Instala con npm sin fricción en Windows, los tests se escriben en TypeScript
—el terreno fuerte de quien construye— y viem es el mismo cliente que usa el
front.
**Descartado:** Foundry, mejor para fuzzing, pero el fuzzing no está en el
alcance y el setup en Windows cuesta tiempo que no sobra.

### D-003 · El dominio EIP-712 ata `chainId`, el factory y un `salt` por acuerdo
El `structHash` consumido se guarda en el factory. Sin esto, una firma que
dice "acepto este reparto" valdría como "acepto este reparto cuantas veces
quieras", y el mismo paquete desplegaría pools duplicados.
**Descartado:** firmar solo la lista de participantes y bps sin `salt` ni
registro de consumo.

### D-002 · `receive() external payable {}` existe y está vacío
Sin `receive()`, una transferencia nativa al pool revierte y el soporte
nativo no existe. Está vacío porque la contabilidad no lo necesita: el total
histórico se reconstruye con `balance + retirado`, que además recoge el ETH
que entra por `selfdestruct` o como recompensa de bloque.
**Descartado:** contar en `receive()`, que dejaría fondos huérfanos en esos
casos; y no tener `receive()` en absoluto, que rompía el soporte nativo.

### D-001 · La contabilidad acumulada es por token
`totalWithdrawn[token]` y `withdrawn[token][cuenta]`. Con un solo acumulador
global se mezclan USDT y nativo y alguien retira de más.
**Descartado:** un acumulador único, más simple y con un error de fondos.
