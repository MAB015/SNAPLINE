# Log de decisiones — SNAPLINE

Formato: fecha, decisión, por qué, y la alternativa descartada. Lo más
reciente arriba. Una decisión revertida no se borra: se añade una entrada
nueva que la revierte.

---

## 2026-09-21

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
