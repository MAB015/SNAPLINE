# Guion del demo — SNAPLINE

**Duración:** 3 minutos · **Grabación:** D9, lunes 29 de septiembre

Una sola toma lógica. No se corta a "y aquí imaginemos que el cliente paga".
Todo lo que se afirma se ve en pantalla.

---

## Los datos de la demo

Fijos y versionados. Se cargan tal cual, sin improvisar delante de la cámara.

**Proyecto:** `Campaña Tropicana — video + identidad`

| Participante | Rol | Cómo entra | % | bps |
|---|---|---|---|---|
| Mariana | Dirección creativa (coordinadora) | Wallet externa | 40.00% | 4000 |
| Julián | Desarrollo | Wallet externa | 25.00% | 2500 |
| Sofía | Ilustración | **Correo → wallet embebida** | 20.00% | 2000 |
| Andrés | Edición de video | Correo → wallet embebida | 15.00% | 1500 |
| | | | **100.00%** | **10000** |

**Sofía es la protagonista del argumento**: nunca tocó una wallet, entra con
correo, y al final saca su parte a pesos.

**Términos:** un párrafo corto de entregables y plazos. Suficiente para que se
vea el hash debajo.

**Pago del cliente:** 4.000 USDT (MockUSDT, 6 decimales).

**Reparto esperado:** Mariana 1.600 · Julián 1.000 · Sofía 800 · Andrés 600.
Números redondos a propósito: el jurado tiene que poder verificar la
aritmética de cabeza mientras mira.

**Segundo pago (si sobra tiempo):** 1.000 USDT más, para mostrar que el
reparto se recalcula sin reabrir lo ya retirado.

---

## Plano por plano

### 0:00 – 0:20 · El problema
Pantalla de inicio. Voz en off, sin viñetas en pantalla.

> Un equipo termina un proyecto. Llega el pago. A partir de ahí, el reparto
> depende de que alguien recuerde lo que se acordó, tenga la plata en su
> cuenta, y la reparta. Los tres fallan.

### 0:20 – 0:45 · Definir el acuerdo
`/nuevo`. Mariana agrega cuatro participantes y sus porcentajes. Se escribe
un porcentaje mal a propósito: la suma marca `9.800 / 10.000` y el botón está
bloqueado. Se corrige y se desbloquea.

> Los porcentajes son puntos básicos y tienen que sumar exactamente diez mil.
> No hay acuerdo con un 99,98%.

### 0:45 – 1:20 · Firmar — la pieza principal
`/acuerdo/[id]` en tres ventanas. **Sofía entra con correo y aparece su
dirección sin haber visto una frase semilla.**

> Sofía nunca ha usado una wallet. Entra con su correo y ya tiene una
> dirección. No vio una frase semilla, no instaló nada.

Firman los cuatro. Cada firma acerca el segmento de su color en el anillo. Al
entrar la última, la línea se tensa y se marca, el acuerdo cruza de papel a
cadena y el anillo se cierra. Si el anillo 3D se cortó, el snap se ve solo en
la barra (ver `docs/BRAND.md` §13).

> Esto es el snap. Cuatro firmas se agrupan en una sola transacción y se
> despliega el pool de cobro del proyecto. Con saldo cero. Si faltara una
> firma, no existiría.

Se muestra la dirección del pool en el explorador. Saldo: 0.

### 1:20 – 1:45 · Cobrar
`/pagar/[dir]`, desde una ventana **sin sesión iniciada**. El cliente ve el
acuerdo firmado y transfiere 4.000 USDT.

> El cliente no necesita cuenta. Ve a qué acuerdo está pagando y transfiere.

El saldo del pool sube en pantalla.

### 1:45 – 2:10 · Retirar
`/pool/[dir]` desde la sesión de Julián: total recibido 4.000, su parte 1.000.
Retira. La transacción se confirma.

> Nadie aprobó este retiro. El reparto se decidió en la firma; desde
> entonces no hay ninguna decisión que tomar. Cada quien retira lo suyo, sin
> pedirle permiso a nadie y sin depender de que nadie esté disponible.

### 2:10 – 2:35 · La salida a pesos
`/retiro-cop/[dir]` desde la sesión de Sofía. **El sello de simulado está en
pantalla desde el primer frame.**

> Esto está simulado y lo digo antes de que me lo pregunten: no mueve dinero
> real y no habla con ningún banco. Lo que sí es real es la interfaz que hay
> detrás — un proveedor con licencia la implementa sin que cambie nada más
> del sistema.

Cotización, comisión, neto en pesos, comprobante.

> Sofía recibió su parte de un proyecto que se repartió en una cadena de
> bloques. No sabe que existe, y no tiene por qué.

### 2:35 – 3:00 · Límites y qué sigue
Sin pantalla de "gracias". Se queda la tabla de reparto de fondo.

> Lo que no hace: no renegocia porcentajes, no resuelve disputas, no maneja
> salidas a mitad de proyecto. Están fuera a propósito — un acuerdo que se
> puede cambiar es un acuerdo que hay que volver a discutir, y todo el valor
> está en que el reparto deje de ser discutible.
>
> Los contratos están desplegados y verificados en HSKChain Testnet. No están
> auditados y no deben tocar dinero real todavía.
>
> Lo siguiente es la salida a pesos de verdad, con Bre-B como riel y una
> entidad vigilada de por medio.

---

## Antes de grabar

- [ ] Cuatro sesiones abiertas y listas, dos con wallet externa y dos con
      correo
- [ ] Las wallets externas con HSK de testnet suficiente
- [ ] MockUSDT acuñado en la cuenta del "cliente"
- [ ] El acuerdo del demo creado, probado y **borrado**, para grabarlo limpio
- [ ] Explorador abierto en una pestaña, apuntando al factory
- [ ] Notificaciones del sistema apagadas
- [ ] Ensayo completo hecho tres veces (D8)

## Lo que no se hace en el video

- No se lee código.
- No se muestra el terminal.
- No se dice "como pueden ver".
- No se pide imaginar nada.
- No se promete nada que esté en el roadmap como si estuviera hecho.
