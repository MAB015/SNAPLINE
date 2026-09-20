# Estado del proyecto — SNAPLINE

**Última actualización:** 2026-09-20 · **Bloque cerrado:** D0 · Documentación y repositorio
**Cierre del hackathon:** 1 de octubre de 2026 · **Días restantes de trabajo:** 10

Este archivo se actualiza en el mismo commit que el trabajo que describe.

---

## Resumen

| Área | Estado | Siguiente |
|---|---|---|
| `docs` | ✅ Listo | Solo mantenimiento del tracking |
| `infra` | 🟡 Parcial | Andamiaje de Hardhat y Next.js (D1, D4) |
| `contracts` | ⬜ Sin empezar | D1 · núcleo de `SplitPool` |
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
licencia MIT, `.env.example` con las variables previstas.

**Falta:** andamiaje de Hardhat 3 (D1), andamiaje de Next.js (D4), CI con
tests en cada push (D2).

**Nota:** el CI no se añade hasta que haya algo que construir. Un `main` con
CI en rojo incumple la regla de "siempre desplegable".

**Bloqueado por:** nada.

## `contracts` — ⬜ Sin empezar

**Hecho:** nada. Diseño cerrado en `docs/ARCHITECTURE.md` §2 y lista de tests
en `docs/THREAT-MODEL.md` §6.

**Falta:** todo. `SplitPool.sol`, `SplitPoolFactory.sol`, `MockUSDT.sol`,
tests, despliegue y verificación en Base Sepolia.

**Bloqueado por:** nada. Es el siguiente bloque.

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

## Decisiones pendientes

Ninguna. Todas las decisiones de diseño abiertas se cerraron en D0 y están
en `DECISIONS.md`.
