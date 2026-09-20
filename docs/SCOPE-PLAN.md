# Plan de alcance por día — hasta el 1 de octubre de 2026

**Fecha del plan:** 2026-09-20 · **Cierre:** 1 de octubre · **Registro:** hasta el 30 de septiembre

Una sola persona, días parciales. El plan asume **entre 4 y 6 horas útiles por
día**, no jornadas completas. Cada día tiene un criterio de terminado y un
punto de corte: lo que no se cierre antes del corte se manda al roadmap, no se
arrastra.

---

## Regla de arrastre

Si un día termina sin cumplir su criterio, **el día siguiente no empieza
hasta cerrarlo**, y lo que se sacrifica sale del día 7 (pulido), nunca del
día 9 (video). El video es lo único que el jurado ve; es lo último que se
recorta.

---

## D0 · Sábado 20 de septiembre — Documentación y repositorio

- Estructura de carpetas, git, licencia, entorno de ejemplo.
- Los ocho documentos escritos completos.
- Tracking inicializado.

**Terminado:** alguien clona el repo y entiende el proyecto en cinco minutos.
**Corte:** fin del día. Los documentos no se reescriben después; solo se
actualizan `STATUS.md`, `TASKS.md` y `DECISIONS.md`.

## D1 · Domingo 21 — Contratos, núcleo

- Andamiaje de Foundry. Caja de tiempo de 30 minutos para el setup en
  Windows: si `forge test` no corre, se revierte a Hardhat sin discutirlo más.
- `SplitPool.sol`: inicialización, contabilidad acumulada por token, retiro
  con estado antes de transferir, `receive()` vacío.
- `MockUSDT.sol` con `mint()` público.
- Tests de reparto: ERC-20, nativo, dos pagos, doble retiro, dos tokens.

**Terminado:** los tests de reparto pasan en verde.
**Corte:** si a las 6 horas el reparto no cuadra, se corta el soporte nativo
del MVP y queda solo ERC-20.

## D2 · Lunes 22 — Contratos, firmas y despliegue

- `SplitPoolFactory.sol`: EIP-712, verificación en orden, `structHash`
  consumido, validación de bps y duplicados, clonado EIP-1167.
- Tests de la lista de `docs/THREAT-MODEL.md` §6.
- Despliegue a HSKChain Testnet, verificación en el explorador,
  `deployments/hashkey-testnet.json`.
- CI: tests en cada push.

**Terminado:** contratos desplegados, verificados, y **congelados**.
**Corte:** fin del día. A partir de aquí no se tocan los contratos salvo por
un bug que rompa el demo.

## D3 · Martes 23 — Diseño

- Sistema visual en código a partir de `docs/BRAND.md`: tipografías, escala,
  paleta, filetes, tabla.
- Componentes base: tabla de reparto, barra segmentada, estado de firma,
  sello de simulado.
- Maqueta estática de `/acuerdo/[id]` — la pantalla principal.

**Terminado:** la pantalla de reparto se ve como tiene que verse, con datos
falsos y sin lógica.
**Corte:** fin del día. El resto de pantallas reutiliza estos componentes; no
se diseña nada nuevo después.

## D4 · Miércoles 24 — Web, identidad y borrador

- Next.js, Privy (correo → wallet embebida, y conexión de wallet externa).
- `/nuevo`: participantes, bps con validación de 10000, términos.
- Supabase: tablas `drafts` y `signatures`, guardado del borrador.

**Terminado:** un usuario entra con correo, tiene dirección, crea un borrador
y obtiene un link para compartir.
**Corte:** si Privy pelea más de 3 horas, se cae a conexión de wallet externa
y la wallet embebida pasa a ser el stretch del día 8.

## D5 · Jueves 25 — Web, firma y snap

- `/acuerdo/[id]` conectada: firma EIP-712, escritura en el relay, estado de
  firmas por participante.
- Despliegue del pool en una sola transacción cuando entra la última firma.

**Terminado:** tres sesiones distintas firman y el pool aparece en el
explorador.
**Corte:** fin del día. Este es el día crítico del proyecto; si se cae, se
recorta el día 7 entero.

## D6 · Viernes 26 — Web, cobro y retiro

- `/pagar/[dir]`: link público, funciona sin cuenta, con faucet de MockUSDT a
  la vista.
- `/pool/[dir]`: total recibido, mi parte, ya retirado, botón de retirar.

**Terminado:** el ciclo completo corre contra la testnet — pagar, ver,
retirar.
**Corte:** fin del día.

## D7 · Sábado 27 — Salida a pesos y pulido

- `MockOffRamp`: cotización, comisión, comprobante, sello de simulado.
- `/retiro-cop/[dir]`.
- Pulido de `/acuerdo/[id]` y de la animación del snap.

**Terminado:** un participante ve su parte convertida a pesos, con el aviso
de simulación imposible de pasar por alto.
**Corte:** este día es el colchón del proyecto. Se recorta primero.

## D8 · Domingo 28 — Congelar y ensayar

- **Congelación de funcionalidad.** No entra nada nuevo.
- Datos del demo: cuentas, montos, porcentajes, términos (ver
  `docs/DEMO-SCRIPT.md`).
- Tres ensayos de punta a punta. Arreglar solo lo que se rompa.
- **Stretch, únicamente si todo lo anterior está cerrado:** pago de entrada en
  pesos simulado.

**Terminado:** el flujo corre tres veces seguidas sin sorpresas.
**Corte:** fin del día. Si el stretch no está listo a las 6 horas, se
descarta y se documenta.

## D9 · Lunes 29 — Video y README

- Grabación del demo de 3 minutos según el guion.
- Edición, subtítulos, subida.
- README final con links, direcciones y el aviso de que no es para dinero
  real.

**Terminado:** el video está subido y el enlace funciona desde una ventana
privada.
**Corte:** fin del día.

## D10 · Martes 30 — Registro y envío

- Registro (último día) y envío a los dos tracks: Real-World Ethereum
  Applications y Colombia Hackathon.
- Revisión final: repo público, contratos verificados, video accesible.
- Buffer para lo que se haya caído.

**Terminado:** enviado a ambos tracks.

## 1 de octubre — Cierre

Día de margen. Nada planificado a propósito.

---

## Lo primero que se corta, en orden

Cuando algo se atrase, se sacrifica en este orden y se manda al roadmap:

1. Pago de entrada en pesos (stretch, ya está fuera del plan base)
2. Soporte nativo en la interfaz (queda en los tests del contrato)
3. Animación del snap
4. Diseño responsive de todo menos firma y retiro
5. Pantalla de inicio `/`
6. Salida a pesos → si esto cae, el proyecto pierde su diferencial. **Solo se
   corta si el día 8 está en riesgo.**

Lo que nunca se corta: los tests de invariantes del contrato, el flujo
firma → despliegue → pago → retiro, y el video.
