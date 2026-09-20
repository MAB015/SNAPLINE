# Reglas de trabajo — SNAPLINE

Este archivo es para cualquiera (persona o agente) que abra el repositorio sin
haber estado en la conversación inicial. No asume contexto previo.

## Qué es el proyecto

Acuerdos de reparto de ingresos por proyecto para equipos distribuidos. El
grupo define porcentajes, todos firman, y en el momento de la firma se
despliega el pool de cobro de ese proyecto. Ver `docs/PRD.md`.

Entrega para el EAG Global Buildathon, cierre **1 de octubre de 2026**. Una
sola persona construye contratos, frontend, diseño, demo y pitch.

## Regla de simplicidad

El MVP se juzga por si funciona de punta a punta en un video de 3 minutos, no
por cuánto abarca. Toda complejidad tiene que ganarse el puesto: **si una
pieza no se ve en el video, no va en el MVP**.

Ante la duda entre la solución completa y la simple, va la simple y la
completa se anota en `docs/ROADMAP.md`. Nada se borra: lo que se descarta se
manda al roadmap con una línea de por qué.

Límites duros:
- Una sola cadena de testnet (Base Sepolia). Nada de multi-chain.
- Un solo token ERC-20 en el demo, más nativo en los tests. Nada de listas.
- Sin panel de administración, sin roles, sin notificaciones, sin correos.
- Sin base de datos más allá del relay de firmas.
- Si una librería ahorra un día, se usa y se declara en `DECISIONS.md`.

## Áreas

Cada área tiene responsabilidad y criterio de terminado propio. Una sola área
activa a la vez si van a tocar los mismos archivos; en paralelo solo cuando
los alcances no se cruzan.

| Área | Alcance | Terminado cuando |
|---|---|---|
| `contracts` | Solidity, tests, despliegue | Tests pasan y está desplegado y verificado en Base Sepolia |
| `web` | Next.js, wagmi/viem, Privy, Supabase | El flujo corre de punta a punta contra la testnet |
| `design` | Sistema visual, componentes, maquetación | Cumple `docs/BRAND.md` y se ve bien en el plano del video |
| `docs` | PRD, arquitectura, amenazas, roadmap | Un tercero lo entiende sin preguntar |
| `demo` | Datos de prueba, guion, grabación | El video corre de punta a punta sin cortes falsos |
| `infra` | Repo, CI, entorno, despliegue | `main` construye y despliega |

## Git

`main` siempre desplegable. El trabajo va en ramas `feat/<área>-<slug>`.
Excepción: el commit inicial de documentación y andamiaje se hizo en `main`
porque no había nada que romper.

Formato de commit: `tipo(área): descripción en imperativo, minúscula, sin punto`

Áreas: `contracts`, `web`, `design`, `docs`, `demo`, `infra`
Tipos: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`

```
feat(contracts): validar que los bps sumen exactamente 10000
fix(web): evitar retiro doble al recargar durante la firma
docs(decisions): registrar por qué el dust se queda en el contrato
```

Un commit por tarea terminada, no por día ni por sesión. Si el porqué no es
obvio en el título, va en el cuerpo. Prohibido `wip`, `cambios varios`,
`update`.

**Cada commit que cierra una tarea incluye la actualización de `STATUS.md`,
`TASKS.md` o `DECISIONS.md` que corresponda.** El estado del proyecto vive en
archivos versionados, nunca solo en la cabeza de quien trabaja.

## Skills y herramientas externas

**Nada se instala solo.** Un agente que trabaje en este repo no instala
plugins, no añade dependencias de herramienta ni conecta servicios por su
cuenta. Hay dos caminos y ninguno es automático:

1. **Guías públicas por URL.** Se leen en el momento en que hacen falta, sin
   instalar nada. Es el caso de ETHSKILLS (`ethskills.com/<tema>/SKILL.md`).
   No requiere acción de nadie: el agente la busca cuando le toca.
2. **Skills empaquetadas.** Las sube la persona que lleva el proyecto. El
   agente las **pide por nombre, dice para qué las quiere y en qué día del
   plan se usan**, y espera. No las instala ni sugiere instalarlas por su
   cuenta desde un terminal.

Antes de pedir una skill, el criterio es el mismo que el de la regla de
simplicidad: tiene que tocar una tarea real de `TASKS.md`. Una skill que
suena útil pero no aparece en el plan no se pide.

### Inventario

| Skill | Estado | Para qué | Cuándo |
|---|---|---|---|
| Foundry (`getfoundry.sh/introduction/agents`) | Pedida | Contratos y tests | D1–D2 |
| Vercel (`vercel.com/docs/agent-resources/skills`) | Pedida | Despliegue en vivo, requisito del envío | D9–D10 |
| ETHSKILLS `security` | Por URL | Lista previa al despliegue | D2 |
| ETHSKILLS `testing` | Por URL | Tests en Foundry | D2 |
| ETHSKILLS `qa` | Por URL | Auditoría de la app antes de grabar | D8 |
| ETHSKILLS `crops` | Por URL | Revisión de arquitectura | Sin día |

Descartadas y por qué, en `DECISIONS.md`: Blockscout (usamos BaseScan),
Tempo y x402 (otro track), y las guías de interfaz de ETHSKILLS (son de
Scaffold-ETH 2 y contradicen `docs/BRAND.md`).

## Reglas de bloque

- Al cerrar un bloque: commit, tracking actualizado, repo desplegable.
- Si un bloque se desvía del plan, detenerse y avisar. No acumular
  desviaciones silenciosas.
- Si coordinar un área cuesta más de lo que ahorra, hacerlo en secuencia.

## Cómo se escribe aquí

Prosa directa, sin relleno. Cada decisión técnica con su porqué y su
alternativa descartada. Donde algo sea mock o esté incompleto, se dice en el
documento y en la interfaz. No se maquilla nada.
