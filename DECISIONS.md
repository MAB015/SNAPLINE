# Log de decisiones — SNAPLINE

Formato: fecha, decisión, por qué, y la alternativa descartada. Lo más
reciente arriba. Una decisión revertida no se borra: se añade una entrada
nueva que la revierte.

---

## 2026-09-20 · Plataforma

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
