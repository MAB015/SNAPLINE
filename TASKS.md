# Tareas — SNAPLINE

**Última actualización:** 2026-09-21

Cada tarea lleva su área. Una tarea terminada es un commit. El plan por día
que las agrupa está en [`docs/SCOPE-PLAN.md`](docs/SCOPE-PLAN.md).

---

## D1 · Contratos, núcleo — domingo 21

- [ ] `infra` — andamiaje de Foundry (caja de tiempo: 30 min en Windows)
- [ ] `contracts` — leer `ethskills.com/SKILL.md` y de ahí `standards/`, antes
      de la primera línea de Solidity
- [ ] `contracts` — `MockUSDT.sol`: ERC-20 de 6 decimales, `transfer` sin
      retorno booleano, `mint()` público
- [ ] `contracts` — `SplitPool.sol`: inicialización única, participantes y bps
- [ ] `contracts` — contabilidad acumulada por token y `receive()` vacío
- [ ] `contracts` — retiro con patrón pull, estado antes de transferir,
      `SafeERC20`
- [ ] `contracts` — tests: reparto ERC-20, reparto nativo, segundo pago,
      doble retiro, dos tokens en el mismo pool
- [ ] `contracts` — test: un receptor que revierte no bloquea a los demás
- [ ] `contracts` — invariante con fuzzing: el residuo por redondeo nunca
      supera N−1 unidades mínimas por token
- [ ] `contracts` — invariante con fuzzing: la suma de lo retirado nunca
      supera lo recibido, con cualquier orden de pagos y retiros

## D2 · Contratos, firmas y despliegue — lunes 22

- [ ] `contracts` — `SplitPoolFactory.sol`: dominio EIP-712 con `chainId` y
      `verifyingContract`
- [ ] `contracts` — verificación de firmas en orden contra el arreglo de
      participantes
- [ ] `contracts` — `structHash` consumido, con `salt` por acuerdo
- [ ] `contracts` — validaciones: suma 10000, sin duplicados, sin dirección
      cero
- [ ] `contracts` — clonado EIP-1167 y evento `PoolCreated`
- [ ] `contracts` — tests de la lista completa de `docs/THREAT-MODEL.md` §6
- [ ] `contracts` — leer `ethskills.com/testing/SKILL.md` (es de Foundry)
- [ ] `contracts` — desplegar a Base Sepolia con `forge create` y verificar
      con `forge verify-contract`, sin scripts en Solidity
- [ ] `contracts` — verificar contratos en BaseScan
- [ ] `docs` — llenar `deployments/base-sepolia.json` y la sección de
      direcciones del README
- [ ] `infra` — CI: tests de contratos en cada push
- [ ] `infra` — reservar ETH de testnet en las cuatro cuentas del demo
- [ ] `contracts` — leer `ethskills.com/security/SKILL.md` y pasar su lista
      antes de desplegar

## D3 · Diseño — martes 23

- [ ] `design` — tokens en código: tipografías, escala, paleta, filetes
- [ ] `design` — componente de tabla de reparto
- [ ] `design` — componente de barra segmentada
- [ ] `design` — componente de estado de firma
- [ ] `design` — componente de sello de simulado
- [ ] `design` — maqueta estática de `/acuerdo/[id]` con datos falsos

## D4 · Web, identidad y borrador — miércoles 24

- [ ] `infra` — andamiaje de Next.js App Router con Tailwind y viem/wagmi
- [ ] `web` — Privy: entrada por correo con wallet embebida y conexión de
      wallet externa
- [ ] `web` — goteo de gas: la cuenta de despliegue envía un mínimo de ETH a
      cada wallet embebida recién creada, o no puede retirar nunca
- [ ] `web` — `/nuevo`: participantes, bps con validación de 10000, términos
- [ ] `infra` — Supabase: tablas `drafts` y `signatures`
- [ ] `web` — guardar el borrador y generar el link para compartir

## D5 · Web, firma y snap — jueves 25

- [ ] `web` — `/acuerdo/[id]` conectada a datos reales
- [ ] `web` — firma EIP-712 desde el cliente
- [ ] `web` — escritura y lectura de firmas en el relay
- [ ] `web` — estado de firmas por participante
- [ ] `web` — despliegue del pool en una sola transacción con la última firma
- [ ] `web` — evitar retiro o despliegue doble al recargar durante la firma

## D6 · Web, cobro y retiro — viernes 26

- [ ] `web` — `/pagar/[dir]`: link público, sin sesión requerida
- [ ] `web` — faucet de MockUSDT a la vista en la pantalla de pago
- [ ] `web` — `/pool/[dir]`: total recibido, mi parte, ya retirado
- [ ] `web` — acción de retirar

## D7 · Salida a pesos y pulido — sábado 27

- [ ] `web` — interfaz `OffRampProvider` y `MockOffRamp`
- [ ] `web` — `/retiro-cop/[dir]`: cotización, comisión, neto, comprobante
- [ ] `design` — sello de simulado en todas las superficies del mock
- [ ] `design` — pulido de `/acuerdo/[id]`
- [ ] `design` — animación del snap *(se corta si falta tiempo)*

## D8 · Congelar y ensayar — domingo 28

- [ ] `demo` — cargar los datos de `docs/DEMO-SCRIPT.md`
- [ ] `demo` — pre-crear y fondear las cuentas del demo, incluidas las dos
      wallets embebidas, para que sus direcciones existan antes de grabar
- [ ] `web` — pasar `ethskills.com/qa/SKILL.md` contra la app antes de grabar
- [ ] `demo` — tres ensayos de punta a punta
- [ ] `demo` — borrar el acuerdo de prueba para grabar limpio
- [ ] `web` — arreglar solo lo que se rompa en los ensayos
- [ ] **Stretch** `web` — pago de entrada en pesos simulado *(solo si D1–D7
      cerraron a tiempo; corte a las 6 horas)*

## D9 · Video y README — lunes 29

- [ ] `demo` — grabar los 3 minutos
- [ ] `demo` — editar y subir
- [ ] `docs` — README final: links, direcciones, aviso de no usar con dinero
      real
- [ ] `demo` — verificar el enlace del video desde una ventana privada

## D10 · Registro y envío — martes 30

- [ ] `docs` — registro en el buildathon en `eag-global-buildathon.devfolio.co`
      *(último día posible)*
- [ ] `docs` — envío al track Real-World Ethereum Applications
- [ ] `docs` — envío al track Colombia Hackathon
- [ ] `infra` — repositorio público y contratos verificados

---

## Bloqueadas por información externa

- [ ] `docs` — **conseguir el documento de guía de submission de Cali**
      (Google Docs, requiere acceso). Define campos obligatorios, duración
      máxima del video y si el track Colombia necesita un formulario o
      etiqueta aparte. Puede forzar rehacer trabajo si aparece tarde
- [ ] `infra` — desplegar la web en Vercel con dominio estable; el envío pide
      un enlace en vivo

## Sin día asignado

- [ ] `docs` — completar la sección "Cómo correrlo" del README cuando exista
      código ejecutable
- [ ] `docs` — pasar `ethskills.com/crops/SKILL.md` contra
      `docs/ARCHITECTURE.md` una vez; es la rúbrica que más se parece a lo que
      valora un jurado de EAG
