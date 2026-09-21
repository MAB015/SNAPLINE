# Tareas — SNAPLINE

**Última actualización:** 2026-09-21

Cada tarea lleva su área. Una tarea terminada es un commit. El plan por día
que las agrupa está en [`docs/SCOPE-PLAN.md`](docs/SCOPE-PLAN.md).

---

## D1 · Contratos, núcleo — domingo 21

- [x] `infra` — andamiaje de Foundry (caja de tiempo: 30 min en Windows)
- [x] `contracts` — leer `ethskills.com/SKILL.md` y de ahí `standards/`, antes
      de la primera línea de Solidity
- [x] `contracts` — `MockUSDT.sol`: ERC-20 de 6 decimales, `transfer` sin
      retorno booleano, `mint()` público
- [x] `contracts` — `SplitPool.sol`: inicialización única, participantes y bps
- [x] `contracts` — contabilidad acumulada por token y `receive()` vacío
- [x] `contracts` — retiro con patrón pull, estado antes de transferir,
      `SafeERC20`
- [x] `contracts` — tests: reparto ERC-20, reparto nativo, segundo pago,
      doble retiro, dos tokens en el mismo pool
- [x] `contracts` — test: un receptor que revierte no bloquea a los demás
- [x] `contracts` — invariante con fuzzing: el residuo por redondeo nunca
      supera N−1 unidades mínimas por token
- [x] `contracts` — invariante con fuzzing: la suma de lo retirado nunca
      supera lo recibido, con cualquier orden de pagos y retiros

## D2 · Contratos, firmas y despliegue — lunes 22

- [x] `contracts` — `SplitPoolFactory.sol`: dominio EIP-712 con `chainId` y
      `verifyingContract`
- [x] `contracts` — verificación de firmas en orden contra el arreglo de
      participantes
- [x] `contracts` — `structHash` consumido, con `salt` por acuerdo
- [x] `contracts` — validaciones: suma 10000, sin duplicados, sin dirección
      cero
- [x] `contracts` — clonado EIP-1167 y evento `PoolCreated`
- [x] `contracts` — tests de la lista completa de `docs/THREAT-MODEL.md` §6
- [x] `contracts` — leer `ethskills.com/testing/SKILL.md` (es de Foundry)
- [x] `contracts` — desplegar a HSKChain Testnet con `forge create` y verificar
      con `forge verify-contract`, sin scripts en Solidity
- [x] `contracts` — verificar contratos en el explorador de HSKChain
- [x] `docs` — llenar `deployments/hashkey-testnet.json` y la sección de
      direcciones del README
- [x] `infra` — CI: tests de contratos en cada push (validado en GitHub,
      ejecución 35537664699)
- [ ] `infra` — reservar HSK de testnet en las cuatro cuentas del demo
- [x] `contracts` — leer `ethskills.com/security/SKILL.md` y pasar su lista
      antes de desplegar

## D3 · Diseño — martes 23

- [x] `infra` — andamiaje de Next.js App Router con Tailwind, adelantado de
      D4 (D-032)
- [x] `design` — tokens en código: tipografías, escala, filetes (D-033),
      portados a Acta Viva con paleta por superficie y los dos temas (D-034)
- [x] `design` — texturas en SVG en línea: grano, rejilla, cuatro tramas,
      tinta de sello, franjas de precaución, como máscaras CSS (D-034)
- [x] `design` — identicon 5×5 desde la dirección, en el color del
      participante (`Identicon.tsx`, sin librería)
- [x] `design` — componente de hash vivo: hover, copiar, enlace al explorador
      (`HashVivo.tsx`); código de barras del hash de términos
      (`CodigoBarras.tsx`)
- [x] `design` — componente de tabla de reparto, con color/trama e identicon
      por participante
- [x] `design` — componente de barra segmentada, con trama por participante
- [x] `design` — componente de estado de firma
- [x] `design` — componente de sello de simulado
- [x] `design` — maqueta estática de `/acuerdo/[id]` en los dos temas
      (interruptor local a la pantalla, D-034) y en los dos estados (papel y
      sellado en cadena, con superficie `chain` propia)

## D4 · Web, identidad y borrador — miércoles 24

- [x] `infra` — andamiaje de Next.js App Router con Tailwind *(adelantado a D3,
      ver D-032)*
- [x] `infra` — añadir viem/wagmi al andamiaje. `blockExplorers` de la cadena
      133 redefinido en `web/src/lib/wagmi.ts` con el explorador correcto
- [x] `web` — Privy: entrada por correo con wallet embebida y conexión de
      wallet externa (`web/src/lib/privy.ts`, `web/src/lib/providers.tsx`)
- [x] `web` — goteo de gas: `web/src/app/api/goteo/route.ts`, idempotente por
      saldo cero, se dispara desde `Providers` al conectar. **Falta:**
      `DEPLOYER_PRIVATE_KEY` en `web/.env.local` (hoy solo documentada en
      `.env.example`; sin ella el goteo responde 500 y no bloquea el resto)
- [x] `web` — `/nuevo`: participantes, bps con validación de suma exacta
      10000, términos, vista previa con los componentes de D3
- [x] `infra` — Supabase: tablas `drafts` y `signatures` *(hecho el 20/09,
      adelantado desde D4: no dependía del ABI ni del diseño)*
- [x] `web` — guardar el borrador y generar el link para compartir
      (`web/src/lib/supabase.ts`, `guardarBorrador`)

## D5 · Web, firma y snap — jueves 25

- [x] `web` — `/acuerdo/[id]` conectada a datos reales
- [x] `web` — firma EIP-712 desde el cliente
- [x] `web` — escritura y lectura de firmas en el relay
- [x] `web` — estado de firmas por participante
- [x] `web` — despliegue del pool en una sola transacción con la última firma
- [x] `web` — evitar retiro o despliegue doble al recargar durante la firma
- [x] `design` — snap 2D con GSAP: la línea se tensa, caen las marcas y el
      bloque cruza de papel a cadena. Obligatorio; el anillo no lo reemplaza
      *(sello de tinta del cruce conectado en `AcuerdoCliente.tsx` al mergear)*
- [x] `design` — scramble de hashes y contador de montos con GSAP

**Código de las ocho tareas de arriba está en `main`, verificado por tipos,
build y criptografía (`structHash` con oráculo independiente, D-037).** La
verificación conductual real —login por Privy, tres sesiones firmando, la
última disparando `createPool`, el pool visible en el explorador, y una
recarga a mitad de la confirmación— queda **deferida a propósito hasta D8**,
decisión del usuario: `docs/SCOPE-PLAN.md` ya la exige ahí como parte de los
ensayos de punta a punta, así que no hace falta duplicarla antes. No
bloquea avanzar a D6. `NEXT_PUBLIC_PRIVY_APP_ID` ya está puesto en
`web/.env.local`; ver la tarea correspondiente en D8.

## Fuera de plan · Pantalla de carga de marca (D-038)

- [x] `design` — pantalla de carga de marca al abrir "/" (barra 0→100% con
      GSAP, `PantallaCarga.tsx`), encargo directo de CEO aprobado con el
      usuario a mitad del plan, sin paso previo por este archivo. Merge y
      registro por Product Manager. Ver D-038 en `DECISIONS.md`.

## Fuera de plan · Auditoría puntual de accesibilidad (ux-designer)

- [x] `design` — tres arreglos de bajo riesgo sobre `/acuerdo/[id]`:
      `"use client"` faltante en `TablaReparto.tsx`, foco por teclado en el
      tooltip de `HashVivo.tsx` (WCAG 1.4.13) y área de toque de sus dos
      controles llevada a 24×24px (WCAG 2.5.8). Verificado por Design Lead
      (`lint`/`build`) y mergeado por Product Manager en `36db4cc`. Sin
      entrada propia en `DECISIONS.md`: son correcciones puntuales, no una
      decisión de arquitectura o alcance.

## D6 · Web, cobro y retiro — viernes 26

- [x] `web` — `/pagar/[dir]`: link público, sin sesión requerida
- [x] `web` — faucet de MockUSDT a la vista en la pantalla de pago
- [x] `web` — `/pool/[dir]`: total recibido, mi parte, ya retirado
- [x] `web` — acción de retirar

**Código de las cuatro tareas de arriba está en `main`, verificado por
Product Manager con `next build`/`eslint` en verde y lectura directa contra
un pool de prueba manual en HSKChain Testnet (no el pool del demo, que sale
del flujo real de firma de D5, diferido a D8).** La verificación
conductual real —wallet de navegador vía Privy pagando y retirando— queda
diferida a D8 junto con la de D5, mismo motivo: falta
`NEXT_PUBLIC_PRIVY_APP_ID` en el worktree donde se construyó D6. Ver
`STATUS.md`.

## D7 · Salida a pesos y pulido — sábado 27

- [ ] `web` — interfaz `OffRampProvider` y `MockOffRamp`
- [ ] `web` — `/retiro-cop/[dir]`: cotización, comisión, neto, comprobante
- [ ] `design` — sello de simulado en todas las superficies del mock
- [ ] `design` — anillo 3D del pool con `@react-three/fiber`: segmentos por
      bps, material toon, clic con panel de participante, snap en
      `/acuerdo/[id]` y llenado en `/pool/[dir]` *(caja de un día; si no
      está a las 18:00, pasa al hueco del stretch de D8 y, si tampoco cabe
      ahí, se corta y queda la barra 2D)*
- [ ] `design` — recibo de transacción e indicador de red en vivo
- [ ] `design` — revisar el tema oscuro en las seis pantallas

## D8 · Congelar y ensayar — domingo 28

- [ ] `demo` — cargar los datos de `docs/DEMO-SCRIPT.md`
- [ ] `demo` — pre-crear y fondear las cuentas del demo, incluidas las dos
      wallets embebidas, para que sus direcciones existan antes de grabar
- [ ] `web` — correr el flujo end-to-end de D5 contra HSKChain Testnet real:
      login por Privy en tres sesiones, firma EIP-712, la última disparando
      `createPool`, el pool visible en el explorador, y una recarga a mitad
      de la confirmación para confirmar que no hay doble despliegue
      *(diferido a propósito desde D5, decisión del usuario — ver `STATUS.md`)*
- [ ] `web` — correr `/pagar/[dir]` y `/pool/[dir]` (D6) con wallet real de
      navegador vía Privy: faucet, pago y retiro, contra el pool real que
      salga del flujo de D5 *(diferido a propósito desde D6, mismo motivo)*
- [ ] `web` — pasar `ethskills.com/qa/SKILL.md` contra la app antes de grabar
- [ ] `demo` — tres ensayos de punta a punta
- [ ] `demo` — borrar el acuerdo de prueba para grabar limpio
- [ ] `web` — arreglar solo lo que se rompa en los ensayos
- [ ] **Stretch** `web` — pago de entrada en pesos simulado *(solo si D1–D7
      cerraron a tiempo; corte a las 6 horas. Si el anillo 3D se desbordó de
      D7, ese hueco es del anillo y este stretch se cae)*

## D9 · Video y README — lunes 29

- [ ] `demo` — grabar los 3 minutos
- [ ] `demo` — editar y subir
- [ ] `docs` — README final: links, direcciones, aviso de no usar con dinero
      real
- [ ] `demo` — verificar el enlace del video desde una ventana privada

## D10 · Registro y envío — martes 30

- [ ] `docs` — corregir en la ficha de Devfolio que los contratos ya están
      desplegados y verificados, con sus direcciones. Hoy dice lo contrario
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
