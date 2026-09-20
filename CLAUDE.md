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

Lista cerrada. No se pide nada más salvo que aparezca una tarea nueva en
`TASKS.md` que lo justifique.

**Se suben a mano** (no están en un registro público):

| Skill | Para qué | Cuándo |
|---|---|---|
| Foundry — `getfoundry.sh/introduction/agents` | Contratos, tests, fuzzing | D1–D2 |

El servidor MCP de documentación de Foundry queda declarado en `.mcp.json`
(`https://getfoundry.sh/api/mcp`). Hoy devuelve 404: mientras no responda, la
documentación se lee por URL — `getfoundry.sh/llms.txt` para el índice y
`getfoundry.sh/<ruta>.md` para la página. Ver D-021.

**Se instalan con `npx skills add`** (comando, no subida):

| Skill | Comando | Para qué | Cuándo |
|---|---|---|---|
| `deploy-to-vercel` | `npx skills add vercel-labs/agent-skills --skill deploy-to-vercel` | Desplegar la web. El envío exige un enlace en vivo. Despliega en preview salvo que se pida producción | D9–D10 |
| Supabase | `npx skills add supabase/agent-skills` | RLS del relay: las tablas son públicas con la clave anónima | D4 |
| `web-design-guidelines` *(opcional)* | `npx skills add vercel-labs/agent-skills --skill web-design-guidelines` | Repaso de foco, navegación por teclado y áreas de toque. Es correctitud, no estética: no pelea con `docs/BRAND.md` | D8, solo si D7 no se comió el colchón |

**Se leen por URL**, sin instalar ni subir nada:

| Guía | Para qué | Cuándo |
|---|---|---|
| `ethskills.com/SKILL.md` | Índice raíz. Se lee antes de escribir Solidity o de tocar la cadena; enruta al resto | D1, antes de la primera línea de Solidity |
| `ethskills.com/standards/SKILL.md` | ERC-20 y EIP-712 al escribir los contratos | D1–D2 |
| `ethskills.com/addresses/SKILL.md` | Direcciones verificadas. Una dirección inventada son fondos perdidos | D2, al desplegar |
| `ethskills.com/security/SKILL.md` | Lista previa al despliegue | D2 |
| `ethskills.com/testing/SKILL.md` | Tests en Foundry | D2 |
| `ethskills.com/qa/SKILL.md` | Auditoría de la app antes de grabar | D8 |
| `ethskills.com/crops/SKILL.md` | Revisión de arquitectura | Sin día |

El índice raíz enruta hacia guías que este proyecto ya descartó o que chocan
con sus límites duros. No se siguen sin pasar por aquí: `ship/` recomienda
desplegar en mainnet y el proyecto está fijado en Base Sepolia (D-005);
`frontend-ux/` y `frontend-playbook/` están descartadas en su parte de
interfaz (D-018); `tools/` empuja Blockscout y Scaffold-ETH 2, ninguno en uso;
`audit/` lanza subagentes en paralelo y abre issues en GitHub por su cuenta, y
aquí nada se ejecuta solo; `feedback/` hace POST a un servicio externo y eso
se pregunta antes. Ver D-022.

**Sin verificar:** no se confirmó que exista una skill de Privy. Privy es el
riesgo de tiempo más alto del plan (caja de 3 horas en D4), así que si
aparece una, entra sin discusión.

**Nota:** Supabase ya está conectado como servidor MCP en el entorno de
trabajo, así que crear las dos tablas no depende de la skill. La skill es solo
para no dejar las políticas de acceso abiertas.

### Descartadas

| Skill | Por qué no |
|---|---|
| Blockscout | Base Sepolia usa BaseScan. Solo servía para HSKChain, y no vamos |
| Tempo, x402, Machine Payment Protocol | Pertenecen a otro track del evento. Ver D-019 |
| ETHSKILLS `frontend-ux`, `frontend-playbook` | Son de Scaffold-ETH 2 y sus reglas de UI contradicen `docs/BRAND.md`. Ver D-018 |
| `vercel-react-best-practices` | Optimización de rendimiento para apps grandes. La nuestra tiene seis pantallas |
| `next-best-practices` | No existe con ese nombre, ni en `vercel-labs/agent-skills` ni en el registro. Lo más cercano son guías de una función concreta de Next o de composición de React, ninguna de convenciones de App Router. Revisar en D4 solo si las fronteras RSC dan guerra |
| `building-components` | Se solapa con `docs/BRAND.md`, que ya es la especificación de componentes |
| Hardhat | Se cambió a Foundry. Ver D-020 |

## Reglas de bloque

- Al cerrar un bloque: commit, tracking actualizado, repo desplegable.
- Si un bloque se desvía del plan, detenerse y avisar. No acumular
  desviaciones silenciosas.
- Si coordinar un área cuesta más de lo que ahorra, hacerlo en secuencia.

## Cómo se escribe aquí

Prosa directa, sin relleno. Cada decisión técnica con su porqué y su
alternativa descartada. Donde algo sea mock o esté incompleto, se dice en el
documento y en la interfaz. No se maquilla nada.
