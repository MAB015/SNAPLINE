# Pitch — SNAPLINE

**EAG Global Buildathon** · Tracks: *Real-World Ethereum Applications* y
*Colombia Hackathon*

---

## Una frase

SNAPLINE convierte un acuerdo de reparto en una dirección de cobro: el grupo
firma, se despliega el pool del proyecto, y cuando llegue el dinero el reparto
ya está decidido.

## El problema, sin adornos

El cliente que tenemos en la cabeza: una agencia creativa o de producto
chica, de 3 a 8 personas, con sede formal en Colombia y colaboradores
freelance repartidos en dos o tres países de la región. En casi todas hay un
socio que hoy hace de banco humano — cobra el proyecto completo en su cuenta,
lo convierte, y reparte a mano por Wise, Payoneer o un cambista informal,
sin que nadie se lo haya pedido y sin que eso sea su trabajo.

Ese equipo termina un proyecto y llega el pago. Desde ese momento el reparto
depende de tres cosas frágiles: que alguien recuerde lo que se acordó, que
esa persona tenga la plata en su cuenta, y que la reparta.

Las tres fallan igual. El acuerdo era un mensaje de hace dos meses y cada
quien recuerda otra versión. El dinero cae en una sola cuenta, y esa persona
queda de custodio de plata ajena sin haberlo pedido. Y el reparto ocurre
cuando esa persona tiene tiempo, no cuando llegó el dinero.

En Latinoamérica se agrava: el equipo está en tres países, cobrar cruzando
fronteras es caro y lento, y el que recibe no quiere aprender de cripto.
Quiere pesos en su cuenta.

## Por qué esto va en una cadena y no en una hoja de cálculo

Tres propiedades que no se consiguen de otra forma:

1. **El acuerdo deja de ser interpretable.** Los porcentajes y las
   direcciones quedan atados a las firmas de todos. Cambiar un número
   invalida todas las firmas.
2. **Desaparece el custodio.** El dinero no pasa por la cuenta de nadie. Llega
   al pool y cada quien retira lo suyo.
3. **Desaparece la dependencia.** Nadie tiene que estar disponible, de buen
   humor, ni vivo, para que el reparto ocurra.

La firma no es un trámite. Es el momento en que el reparto deja de ser
discutible.

## El nombre

*Snapline* es la cuerda entizada que los constructores tensan y sueltan de
golpe para marcar una línea recta y exacta. Ese golpe es la firma. Desde ahí
la línea queda marcada.

## El diferencial

Los repartidores de ingresos existen. Ninguno de los que revisamos en este
mismo hackathon aborda Latinoamérica, y **todos asumen que el que recibe el
dinero ya tiene una wallet.**

SNAPLINE ataca exactamente eso por los dos extremos:

- **Entrada:** el participante entra con su correo y tiene dirección. No ve
  una frase semilla, no instala nada, no sabe que hay una cadena de bloques.
- **Salida:** convierte su parte a pesos colombianos sin tocar un exchange.

En el demo, Sofía —la ilustradora— hace las dos cosas. Ese es el argumento
completo.

## La economía del clon

Cada acuerdo nuevo no despliega un contrato desde cero: es un clon EIP-1167
de 45 bytes de runtime contra una implementación `SplitPool` inmutable, ya
verificada en el explorador. El despliegue completo de los tres contratos
—factory, implementación y el token de prueba— costó 0,00195 HSK. Un pool
nuevo es una fracción de eso.

Esto es una propiedad técnica del diseño, no una cifra de tracción: no
hemos desplegado pools para clientes reales todavía, y este párrafo no dice
lo contrario. Lo que dice es que agregar la agencia número cien no es una
decisión de arquitectura ni un problema de costo — es una llamada al
factory.

## Lo que está simulado, dicho antes de que lo pregunten

**La salida a pesos es un mock.** No mueve dinero real y no habla con ningún
banco. Está marcada como simulada en la propia interfaz, no en una nota al
pie.

Lo que sí es real es la frontera: una interfaz `OffRampProvider` con la forma
de un proveedor con licencia —cotización, comisión, ejecución, comprobante—
de modo que integrar uno de verdad no toca ninguna otra parte del sistema.

Bre-B, el sistema de pagos inmediatos del Banco de la República, es el riel
natural para esto. El acceso pasa por una entidad financiera vigilada, y eso
no se resuelve en diez días. Por eso está en el roadmap y no en el demo.

**Todo lo demás es real** y corre contra HSKChain Testnet: los contratos, las
firmas EIP-712, el despliegue del pool, los pagos y los retiros.

## Lo que no hace, a propósito

No renegocia porcentajes. No resuelve disputas. No maneja salidas a mitad de
proyecto. No tiene gobernanza.

No son olvidos. Un acuerdo que se puede cambiar es un acuerdo que hay que
volver a discutir, y todo el valor de SNAPLINE está en que el reparto deje de
ser discutible. Cada una de esas piezas es un producto aparte, y están en el
roadmap con su justificación.

Tampoco está auditado. **Este código no debe tocar dinero real todavía**, y
está escrito en el README.

## Decisiones técnicas que vale la pena defender

- **Patrón pull, nunca un bucle de pago.** Cada quien retira lo suyo. Un
  participante con una dirección que falla al recibir no congela a los demás.
- **Contabilidad acumulada por token.** La parte se calcula sobre el total
  histórico menos lo ya retirado, así que un segundo pago se reparte solo a sí
  mismo, sin reabrir nada.
- **El redondeo no se acumula.** Como todo se recalcula sobre el total, el
  residuo de un pago se reparte con el siguiente. Lo único atrapado para
  siempre son N−1 unidades mínimas por token.
- **Las firmas atan chainId, el factory y un salt propio.** El mismo paquete
  de firmas no puede desplegar un segundo pool. Una firma dice "acepto este
  reparto", no "acepto este reparto cuantas veces quieras".
- **Un pool por proyecto con clones EIP-1167.** Tu proyecto es una dirección.

## Listo para auditoría, no auditado

Hay una diferencia entre "confíen en nosotros" y lo que ya se puede
verificar hoy: los tres contratos están desplegados y verificados en el
explorador de HSKChain Testnet, con dirección pública y código fuente
legible por cualquiera. Cuarenta tests pasan sin fallos ni omisiones. Dos
invariantes centrales —conservación de fondos y ausencia de polvo
acumulable— corren cada una 1000 casos de fuzzing, y otros 1000 casos de
fuzzing validan acuerdos firmados con bps, términos y salt variables.
Slither corrió limpio: seis hallazgos, ninguno alto, cada uno explicado en
`contracts/audit/slither-2026-09-20.txt`.

Eso es rigor de ingeniería real, no una promesa. Lo que no es, y no decimos
que sea, es una auditoría externa. El premio de este hackathon no financia
la demo — la demo ya funciona sin él. Financia exactamente el paso que
falta antes de que este código toque dinero real: la auditoría externa y la
integración de un proveedor de salida a pesos con licencia.

## Qué sigue

Tres horizontes, detallados en `docs/ROADMAP.md`:

1. **Semanas:** anclar los términos de forma permanente, soportar multisig,
   auditoría.
2. **Meses, piloto con una agencia:** salida a pesos de verdad con un
   proveedor con licencia (Littio, Koywe o Bitso Business, evaluados en el
   roadmap) — `MockOffRamp` ya tiene la forma de esa integración, cotización,
   ejecución y estado, así que sustituirlo es integrar un proveedor real, no
   rediseñar nada; mainnet con patrocinio de gas para que el participante sin
   cripto no necesite tener HSK para retirar.

   El perfil de piloto candidato: una agencia de diseño o un estudio de
   desarrollo remoto, de 4 a 6 colaboradores freelance, del mismo tipo
   descrito arriba. El canal de acceso realista es una comunidad de
   freelancers de la región, no una relación directa — hoy no hay ninguna
   agencia identificada ni ninguna conversación iniciada, y este documento no
   insinúa lo contrario.
3. **Apuestas:** Bre-B como riel de liquidación, renegociación con un
   mecanismo que no destruya la propiedad que hace útil al producto, y
   disputas.

## Por qué Colombia

El segmento que describimos arriba —agencias chicas con sede en Colombia y
colaboradores freelance en dos o tres países de la región— tiene el
problema más agudo que en otros mercados: cobros internacionales caros,
bancos que no se hablan entre países, y una mayoría de colaboradores que no
va a aprender de cripto para que les paguen.

Bre-B, el sistema de pagos inmediatos del Banco de la República, es
infraestructura reciente: es lo que hace viable prometer salida a pesos
ahora, no hace dos años. SNAPLINE es lo que va encima — hoy simulado en el
demo, como se explica arriba, mientras se resuelve el acceso a una entidad
vigilada.
