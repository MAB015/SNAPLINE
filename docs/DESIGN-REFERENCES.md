# Referencias visuales externas

Este documento no existía — se reconstruye porque una investigación previa
(sitios de awwwards.com y similares, librerías de 3D/scroll/efectos) se
pidió en una sesión anterior y nunca quedó documentada. `docs/ROADMAP.md`
tiene una nota genérica sobre "curaduría de awwwards.com", pero sin sitios
ni librerías concretas — ese vacío es lo que este archivo cierra.

**Estado: research parcial, en curso.** Falta terminar de revisar
sub-páginas y falta decidir/documentar qué de esto entra al MVP.

---

## Sharplink (sharplink.com)

Plataforma de tesorería institucional de Ethereum, cotiza en NASDAQ (SBET).
Pedida como referencia principal.

**Revisado hasta ahora:** Home, `/dashboard`. Falta: `/about`, `/investors`,
`/ethereum-opportunity`, `/news`.

### Patrones observados

- **Hero oscuro con objeto 3D rotando** (una figura geométrica tipo
  poliedro), tipografía sans grande ("Ethereum with an Edge"), dos CTA
  (uno primario a `/dashboard`, uno secundario a `/investors`).
- **Cifras en vivo con mucho peso visual**: "TOTAL ETH HOLDINGS: 891,714",
  "STAKING REWARDS: 27,532 ETH" — números grandes, etiqueta en mayúscula
  chica encima. Misma familia que la sección de confianza de SNAPLINE
  (`ContadorTests`, direcciones verificadas), pero con más jerarquía
  tipográfica y separación.
- **`/dashboard`**: tarjetas oscuras individuales por métrica ("MARKET CAP
  $2.17B", "AVG DAILY VOLUME (30D) $75.68M"), con un ícono de info al lado
  del label. Gráfico de línea con resplandor (glow) azul sobre fondo negro,
  eje de meses abajo.
- Transición de scroll entre hero y la sección siguiente pasa por un tramo
  claro/neutro antes de asentar en la siguiente sección oscura — no se
  llegó a confirmar el mecanismo exacto (throttling del navegador headless
  puede haber afectado la observación).

### Qué es directamente aplicable a SNAPLINE, a evaluar con Design Lead

- El patrón de tarjeta-métrica-con-glow podría aplicarse a la sección de
  confianza de la landing (`/`) y a `/pool/[dir]` (total recibido, mi
  parte, ya retirado) sin romper la metáfora de documento — son datos, no
  layout de página.
- El objeto 3D del hero es conceptualmente el mismo lugar donde
  `docs/BRAND.md` ya planea el anillo 3D del pool (D7) — Sharplink es
  evidencia de que ese patrón funciona bien en producción real, no una
  idea sin precedente.

---

## Pendiente

- [ ] Terminar de revisar sub-páginas de Sharplink (`/about`,
      `/investors`, `/ethereum-opportunity`, `/news`) si hace falta más
      detalle.
- [ ] El usuario mencionó que había pedido "diferentes librerías para 3D,
      scrolling, efectos" — nombres concretos de librerías no aparecieron
      en esta reconstrucción. Si el usuario los recuerda, agregarlos acá.
- [ ] Decisión pendiente: qué de esto entra al MVP (dentro del tiempo de
      D7) vs. qué queda en `docs/ROADMAP.md` para después. Ver conversación
      en curso con CEO sobre "reconsiderar la metáfora visual" — este
      documento es evidencia concreta para esa decisión, no una decisión
      en sí misma.
