# Modelo de amenazas — SNAPLINE

**Fecha:** 2026-09-20 · **Alcance:** `SplitPool`, `SplitPoolFactory`, y el relay de firmas

Este documento dice qué se defiende, qué no, y bajo qué supuestos. La sección
que más importa es la 5: lo que **no** está mitigado.

---

## 1. Qué protegemos

| Activo | Por qué importa |
|---|---|
| Los fondos del pool | Es plata de terceros ya ganada |
| La integridad del acuerdo | Los porcentajes firmados no pueden cambiar después |
| El consentimiento | Nadie queda atado a un reparto que no firmó |

## 2. Supuestos de confianza

Lo que damos por cierto. Si alguno se cae, el análisis de abajo no vale.

1. La cadena ejecuta correctamente y no se reorganiza más allá de la
   finalidad normal.
2. Las llaves privadas de los participantes no están comprometidas. Para
   quienes usan wallet embebida, esto se traslada a **la seguridad de Privy y
   del correo del usuario** — una transferencia de confianza real y declarada.
3. El código de OpenZeppelin (`Clones`, `SafeERC20`, `ECDSA`) es correcto.
4. El token usado no es malicioso. En el MVP es nuestro `MockUSDT`.
5. Los participantes leyeron la tabla de reparto antes de firmar. La interfaz
   la muestra completa; no puede obligar a nadie a mirarla.

## 3. Actores hostiles considerados

- **Un participante del acuerdo** que quiere más de lo suyo.
- **El coordinador**, que arma el borrador y podría querer manipularlo.
- **Un tercero cualquiera** que encuentra la dirección del pool.
- **Quien controle el relay**, incluido un Supabase comprometido.

## 4. Vectores y mitigaciones

### Contrato — fondos

| Vector | Mitigación |
|---|---|
| Reentrada en el retiro | Estado actualizado **antes** de transferir. El patrón pull, además, quita el incentivo: reentrar solo recalcula un saldo que ya está en cero |
| Retirar dos veces | `withdrawn[token][cuenta]` se resta siempre de lo debido; un segundo retiro sin fondos nuevos da cero |
| Bloquear el reparto de los demás | No hay bucle de pago. Una dirección que revierte al recibir solo se bloquea a sí misma |
| USDT que no devuelve booleano | `SafeERC20.safeTransfer` |
| Mezclar contabilidad entre tokens | Todos los acumuladores son `mapping(token => ...)` |
| Inflar el total con una donación | Es posible y es inofensivo: quien manda tokens al pool los está regalando al reparto acordado. Es el comportamiento correcto, no un bug |
| Nativo que entra sin pasar por `receive()` | La contabilidad lee `address(this).balance`, así que lo recoge igual |

### Contrato — integridad del acuerdo

| Vector | Mitigación |
|---|---|
| Desplegar sin todas las firmas | El factory recupera el firmante de cada firma y lo compara, en orden, con el arreglo de participantes. Falta una, revierte |
| Cambiar los bps después de que alguien firmó | Los bps están dentro del struct firmado. Cambiar uno cambia el `structHash` e invalida todas las firmas |
| Reusar el paquete de firmas para un segundo pool | El `structHash` se marca como consumido en el factory. Cada acuerdo incluye un `salt` propio |
| Replicar las firmas en otra cadena o contra otro factory | El dominio EIP-712 ata `chainId` y `verifyingContract` |
| Firmar dos veces para contar como dos participantes | El factory rechaza participantes repetidos |
| Meter la dirección cero como participante | Rechazada explícitamente |
| Bps que no suman 10000 | Validado en el factory, además de en la interfaz |
| Reinicializar un clon ya desplegado | Guarda de inicialización única |
| Sustituir los términos por otro texto | Solo se guarda el hash. Un texto distinto no produce el mismo hash. **Quién custodia el texto original está fuera del contrato** — ver sección 5 |

### Relay

| Vector | Mitigación |
|---|---|
| El relay altera el borrador | Las firmas ya recogidas dejan de servir, porque el `structHash` cambia. El ataque solo logra que nadie pueda desplegar |
| El relay inventa una firma | No puede: no tiene las llaves y el factory verifica en cadena |
| El relay se queda con los fondos | No toca fondos en ningún momento |
| El relay se cae | Se pierden borradores y firmas pendientes; hay que volver a firmar. Los pools desplegados no se ven afectados |

## 5. Lo que NO está mitigado

Esto es lo que un juez debería preguntar, y la respuesta honesta es que está
abierto.

1. **El texto de los términos no está en ningún lado permanente.** Solo vive
   el hash en cadena. Si el borrador de Supabase desaparece, el hash prueba
   que hubo unos términos pero nadie puede demostrar cuáles eran. Arreglo
   conocido: anclarlo en IPFS o Arweave. Fuera del MVP por tiempo — ver
   `docs/ROADMAP.md`.

2. **Un participante que se equivoca de dirección se equivoca para siempre.**
   No hay renegociación ni corrección post-firma, por diseño. Ese porcentaje
   queda atrapado.

3. **Wallet embebida = confiar en Privy.** El usuario que entra con correo
   depende de Privy y de su cuenta de correo. Es una mejora enorme de
   usabilidad y una reducción real de autocustodia. Se dice, no se esconde.

4. **Cuentas inteligentes sin soporte.** Solo ECDSA. Una multisig o una smart
   account no puede firmar un acuerdo.

5. **Sin auditoría.** Esto es código de hackathon escrito en días por una
   persona, con tests sobre los invariantes principales. **No debe usarse con
   dinero real.** El aviso va también en el README.

6. **Sin límite de participantes.** Un acuerdo con cientos de firmantes
   podría exceder el gas de un bloque al desplegarse. No hay tope
   implementado ni probado; en la práctica el producto apunta a equipos de
   2 a 10.

7. **Front-running del despliegue.** Cualquiera que vea el paquete de firmas
   en el mempool puede enviarlo primero. El resultado es idéntico —el pool se
   crea con los mismos parámetros— así que el impacto es quién paga el gas,
   no quién controla el pool. Aceptado.

8. **La salida a pesos es simulada.** No hay riesgo financiero porque no hay
   dinero moviéndose, pero tampoco hay garantía de que un proveedor real
   encaje sin cambios en la interfaz definida.

## 6. Qué se probará

Los tests que respaldan las mitigaciones de la sección 4, como lista de
verificación para el área `contracts`:

- [ ] Bps que no suman 10000 → revierte
- [ ] Participante repetido → revierte
- [ ] Dirección cero → revierte
- [ ] Falta una firma → revierte
- [ ] Firma de alguien que no está en la lista → revierte
- [ ] Firmas en orden distinto al arreglo → revierte
- [ ] Reusar el mismo paquete de firmas → revierte
- [ ] Firma con otro `chainId` en el dominio → revierte
- [ ] Reparto exacto con ERC-20, un solo pago
- [ ] Reparto exacto con nativo
- [ ] Segundo pago: reparte solo lo nuevo, sin tocar lo ya retirado
- [ ] Retirar dos veces seguidas → el segundo da cero, no revierte fondos
- [ ] Token que no devuelve booleano (estilo USDT) → funciona
- [ ] Dos tokens en el mismo pool → contabilidad independiente
- [ ] Un receptor que revierte no bloquea a los demás
- [ ] Reentrada en el retiro → no extrae de más
- [ ] Reinicializar un clon → revierte
- [ ] El residuo por redondeo nunca supera N−1 unidades mínimas
