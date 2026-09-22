# Dirección visual — SNAPLINE

**Fecha:** 2026-09-20 · **Dirección elegida:** Acta Viva · Revisa "Acta" (D-012), ver D-029

---

## 1. El nombre

*Snapline* es la cuerda entizada que los constructores tensan y sueltan de
golpe para marcar una línea recta y exacta sobre una superficie. El momento de
la firma es ese golpe: tensa y suelta la línea, y desde ahí el reparto queda
marcado y ya no se discute.

La metáfora entra por el comportamiento —la línea, la marca, el snap— nunca
por la ilustración. **No se dibuja la herramienta.** Ni cuerdas, ni tizas, ni
cascos, ni iconografía de construcción.

## 2. Tono

Un acuerdo entre personas sobre dinero que, al firmarse, se vuelve un objeto
vivo en la cadena. Empieza con la seriedad de un documento y termina con la
energía de algo que se mueve solo.

Acta se quedaba en la primera mitad: se leía bien pero se veía blanca y plana
en video. Acta Viva conserva el esqueleto de documento —tipografía, filetes,
cifras en mono— y le suma color, textura, hashes vivos y un objeto 3D donde
la historia lo pide.

Los números y los porcentajes siguen siendo el protagonista visual, no los
botones. Densidad alta de información.

## 3. La idea central: papel → cadena

La interfaz cuenta con el material en qué estado está cada cosa.

| Capa | Qué vive ahí | Cómo se ve |
|---|---|---|
| **Papel** (off-chain) | Borrador, términos, firmas pendientes | Superficie `doc`, grano de papel, serif, filetes |
| **Cadena** (on-chain) | Pool, saldos, transacciones, hashes confirmados | Superficie `chain`, rejilla de puntos, mono, color pleno |

**El snap es el cruce.** Cuando entra la última firma, el documento se sella
y el bloque del acuerdo pasa de papel a cadena: la superficie cambia, la
textura cambia y aparece el anillo 3D del pool.

El color de participante está en las dos capas desde el principio. En papel
va contenido, en trama y filete; en cadena va pleno. La capa no decide si hay
color, decide cuánto.

Regla práctica: si un dato se puede verificar en el explorador, vive en
superficie `chain`. Si solo existe en el relay o en el formulario, vive en
`doc`.

## 4. Temas claro y oscuro

Hay dos temas completos. Por defecto sigue `prefers-color-scheme` y hay un
interruptor manual en la cabecera.

- **Claro:** página en papel hueso; los bloques de cadena son planchas de
  tinta dentro del papel. Es el contraste más fuerte entre capas.
- **Oscuro:** página en carbón cálido; los bloques de cadena son más
  profundos y fríos. Como el brillo ya no separa tanto las capas, **la
  separación la hace la textura**: grano en papel, rejilla en cadena.

**El video se graba en claro.** Ahí el cruce papel → cadena se lee sin
explicarlo. El oscuro existe, funciona y se revisa, pero no protagoniza el
video.

## 5. Tipografía

| Uso | Familia | Notas |
|---|---|---|
| Títulos y encabezados | **Instrument Serif** | Una sola serif, con voz. Solo en tamaños grandes |
| Cifras, porcentajes, direcciones, hashes | **IBM Plex Mono** | Numerales tabulares siempre. Alineados a la derecha en tablas |
| Cuerpo, etiquetas, formularios | **IBM Plex Sans** | Tamaño pequeño y denso |

**Escala:** 12 · 14 · 16 · 20 · 32 · 56. Nada intermedio.

Las cifras nunca van en la serif ni en la sans. Un porcentaje, un monto o una
dirección siempre va en mono. Sigue siendo la regla que sostiene la identidad
y lo que separa esto de otro dashboard cripto.

## 6. Paleta

Los colores van por **superficie**, no por tema: todo lo que cae sobre una
superficie clara usa la variante clara, y todo lo que cae sobre una oscura,
la oscura. En el tema claro, un bloque de cadena usa las variantes oscuras.

### Neutros

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `doc` | `#FAF8F3` | `#1B1914` | Superficie papel |
| `chain` | `#14120E` | `#0C0C0E` | Superficie cadena |
| `ink` | `#14120E` | `#EDE9DF` | Texto sobre `doc` |
| `ink-60` | `ink` al 60% | `ink` al 60% | Texto secundario |
| `rule` | `ink` al 18% | `ink` al 18% | Filetes |
| `on-chain` | `#EDE9DF` | `#EDE9DF` | Texto sobre `chain` |

### Participantes

Se asignan por **orden en el acuerdo**, no por persona. Cada uno tiene
color y trama (§7): el color identifica y la trama garantiza que se lean
aunque no se distinga el color.

| Token | Sobre claro | Sobre oscuro | Trama | En el demo |
|---|---|---|---|---|
| `p1` · cobalto | `#2743C9` | `#7D95FF` | Diagonal 45° | Mariana |
| `p2` · verde | `#16774B` | `#4CC38A` | Puntos | Julián |
| `p3` · violeta | `#6E3BC8` | `#B292FF` | Cuadrícula cruzada | Sofía |
| `p4` · naranja | `#AD5414` | `#F29A52` | Verticales | Andrés |

El cobalto es un guiño a la dirección "Plano" que se descartó en D-012.

Con más de cuatro participantes, el color se repite y la trama cambia. Una
paleta de ocho está en el roadmap.

### Acentos de sistema

| Token | Sobre claro | Sobre oscuro | Uso |
|---|---|---|---|
| `stamp` | `#B3261E` | `#F0524A` | Los cortes de la línea y el estado de firma completa. Nada más |
| `caution` | `#8A6D00` | `#E0B52E` | Exclusivo del sello de simulado |

El rojo de sello se sigue usando poco para que pese: si aparece en más de
dos sitios por pantalla, está mal usado. Ningún participante es rojo ni
ocre, para que no se confunda con los acentos de sistema.

### Contraste

Todos los colores de texto pasan AA (4,5:1) sobre su superficie; se midió al
fijar la paleta. El menor es `p4` sobre papel, con 4,88:1. Las variantes
oscuras quedan entre 5,0 y 10,1 sobre cualquiera de las superficies oscuras.

## 7. Texturas

La textura es la identidad, no un adorno. Se hacen con SVG en línea en el
CSS, sin archivos de imagen.

| Textura | Dónde | Cómo |
|---|---|---|
| **Grano de papel** | Superficie `doc` | Ruido fino, 4–6% de opacidad |
| **Rejilla de puntos** | Superficie `chain` | Puntos de 1px cada 8px, `on-chain` al 10% |
| **Tramas de participante** | Barra segmentada, chips, relleno de su parte en el pool | La trama de §6 en el color del participante |
| **Tinta de sello** | Estado firmado, sello del acuerdo sellado | Máscara con desgaste sobre el color, como un sello de goma real |
| **Franjas de precaución** | Sello de simulado | Diagonales en `caution`, estilo cinta |

**Prueba de video:** el grano fino se lo come la compresión o se vuelve
bandas. Cada textura se revisa en un fotograma exportado del video, no solo
en el navegador. Si no sobrevive, se engrosa: grano de 2px como mínimo.

## 8. Identidad de cada elemento

Cada cosa tiene que reconocerse de un vistazo, en todas las pantallas.

- **Participante:** color + trama + identicon. Los tres lo acompañan igual
  en `/nuevo`, en la tabla de reparto, en el anillo, en el pool y en el
  retiro. El ojo sigue a Sofía por todo el video.
- **Identicon:** rejilla simétrica de 5×5 derivada de la dirección, en el
  color del participante. Cuadrados, sin radio. La dirección le da la forma y
  el acuerdo le da el color.
- **Estado de firma:** chip con forma además de color. Pendiente = contorno
  punteado. Firmado = relleno con tinta de sello. Desplegado = plancha de
  cadena.
- **Red:** indicador fijo `HSKChain Testnet · bloque #…` en mono, con un
  pulso que marca cada bloque nuevo.
- **Transacción:** cada tx confirmada deja un recibo en superficie `chain`:
  qué pasó, bloque, gas y hash.

## 9. El hash vivo

Los hashes y las direcciones son objetos interactivos, no texto muerto.

- **Aparición:** el hash se descifra carácter por carácter la primera vez
  que entra en pantalla (ScrambleText de GSAP). Una vez, no en bucle.
- **Hover:** se despliega el valor completo.
- **Clic:** copia al portapapeles y la etiqueta cambia a `copiado` en el
  mismo sitio. Sin toasts.
- **Enlace:** un ícono de 1px abre el explorador de HSKChain.
- **Código de barras:** el hash de los términos se dibuja también como un
  código de barras en tinta, con anchos derivados de sus bytes. Si cambia una
  coma, cambia el código. Es la forma visual de "esto es exactamente lo que
  firmaste".

## 10. Movimiento

GSAP para todo lo que se mueve en 2D. Tres reglas:

1. **Cada animación explica algo.** Un monto que cuenta hasta 4.000 explica
   que llegó dinero. Un hash que se descifra explica que es un valor
   calculado. Si no explica nada, no se anima.
2. **Una vez, sin rebote.** Desaceleración (`power3.out` o similar), sin
   elásticos ni bucles.
3. **Corto.** Menos de 400ms por pieza, salvo la secuencia del snap.

Inventario cerrado:

| Pieza | Qué hace |
|---|---|
| Hash | Scramble al aparecer |
| Montos | Contador hacia el valor final |
| Filas de la tabla | Entrada escalonada, una sola vez al cargar |
| Firma | El chip pasa a tinta de sello con un golpe corto |
| Snap | La línea se tensa, las marcas caen, el bloque cruza a cadena y entra el anillo |
| Pool | Al llegar un pago, cada segmento se llena en su proporción |

Con `prefers-reduced-motion`, todo aparece en su estado final sin
transiciones.

## 11. El anillo — el único objeto 3D

El pool se representa como **un anillo segmentado**: un toroide cortado en
tantos segmentos como participantes, cada uno del largo de su porcentaje y en
su color. Es un solo componente que se reutiliza en dos pantallas.

- **`/acuerdo/[id]`:** antes de la última firma, los segmentos flotan
  separados, y cada firma acerca el suyo. Con la última encajan de golpe y
  el anillo se cierra. Ese es el snap en 3D.
- **`/pool/[dir]`:** el anillo cerrado. Cuando entra un pago, cada segmento
  se ilumina y se llena de forma proporcional a lo que le toca.
- **Clicable:** al pasar el cursor, el segmento se separa un poco. Al hacer
  clic se abre un panel con participante, identicon, %, su parte, lo
  retirado y su dirección con hash vivo.

**Material:** sombreado *toon* de dos o tres bandas planas con contorno en
tinta, en lugar de un material brillante. Se ve impreso, casa con los
filetes y respeta el espíritu de "cero degradados". Fondo transparente sobre
la superficie `chain`, que no se pinta dentro del canvas.

**Técnica:** `@react-three/fiber` + `drei`, cargado con `next/dynamic` y
sin SSR, para que no pese en las pantallas que no lo usan. Ver D-030.

**Caja de tiempo:** un día. Si no está listo al cerrar la caja, se corta y
queda la barra segmentada 2D con el snap en GSAP, que funciona sola. El
anillo nunca bloquea el flujo: la firma y el despliegue no dependen de él.

## 12. Reglas duras

Esto no es estilo, es contrato:

- **Cero degradados en la interfaz 2D.** Las tramas y la rejilla usan cortes
  duros, no transiciones de color. El único sombreado es el del anillo 3D,
  en bandas planas.
- **Cero sombras.** La profundidad la hacen los filetes, las capas papel y
  cadena y la textura.
- **Cero esquinas redondeadas.** Radio 0 en todo, incluidos botones,
  inputs, chips e identicons.
- Los filetes son de 1px, color `rule`. Las tablas los muestran.
- Los botones son texto con un filete alrededor. El primario invierte: fondo
  `ink`, texto `doc`. Sobre `chain` invierte al revés.
- Nada de emojis como viñetas, nada de badges de "powered by", nada de texto
  centrado en párrafos largos.
- Nada de rejilla de tres features con un ícono de línea en cada una.
- Nada de neón, glassmorphism ni brillos. Web3 sí, estética de casino no.
- Iconografía: casi ninguna. Trazo de 1px, del mismo peso que los filetes.

## 13. La barra segmentada y el snap

La barra sigue siendo la pieza gráfica principal en 2D: una sola línea
horizontal dividida en segmentos proporcionales, con marcas verticales en
cada corte y etiquetas en mono debajo.

```
├▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨▨┼░░░░░░░░░░░░░┼▦▦▦▦▦▦▦▦▦▦┼║║║║║┤
   40.00%                 25.00%        20.00%    15.00%
   Mariana                Julián        Sofía     Andrés
```

Cambio respecto a Acta: cada segmento lleva ahora la trama de su
participante en su color, en lugar de ser tinta lisa. Los cortes siguen en
`stamp`. Sigue siendo un solo objeto, no cuatro rectángulos sueltos.

**El snap, en orden:**
1. La línea se tensa: ancho de 0 a 100% con desaceleración, menos de 400ms.
2. Las marcas de corte caen de golpe en `stamp`.
3. El bloque del acuerdo cruza de `doc` a `chain`: cambia la superficie y la
   textura, y aparece el sello de tinta "sellado".
4. Entra el anillo 3D, si existe.

Los pasos 1 a 3 son obligatorios y se hacen en D5. El 4 depende de la caja
del anillo.

## 14. La pantalla principal

`/acuerdo/[id]` es la pieza que más se va a mirar en el demo, y comparte
maquetación con el resto de las pantallas de documento y formulario del
producto (`/nuevo`, `/pagar/[dir]`, `/pool/[dir]`, `/retiro-cop/[dir]`):
una sola columna de lectura, `max-w-3xl` (~672px), centrada con margen a
los lados. Se trata como una portada de documento que se vuelve contrato:

1. Encabezado: nombre del proyecto en Instrument Serif grande, y debajo, en
   mono pequeña, el identificador del acuerdo, la fecha y el indicador de
   red.
2. La barra segmentada, a todo el ancho, con aire generoso arriba y abajo.
3. La tabla de reparto: identicon, participante, dirección abreviada con
   hash vivo, porcentaje alineado a la derecha, chip de estado de firma.
   Filetes visibles.
4. Los términos en texto, con su hash vivo y su código de barras debajo.
5. La acción de firmar, sola, al final. Un solo botón.

Después del snap, el bloque sellado queda en `chain` con el anillo, la
dirección del pool y el recibo de la transacción de despliegue.

Sin barra lateral. Sin tarjetas flotantes. Sin secciones plegadas. El
documento se lee de arriba abajo.

**La excepción es la landing (`/`).** Desde la Fase A del pivote de layout
(D-045), la portada de entrada corre a ancho completo real, sin cap de
columna — ni `max-w-3xl` ni un `max-w-7xl` intermedio: es la puerta del
producto, no un documento que se firma, y el usuario pidió explícitamente
que no se viera "acotada, en la mitad". El `<h1>` y la grilla de
"Verificado en cadena" se estiran a todo el viewport en monitores anchos;
los párrafos largos siguen protegidos por `max-w-prose` para no perder
legibilidad, y la sección de superficie `chain` sangra a todo el ancho de
la pantalla como un bloque aparte del resto del contenido. Ninguna otra
pantalla adopta este ancho completo: en cuanto el flujo pasa a crear,
firmar, pagar o retirar, vuelve a la columna angosta de arriba.

## 15. El sello de simulado

Donde algo sea mock, se marca con un bloque con filete y franjas de
precaución en `caution`, y el texto en mono mayúscula:
`SIMULADO · NO MUEVE DINERO REAL`.

No es un tooltip ni una nota al pie. Ocupa espacio y se ve en el video sin
que nadie lo señale. Las franjas hacen que se distinga también en el tema
oscuro y sin color.

## 16. Direcciones anteriores

**Acta** (D-012, 2026-09-20): papel hueso, tinta y un solo acento rojo. Era
correcta como documento, pero se veía blanca y plana en video y no
identificaba a cada participante. Acta Viva la conserva entera como capa de
papel y le suma la capa de cadena.

**Plano** (descartada en D-012): Space Grotesk, azul tiza, líneas de cota.
De ella vienen la barra segmentada y, ahora, el cobalto de `p1`.
