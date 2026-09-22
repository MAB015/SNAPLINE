# Cuentas de prueba y demo — HSKChain Testnet

Direcciones usadas durante la corrida de verificación conductual de D5/D6 y
para el fondeo anticipado del demo de `docs/DEMO-SCRIPT.md` (tarea de D8).
Todo esto es testnet — ninguna dirección mueve fondos reales.

Los correos reales detrás de los alias de `+correo` **no están acá a
propósito**: son datos personales del usuario y este repositorio es público.
Quedan documentados aparte, en un archivo local sin versionar
(`local-notes/demo-emails.md`, ver `.gitignore`).

---

## Cuentas del demo (`docs/DEMO-SCRIPT.md`)

Las cuatro cuentas del proyecto de ejemplo "Campaña Tropicana", ya creadas y
fondeadas con 0.01 HSK cada una (goteo vía `/api/goteo`, verificado en cadena
el 2026-09-21).

| Participante | Rol | Tipo | Dirección | bps |
|---|---|---|---|---|
| Mariana | Dirección creativa (coordinadora) | Wallet externa | `0xB2951489B790f18BdC34888A56A8Cf7589364398` | 4000 |
| Julián | Desarrollo | Wallet externa | `0x63D1deB11d830794Df0c95F1df9573364c790883` | 2500 |
| Sofía | Ilustración | Correo → wallet embebida | `0x10892823508De2314d76f0df4C768991cA78d67A` | 2000 |
| Andrés | Edición de video | Correo → wallet embebida | `0x49CdBBfcB15a97013c9D18ee0Cc32B7cD647615e` | 1500 |

Mariana y Julián: direcciones provistas por el usuario, ya controladas por
él/quien las use en el video. Sofía y Andrés: creadas por Privy la primera
vez que se entra con su correo — ver el archivo local para cuál correo usa
cada una.

## Cuentas de prueba técnica (verificación conductual D5/D6)

Tres identidades genéricas, sin relación con el guion del demo, usadas para
confirmar que el flujo firma → despliegue → pago → retiro corre de punta a
punta contra HSKChain Testnet real. No fondeadas con MockUSDT (el pago de
prueba se hace con el faucet público del token en `/pagar/[dir]`).

| Alias | Dirección | Rol en la prueba |
|---|---|---|
| `+p1` | `0xb34C0a5844db77FF8071e796Ae8d246EA3c7224e` | Creador del borrador, 40.00% |
| `+p2` | `0x825D4bf41af158821a9589E287c69D0Fb57FCC5E` | Participante, 30.00% |
| `+p3` | `0x40a7a99D17F1020CcEf27a793C0A19D32e466875` | Participante, 30.00% |

Acuerdo de prueba creado: `/acuerdo/5a58a173-e81d-41f9-a961-efe927b0c386`
("Verificación técnica D5/D6 - corrida real"), en curso de firma.
