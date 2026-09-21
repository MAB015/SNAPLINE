# Roadmap — SNAPLINE

**Fecha:** 2026-09-20

Nada de lo que está aquí se descartó por no valer la pena. Se descartó porque
no cabe en el MVP, y cada ítem lleva la línea de por qué. Este documento es
también el guion de la sección "qué sigue" del pitch.

---

## Horizonte 1 — Justo después del hackathon

Semanas, no meses. Cierra los huecos que el MVP deja a la vista.

### Términos anclados de forma permanente
El texto de los términos solo vive en Supabase; en cadena está el hash. Si el
relay desaparece, nadie puede demostrar qué se firmó. Subir el texto a IPFS o
Arweave y guardar el CID junto al hash.
**Por qué no está en el MVP:** agrega una dependencia de red y un modo de
fallo nuevo en el flujo más crítico, a cambio de algo que el video no muestra.

### Soporte de cuentas inteligentes (ERC-1271)
Hoy solo firman cuentas externas con ECDSA. Una multisig o una smart account
no puede ser participante — y las agencias serias usan multisig.
**Por qué no está en el MVP:** duplica los caminos de verificación de firma y
los tests, sin cambiar nada de lo que se ve.

### Lista de tokens y varias stablecoins
El contrato ya es multi-token por dentro; lo que falta es que la interfaz
deje elegir. USDC además de USDT.
**Por qué no está en el MVP:** multiplica la matriz de prueba y el video usa
un solo token.

### Notificaciones de firma y de pago
Un correo cuando falta tu firma, otro cuando llega dinero al pool.
**Por qué no está en el MVP:** exige un servicio de correo, plantillas y
manejo de rebotes. No se ve en tres minutos.

### Historial de movimientos del pool
Quién retiró qué y cuándo, leído de los eventos del contrato.
**Por qué no está en el MVP:** requiere indexar eventos; la vista actual con
saldos vivos alcanza para el demo.

### Auditoría de los contratos
Aunque sea una revisión externa ligera.
**Por qué no está en el MVP:** obvio, pero hay que decirlo: **este código no
debe tocar dinero real hasta que pase por esto.**

### Tope de participantes y prueba de gas
Un acuerdo con cientos de firmantes podría no caber en un bloque.
**Por qué no está en el MVP:** el producto apunta a equipos de 2 a 10 y nadie
va a probar el límite en el demo.

### Paleta de ocho participantes
Hoy hay cuatro colores; del quinto en adelante se repite el color y cambia la
trama. Pasar a ocho colores que pasen AA en las dos superficies.
**Por qué no está en el MVP:** el demo tiene cuatro participantes y medir ocho
colores en dos temas es trabajo que no se ve.

### 3D más allá del anillo
Un objeto en la portada, el anillo en `/pagar/[dir]` para que el cliente vea a
dónde va su pago, y sonido corto en el snap.
**Por qué no está en el MVP:** el anillo ya protagoniza los dos planos que
importan, y cada pantalla nueva con 3D suma medio día (D-029).

### Framer Motion, Anime.js, Lenis y Lottie
Cuatro librerías de animación e interacción evaluadas juntas para reforzar el
pulido visual de la web, que hoy corre sobre GSAP y `@react-three/fiber`
(D-030). Ninguna pasa el filtro:
- **Framer Motion** no es una pieza nueva a evaluar: reabre `D-030`, que ya la
  descartó por nombre por no traer scramble de texto ni un timeline lo
  bastante fino para encadenar el snap.
- **Anime.js** se superpone al 100% con GSAP, que ya está instalado y en uso
  productivo desde D5. No hay caso para sostener las dos.
- **Lenis** resuelve un scroll largo de landing. SNAPLINE son seis pantallas
  de estado y formulario, no ese problema.
- **Lottie** es la única con algo de mérito a priori — un spinner de carga —
  pero esa pieza ya la cubre GSAP en una línea, sin abrir un flujo de
  exportación de assets JSON que un equipo de una persona no tiene montado.
**Por qué no está en el MVP:** el criterio de admisión de `CLAUDE.md` es
objetivo — "si ahorra un día, se usa y se declara en `DECISIONS.md`" — no "si
se ve más pulida", y ninguna de las cuatro tiene hoy un caso concreto de
ahorro frente a una tarea real de `TASKS.md`. El objetivo de que el producto
se vea de punta a punta ya tiene dueño: `D-029` (Acta Viva) y `D-030` (GSAP +
R3F). Esto no es un cierre permanente: si en el trabajo real de D7
(`ux-designer`/`creative-director`) aparece una animación puntual que a mano
en GSAP salga claramente más cara que con alguna de estas, se evalúa como
caso concreto en ese momento y se declara en `DECISIONS.md` — mismo criterio
que se usó con Foundry.

### Pruebas de usabilidad con usuarios simulados y mesas de trabajo CMO+UX
CMO (marketing) y Design Lead (UX) reunidos, simulando usuarios sintéticos,
corriendo pruebas de usabilidad formales y armando mesas de trabajo para
poner en común hallazgos y mejoras.
**Por qué no está en el MVP:** es un proceso de equipo que necesita gente y
tiempo para investigar antes de construir — no rinde en un hackathon de una
persona con tres frentes ya corriendo en paralelo. El plan ya tiene un
mecanismo liviano equivalente, presupuestado para D8: `ux-designer` con
mandato diario de correctitud contra `docs/BRAND.md`, la skill
`web-design-guidelines` (foco, teclado, áreas de toque), y la auditoría
`ethskills.com/qa/SKILL.md` antes de grabar. Simular personas no agrega
cobertura que esas tres capas no den. Además, CMO no tiene mandato de UX en
`CLAUDE.md` — su alcance es narrativa y envío (`docs/PITCH.md`,
`docs/DEMO-SCRIPT.md`, Devfolio); cualquier versión futura de esto no
debería incluirlo salvo que cambie su mandato. Es una práctica válida si el
proyecto crece después del hackathon y hay más gente y tiempo disponible.

### Curaduría de inspiración visual externa (awwwards.com y similares)
Que el equipo de diseño revise awwwards.com y sitios similares para
inspirarse.
**Por qué no está en el MVP:** el sistema visual del proyecto (Acta Viva,
D-029) ya está definido y cerrado desde D3 — no hay una tarea concreta de
`TASKS.md` que necesite inspiración externa nueva. Ningún especialista de
diseño tiene navegador o herramienta de búsqueda web en su definición de
herramientas; solo el orquestador puede navegar, así que ejecutarlo hoy
consume tiempo del orquestador, no "del equipo". Es la misma categoría que
las librerías de animación de la entrada anterior: ambición estética abierta
sin caso concreto detrás. Si en el trabajo real de D7 aparece una necesidad
puntual de referencia visual para algo concreto (por ejemplo, el anillo 3D),
eso se busca puntualmente en ese momento, no como ejercicio separado ahora.

---

## Horizonte 2 — Para un piloto real con una agencia

Meses. Lo que hace falta para que una agencia de verdad mueva plata de verdad.

### Salida a pesos real
Reemplazar `MockOffRamp` por una implementación contra un proveedor con
licencia. Candidatos: Littio, Koywe, Bitso Business. La interfaz ya tiene la
forma; lo que falta es el contrato comercial, el KYC y el cumplimiento.
**Por qué no está en el MVP:** requiere una relación con una entidad vigilada.
No existe una versión de fin de semana de esto.

### KYC y cumplimiento para los receptores
Nadie paga a pesos sin identificar a quien recibe.
**Por qué no está en el MVP:** es una obligación regulatoria, no una función.

### Mainnet y una estrategia de gas
Base o la L2 que corresponda, con patrocinio de gas para que el participante
sin cripto no necesite tener ETH para retirar.
**Por qué no está en el MVP:** en testnet el gas es gratis y el problema no
se ve.

### Pago de entrada en pesos
Que el cliente pague por transferencia local y el pool reciba stablecoin.
Necesita liquidez, una billetera de tesorería y controles sobre ella.
**Por qué no está en el MVP:** es custodia real de fondos ajenos. Montarlo el
día 7 de un hackathon sería irresponsable. Queda como stretch del día 8 y solo
en versión simulada.

### Recuperación de cuenta
Hoy, si alguien pierde su cuenta de Privy después de firmar, su parte queda
inalcanzable.
**Por qué no está en el MVP:** exige guardianes o llaves de respaldo, un
sistema entero.

### Plantillas de reparto
Repartos recurrentes para agencias que arman proyectos parecidos todo el
tiempo.
**Por qué no está en el MVP:** es comodidad, no capacidad. No cambia lo que el
producto puede hacer.

### Facturación
Monto esperado, vencimiento, estado de cobro, recordatorios.
**Por qué no está en el MVP:** convierte SNAPLINE en una herramienta de
facturación y diluye el argumento. El MVP tiene un link de cobro, nada más.

---

## Horizonte 3 — Apuestas grandes

Donde el producto deja de ser un repartidor y se vuelve infraestructura de
acuerdos.

### Bre-B como riel de liquidación
Bre-B es el sistema de pagos inmediatos del Banco de la República. El acceso
pasa por una entidad financiera vigilada. La apuesta es que un participante
reciba su parte en su cuenta por llave Bre-B, en segundos, sin haber sabido
nunca que hubo una cadena de bloques de por medio.
**Por qué no está en el MVP:** no hay forma de acceder sin ser, o asociarse
con, una entidad vigilada. En el demo está simulado y así se dice.

### Renegociación de porcentajes
Un mecanismo para que el grupo cambie el reparto después de firmar: propuesta,
umbral de aprobación, ventana de objeción, y qué pasa con el dinero que ya
entró bajo los términos viejos.
**Por qué no está en el MVP:** es el agujero negro clásico. Un acuerdo que se
puede cambiar es un acuerdo que hay que volver a discutir, y todo el valor de
SNAPLINE está en que el reparto deja de ser discutible.

### Disputas y arbitraje
Qué pasa cuando alguien no entregó lo que prometió. Algún árbitro, algún
depósito en garantía, alguna ventana.
**Por qué no está en el MVP:** cualquier árbitro es un tercero en quien
confiar, que es exactamente lo que el producto elimina. Resolverlo bien es un
producto aparte.

### Salidas a mitad de proyecto
Alguien se va en la mitad y hay que recalcular.
**Por qué no está en el MVP:** reabre el reparto y arrastra consigo la
renegociación y las disputas.

### Términos legibles por máquina
Hoy los términos son texto libre y solo se guarda el hash. Que sean
condiciones verificables —hitos, entregables, fechas— abre la puerta a que el
reparto reaccione a hechos y no solo a porcentajes fijos.
**Por qué no está en el MVP:** es un lenguaje de dominio entero, y el 90% de
los casos reales se resuelve con porcentajes fijos.

### Ingresos de agentes: un pool que cobra por llamada
Un pool de SNAPLINE como destino de una API que cobra por uso con x402 (pagos
sobre HTTP 402) o con el Machine Payment Protocol. Una agencia que construye
un servicio y lo monetiza por petición vería el reparto ejecutarse solo, sin
factura y sin cierre de mes. El contrato ya no necesita cambios: el pool es
una dirección que recibe.
**Por qué no está en el MVP:** pertenece a otro track del propio evento
("AI x Ethereum & Agent Economy") y agregar un protocolo de pagos nuevo a
mitad de un plan de diez días revienta el alcance. El valor está en que el
diseño actual ya lo admite sin tocarlo.

### Reputación por acuerdos cumplidos
Historial verificable de proyectos entregados y repartidos sin conflicto.
**Por qué no está en el MVP:** necesita volumen real. Sin usuarios no hay
reputación que medir.
