# Arquitectura — SNAPLINE

**Fecha:** 2026-09-20 · **Cadena:** HSKChain Testnet (`133`)

---

## 1. Vista de conjunto

```
  Coordinador                Participantes              Pagador (sin cuenta)
       │                          │                            │
       ▼                          ▼                            │
  ┌─────────────────────────────────────────┐                  │
  │              web (Next.js)              │                  │
  │  Privy: identidad + wallet embebida     │                  │
  └────────┬───────────────────────┬────────┘                  │
           │ borrador + firmas     │ 1 sola tx                 │ transferencia
           ▼                       ▼                           ▼
  ┌──────────────────┐    ┌──────────────────────────────────────────┐
  │ Supabase (relay) │    │            HSKChain Testnet              │
  │  borradores      │    │  SplitPoolFactory ──clona──> SplitPool   │
  │  firmas EIP-712  │    │                              (por proy.) │
  │  NO custodia     │    │  MockUSDT (ERC-20 con faucet)            │
  └──────────────────┘    └──────────────────────────────────────────┘
                                          │
                                          ▼ retiro
                             ┌──────────────────────────┐
                             │  Adaptador OffRamp COP   │
                             │  ◄── SIMULADO ──►        │
                             └──────────────────────────┘
```

La frontera del mock está en un solo lugar y está dibujada arriba: el
adaptador de salida a pesos. Todo lo demás es real contra una testnet real.

## 2. Contratos

### `SplitPool.sol`

Un pool por proyecto. Se despliega como clon mínimo EIP-1167 y se inicializa
una sola vez.

**Estado:**
```solidity
address[] participants;
mapping(address => uint16) bps;          // suma exacta = 10000
bytes32 termsHash;                        // hash de los términos, nunca el texto
mapping(address => uint256) totalWithdrawn;                // token => total
mapping(address => mapping(address => uint256)) withdrawn; // token => cuenta => retirado
```

**Contabilidad acumulada, por token.** El total histórico no se guarda: se
reconstruye.

```
totalRecibido(token) = balanceOf(token) + totalWithdrawn[token]
debido(token, cuenta) = totalRecibido(token) * bps[cuenta] / 10000
                        - withdrawn[token][cuenta]
```

Para nativo, `address(this).balance` en lugar de `balanceOf`.

El mapping por token no es opcional. Con un solo acumulador global se mezclan
USDT y nativo, y alguien retira de más.

Reconstruir desde el balance en vez de contar en la entrada es deliberado: el
ERC-20 no avisa cuando llega (`transfer` no llama a nadie), y el nativo puede
entrar por `selfdestruct` o como recompensa de bloque sin pasar por
`receive()`. Contar en la entrada dejaría fondos huérfanos en ambos casos.

**`receive() external payable {}` existe y está vacío.** Sin él, cualquier
transferencia nativa al pool revierte y el soporte nativo no existiría. Vacío
porque la contabilidad no lo necesita: el balance es la fuente de verdad.

**Retiro (patrón pull):**
1. Calcular lo debido.
2. **Actualizar `withdrawn` y `totalWithdrawn` antes de transferir.** El
   estado va primero; la transferencia es lo último que ocurre.
3. `SafeERC20.safeTransfer` — USDT no devuelve booleano y un `transfer`
   normal lo interpreta como fallo.

Nunca hay un bucle pagando a N direcciones. Cada quien retira lo suyo. Un
participante con una dirección que revierte al recibir no puede congelar a los
demás.

**El dust.** La división entera pierde hasta 1 unidad mínima por
participante, y esa pérdida **no se acumula**: como la parte se recalcula
sobre el total histórico en cada retiro, el residuo de un pago se reparte con
el siguiente. Lo único atrapado para siempre son a lo sumo N−1 unidades
mínimas por token. Se declara, no se barre debajo del tapete.

### `SplitPoolFactory.sol`

Guarda la implementación de referencia y clona con EIP-1167. Un clon cuesta
una fracción de un despliegue completo; con un pool por proyecto, eso importa.

**`createPool(acuerdo, firmas[])`** en una sola transacción:
1. Verifica que los bps sumen exactamente 10000.
2. Verifica que no haya participantes repetidos ni dirección cero.
3. Recupera el firmante de cada firma EIP-712 y exige que **coincida en orden
   y en dirección** con el arreglo de participantes. Falta una, revierte.
4. Marca el `structHash` del acuerdo como consumido.
5. Clona, inicializa, emite `PoolCreated`.

**Dominio EIP-712:**
```
name: "SNAPLINE", version: "1",
chainId: <de la cadena>, verifyingContract: <dirección del factory>
```

`chainId` y `verifyingContract` atan la firma a esta cadena y a este factory.
El struct del acuerdo incluye un `salt` propio, y el `structHash` consumido se
guarda en un mapping: **el mismo paquete de firmas no puede desplegar un
segundo pool idéntico.** Sin eso, una firma que dice "acepto este reparto"
valdría como "acepto este reparto cuantas veces quieras".

El struct firmado incluye la lista ordenada de participantes, sus bps, el
`termsHash` y el `salt`. Cambiar cualquier cosa invalida todas las firmas.

### `MockUSDT.sol`

ERC-20 de 6 decimales que imita el comportamiento de USDT (`transfer` sin
retorno booleano) y expone un `mint()` público sin permisos.

El faucet es propio a propósito: el demo no puede depender de que un faucet
externo esté vivo el día de la grabación. Alternativa descartada: usar un USDC
de testnet existente, más "real" pero con un faucet que no controlamos.

## 3. Web

**Next.js (App Router) + TypeScript + Tailwind + viem/wagmi.**

**Privy** cubre identidad y wallet en una sola pieza: entrar con correo genera
una wallet embebida, y quien ya tiene wallet la conecta por el mismo botón.
Alternativa descartada: RainbowKit más un proveedor de wallets embebidas
aparte — dos librerías para un problema, y el usuario sin cripto se quedaba
afuera.

Pantallas:

| Ruta | Qué hace | Quién entra |
|---|---|---|
| `/` | Qué es SNAPLINE | Cualquiera |
| `/nuevo` | Definir participantes, bps y términos | Coordinador |
| `/acuerdo/[id]` | **Pantalla de reparto.** Tabla completa, estado de firmas, firmar | Participantes |
| `/pool/[dir]` | Total recibido, mi parte, retirar | Participantes |
| `/pagar/[dir]` | Link público de cobro | Pagador, sin cuenta |
| `/retiro-cop/[dir]` | Salida a pesos — **simulada** | Participantes |

`/acuerdo/[id]` es la pieza principal. Es la pantalla que más se mira en el
demo y la que carga la metáfora: la línea que se tensa y marca.

## 4. Relay de firmas (Supabase)

El problema: la firma de la persona 1 tiene que existir en algún lado mientras
la persona 2 abre el link y firma. La wallet no guarda estado compartido y la
cadena todavía no se ha tocado — ese es justamente el diseño.

Dos tablas, nada más:

```
drafts      id, agreement_json, terms_text, created_by, created_at
signatures  draft_id, signer, signature, signed_at
```

**Lo que el relay puede hacer:** transportar firmas y mostrar un borrador.

**Lo que no puede hacer:** alterar el acuerdo, custodiar fondos, o firmar por
alguien. Cualquier modificación del borrador invalida todas las firmas
existentes, porque el `structHash` cambia y el contrato las rechaza. La
verificación ocurre en cadena, no en el relay. Un relay comprometido cuesta
disponibilidad, no dinero.

Alternativa descartada: codificar las firmas en la URL (cero backend, pero la
URL se vuelve impracticable con 4 participantes) y firmar todos en el mismo
dispositivo (barato y falso).

Sin tablas de autenticación: la identidad es de Privy.

## 5. La frontera del mock — salida a pesos

`web/src/lib/offramp/` define una interfaz con la forma de un proveedor real:

```ts
interface OffRampProvider {
  quote(amount: bigint, token: Address): Promise<Quote>   // tasa, comisión, neto
  execute(quote: Quote, account: BankAccount): Promise<Receipt>
  status(receiptId: string): Promise<PayoutStatus>
}
```

En el MVP la única implementación es `MockOffRamp`: devuelve una cotización
con una tasa COP/USD fija y declarada, una comisión plausible y un comprobante
con referencia. **No mueve dinero real y no habla con ningún banco.**

Esto se dice en tres lugares, sin que haya que buscarlo: un sello permanente
en la pantalla, una línea en el comprobante y una frase en el pitch.

La interfaz existe porque convierte el roadmap de "algún día integramos algo"
en "el hueco ya tiene la forma del enchufe". Candidatos reales para el
horizonte 2: Littio, Koywe, Bitso Business, y Bre-B como riel de liquidación
una vez haya una entidad vigilada de por medio.

## 6. Decisiones de herramienta

| Decisión | Por qué | Alternativa descartada |
|---|---|---|
| **Foundry** | Fuzzing e invariantes casi gratis, y hay una skill oficial orientada a agentes | Hardhat 3 + viem: tests en TypeScript, más cómodo de depurar a mano, pero sin fuzzing y sin skill. Ver D-020 |
| **HSKChain Testnet** | Cambio solicitado por el usuario; HSK de prueba para gas. Ver D-026 | Base Sepolia: selección anterior, sustituida expresamente; no se mantienen dos redes |
| **EIP-1167** | Un pool por proyecto sin pagar un despliegue completo cada vez | Un contrato registro con varios acuerdos: más barato aún, pero pierde el "tu pool es tu dirección" |
| **Privy** | Wallet embebida y conexión externa en una sola librería | Para / Web3Auth: equivalentes; Privy tiene mejor DX y plan gratuito suficiente |
| **Supabase** | Relay en minutos, sin servidor propio | KV tipo Upstash: igual de válido; Supabase ya estaba decidido |

## 7. Qué no está resuelto

Dicho aquí para que nadie se lo encuentre de sorpresa:

- Las firmas ECDSA de cuentas externas son lo único soportado. Una smart
  account (ERC-1271) no puede firmar un acuerdo.
- No hay recuperación si un participante pierde acceso a su cuenta de Privy
  después de firmar: su parte queda retirable solo por esa wallet.
- El relay es un punto único de falla para la *coordinación*. Si Supabase cae
  antes del despliegue, las firmas se pierden y hay que volver a firmar. Los
  pools ya desplegados no se ven afectados en absoluto.
- Ver `docs/THREAT-MODEL.md` para la lista completa.
