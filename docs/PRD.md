# PRD — SNAPLINE

**Estado:** vigente · **Fecha:** 2026-09-20 · **Entrega:** 1 de octubre de 2026

---

## 1. El problema

Un equipo distribuido termina un proyecto y llega el pago. A partir de ese
momento el reparto depende de tres cosas frágiles: que alguien recuerde lo que
se acordó, que esa persona tenga la plata en su cuenta, y que la reparta.

Los tres puntos fallan de la misma manera. El acuerdo era un mensaje de
WhatsApp de hace dos meses y cada quien recuerda una versión distinta. El
dinero cae en la cuenta de una sola persona, que queda como custodio de facto
de plata ajena sin haberlo pedido. Y el reparto ocurre cuando esa persona
tiene tiempo, no cuando llegó el dinero.

En Latinoamérica esto se agrava: los colaboradores están en países distintos,
cobrar cruzando fronteras es caro y lento, y el que recibe casi nunca quiere
aprender de cripto — quiere pesos en su cuenta.

## 2. Qué hace SNAPLINE

Un grupo define quién se queda con qué porcentaje y bajo qué términos. Todos
firman. **En el momento de la firma se despliega el pool de cobro de ese
proyecto, con saldo cero.** Esa dirección queda como el destino acordado.

El día que llegue dinero, el reparto ya es automático y nadie decide nada.
Cada quien retira su parte cuando quiera. Quien no quiera saber de cripto saca
a pesos colombianos sin tocar una wallet.

El nombre viene de la cuerda entizada: el constructor la tensa y la suelta de
golpe para marcar una línea recta y exacta. El momento de la firma es ese
golpe. Desde ahí el reparto queda marcado y ya no se discute.

## 3. Usuarios

| Rol | Quién es | Qué necesita |
|---|---|---|
| **Coordinador** | Quien arma el proyecto — dueño de agencia, líder de colectivo | Definir el reparto, juntar las firmas, dar una dirección de cobro al cliente |
| **Participante** | Diseñador, desarrollador, músico, editor | Ver el reparto antes de firmar, firmar, retirar lo suyo sin pedirle permiso a nadie |
| **Participante sin cripto** | El que nunca tocó una wallet | Que le llegue plata a su cuenta en pesos sin entender nada de lo de arriba |
| **Pagador** | El cliente que paga el proyecto | Pagar a una dirección y saber a qué acuerdo corresponde. No necesita cuenta |

## 4. Alcance del MVP

Lo que tiene que funcionar de punta a punta en el video de 3 minutos:

1. **Crear cuenta sin fricción.** Se entra con correo y la wallet se crea sola
   por debajo (Privy). Quien ya tiene wallet la conecta. El usuario nunca ve
   una frase semilla.
2. **Definir el acuerdo.** Participantes, porcentajes en puntos básicos con
   suma exacta de 10000 validada, y términos en texto. Del texto se guarda
   solo el hash.
3. **Firmar.** Cada participante abre un link, ve la tabla de reparto completa
   y firma con EIP-712 fuera de cadena. Las firmas se acumulan en un relay.
4. **El snap.** Cuando entra la última firma, una sola transacción agrupa
   todas y despliega el pool. Si falta una firma, el pool no existe.
5. **Cobrar.** El pool tiene un link público de pago. El pagador transfiere
   stablecoin, con cuenta o sin ella.
6. **Retirar.** Cada participante ve el total recibido, su parte y lo que ya
   retiró. Retira cuando quiera.
7. **Salir a pesos (simulado).** Un participante convierte su parte a pesos
   colombianos. **Está marcado como simulado en la interfaz**, con la forma de
   un proveedor real detrás.

## 5. Fuera de alcance, a propósito

No son olvidos. Son agujeros negros para un hackathon y van declarados como
limitaciones conocidas en el pitch.

| Fuera | Por qué |
|---|---|
| Renegociar porcentajes | Requiere un mecanismo de consenso posterior a la firma; es un producto entero |
| Disputas y arbitraje | Necesita un árbitro, o sea confianza en un tercero, que es lo que el producto elimina |
| Salidas a mitad de proyecto | Reabre el reparto y con él todo lo anterior |
| Gobernanza del pool | No hay decisiones que tomar después de la firma. Ese es el punto |
| Integración real con Bre-B | El acceso pasa por una entidad financiera vigilada. No se hace en 10 días |
| Pago de entrada en pesos | Exige una billetera caliente con fondos en un servidor. Custodia real, día 7 de hackathon. Stretch del día 8 |
| Multi-cadena, listas de tokens | Multiplica superficie de prueba sin agregar nada al argumento |
| Cuentas inteligentes (ERC-1271) | El MVP verifica firmas ECDSA de cuentas externas. Las smart accounts quedan sin soporte, declarado |

Todo esto vive con su justificación en `docs/ROADMAP.md`.

## 6. Criterios de aceptación

El MVP está terminado cuando, contra HSKChain Testnet y sin intervención manual:

- [ ] Un usuario nuevo entra con correo y obtiene una dirección sin ver una
      frase semilla.
- [ ] Un acuerdo con porcentajes que no suman 10000 es rechazado antes de
      llegar a la cadena, y también por el contrato si llegara.
- [ ] Tres participantes firman desde tres sesiones distintas y el pool se
      despliega en una sola transacción.
- [ ] Con una firma faltante, el despliegue falla.
- [ ] El mismo paquete de firmas no puede desplegar un segundo pool.
- [ ] Un pagador sin cuenta transfiere al pool desde el link público.
- [ ] Cada participante retira exactamente su porcentaje del total recibido.
- [ ] Un segundo pago al mismo pool reparte solo lo nuevo, sin reabrir lo ya
      retirado.
- [ ] Nadie puede retirar dos veces lo mismo, ni recargando la página en medio
      de la firma.
- [ ] La pantalla de salida a pesos dice que es simulada, sin que haya que
      buscarlo.
- [ ] Contratos verificados en el explorador y direcciones en
      `deployments/hashkey-testnet.json`.

## 7. Cómo se mide el éxito

Este no es un producto con usuarios todavía. La única métrica que importa
antes del 1 de octubre: **el video corre de punta a punta, en una sola toma
lógica, sin que haya que explicar nada que no se vea en pantalla.**
