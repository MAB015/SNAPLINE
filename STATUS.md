# Estado del proyecto — SNAPLINE

**Última actualización:** 2026-09-20 · **Bloque cerrado:** D1 · Contratos, núcleo
**Cierre del hackathon:** 1 de octubre de 2026 · **Días restantes de trabajo:** 10

Este archivo se actualiza en el mismo commit que el trabajo que describe.

---

## Resumen

| Área | Estado | Siguiente |
|---|---|---|
| `docs` | ✅ Listo | Solo mantenimiento del tracking |
| `infra` | 🟡 Parcial | CI (D2) y andamiaje de Next.js (D4) |
| `contracts` | 🟡 Núcleo listo | D2 · factory, firmas y despliegue |
| `design` | 🟡 Dirección fijada | D3 · sistema en código |
| `web` | ⬜ Sin empezar | D4 · Privy y creación de acuerdo |
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

**Falta:** andamiaje de Next.js (D4), CI con
tests en cada push (D2).

**Nota:** el CI no se añade hasta que haya algo que construir. Un `main` con
CI en rojo incumple la regla de "siempre desplegable".

**Bloqueado por:** nada.

## `contracts` — 🟡 Núcleo listo

**Hecho:** D1 completo en `feat/contracts-split-pool`: MockUSDT de seis
decimales, faucet público y transferencias sin retorno; SplitPool para clones
con inicialización única, contabilidad por token, receive vacío y retiro pull
con estado antes de transferir mediante SafeERC20. Sin roles ni pausas.

**Validación:** 16 tests pasan, cero fallos y cero omitidos; `forge fmt
--check` pasa. Incluye reparto ERC-20/nativo, pagos sucesivos, doble retiro,
tres activos independientes, rollback de receptor fallido, reentrada,
reinicialización y ETH forzado. Caso límite uint256 máximo para mulDiv.
Cada una de las dos invariantes ejecuta 1000 casos fuzz con 1–10 participantes:
dust tras liquidar todos (hasta ocho rondas) y conservación tras cada operación
(hasta 32 pagos/retiros intercalados). Oracle de entradas y salidas independiente
del ledger del pool. No constituye prueba formal de todas las secuencias.

**Nota de compilación:** advertencia de selfdestruct solo en el helper de test
que fuerza ETH; no aparece en los contratos de producción.

**Falta:** D2 completo: factory, EIP-712, validaciones del acuerdo, tests de
firmas, despliegue y verificación en Base Sepolia. El factory debe validar
arreglos y bps y clonar e inicializar atómicamente: son precondiciones del pool.
No hay direcciones desplegadas ni se ha modificado main.

**Bloqueado por:** nada.

**Decisiones:** D-023 documenta convenciones de implementación y alternativas
descartadas. Guías ETHSKILLS leídas por URL sin instalar skills. La versión
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
`tests` e `infra`. El checkout principal conserva `feat/contracts-split-pool`.
Cada agente trabaja únicamente en su directorio; ninguno cambia ramas en el
checkout de otro. Las interfaces compartidas se acuerdan antes de escribir.

Los agentes entregan cambios y evidencia de validación; el coordinador integra
una tarea por commit junto con su tracking. Solo el coordinador modifica
STATUS, TASKS y DECISIONS, para evitar conflictos. Se mantienen cuatro puestos
simultáneos: coordinador y tres agentes. D2 requiere confirmar la ampliación
del alcance: la instrucción inicial lo excluía expresamente.

## `design` — 🟡 Dirección fijada

**Hecho:** dirección visual elegida (Acta) y documentada en `docs/BRAND.md`
con tipografías, paleta, escala y reglas duras.

**Falta:** tokens en código, componentes base (tabla de reparto, barra
segmentada, estado de firma, sello de simulado) y maqueta estática de
`/acuerdo/[id]`.

**Bloqueado por:** nada, pero se hace en D3 después de congelar contratos.

## `web` — ⬜ Sin empezar

**Hecho:** nada. Rutas y responsabilidades definidas en
`docs/ARCHITECTURE.md` §3.

**Falta:** todo.

**Bloqueado por:** necesita el ABI de los contratos (D2) y los componentes de
diseño (D3). No empieza antes de D4.

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
| El faucet de Base Sepolia falla el día de grabar | MockUSDT tiene faucet propio. Para el gas: reservar ETH de testnet con anticipación en D2 |
| El stretch de pago en pesos se come tiempo del ensayo | Solo se toca si D1–D7 cerraron a tiempo. Corte a las 6 horas en D8 |
| Las wallets embebidas se crean sin gas y no pueden retirar | Goteo de ETH desde la cuenta de despliegue al crearse (tarea de D4). Es la razón principal para quedarse en Base Sepolia |
| La guía de submission de Cali aparece tarde y exige algo no previsto | Conseguirla cuanto antes. Está en `TASKS.md` como bloqueada por información externa |

## Contexto del evento

Verificado en `eag-global-buildathon.devfolio.co` el 2026-09-21:

- Premio único de **$12.500 bajo "EAG Scholarship"**, sin bounties por
  patrocinador ni por cadena. El jurado financia continuación, no la demo:
  `docs/ROADMAP.md` y el cierre de `docs/PITCH.md` son material juzgado, no
  cortesía.
- Seis tracks públicos; el nuestro es **Real-World Ethereum Applications**.
  El track Colombia no figura en la página pública.
- Equipos de 1 a 4. Ir solo no penaliza.
- El envío se hace en Devfolio y pide un enlace en vivo.

## Decisiones pendientes

Ninguna. Todas las decisiones de diseño abiertas se cerraron en D0 y están
en `DECISIONS.md`.
