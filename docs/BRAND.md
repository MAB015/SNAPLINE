# Dirección visual — SNAPLINE

**Fecha:** 2026-09-20 · **Dirección elegida:** Acta

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

Esto es un acuerdo entre personas sobre dinero. Tiene que leerse con la
seriedad de un documento, no con la de una landing de startup.

Densidad alta de información. Mucho espacio en blanco, usado a propósito y no
por defecto. Los números y los porcentajes son el protagonista visual, no los
botones.

## 3. Tipografía

| Uso | Familia | Notas |
|---|---|---|
| Títulos y encabezados | **Instrument Serif** | Una sola serif, con voz. Solo en tamaños grandes |
| Cifras, porcentajes, direcciones | **IBM Plex Mono** | Numerales tabulares siempre. Alineados a la derecha en tablas |
| Cuerpo, etiquetas, formularios | **IBM Plex Sans** | Tamaño pequeño y denso |

Tres familias con trabajos distintos y sin solaparse. La jerarquía la hace el
contraste entre serif grande y mono pequeña, no una escala de quince pasos.

**Escala:** 12 · 14 · 16 · 20 · 32 · 56. Nada intermedio.

Las cifras nunca van en la serif ni en la sans. Un porcentaje, un monto o una
dirección siempre va en mono. Es la regla que sostiene toda la identidad.

## 4. Paleta

| Token | Valor | Uso |
|---|---|---|
| `paper` | `#FAF8F3` | Fondo. Hueso, no blanco |
| `ink` | `#14120E` | Texto y filetes |
| `ink-60` | `#14120E` al 60% | Texto secundario |
| `rule` | `#14120E` al 18% | Filetes de tabla |
| `stamp` | `#B3261E` | **Acento único.** La línea, el estado de firma completa |
| `caution` | `#8A6D00` | Exclusivo del sello de simulado |

Seis tokens. El rojo de sello se usa poco y por eso pesa: la línea del snap y
el momento en que el acuerdo queda firmado. Si aparece en más de dos sitios
por pantalla, está mal usado.

## 5. Reglas duras

Esto no es estilo, es contrato:

- **Cero degradados.** En ningún elemento, en ningún estado.
- **Cero sombras.** La profundidad se hace con filetes y espacio.
- **Cero esquinas redondeadas.** Radio 0 en todo, incluidos botones e inputs.
- Los filetes son de 1px, color `rule`. Las tablas los muestran; no se
  esconden las líneas.
- Los botones son texto con un filete alrededor. El primario invierte:
  fondo `ink`, texto `paper`.
- Nada de emojis como viñetas, nada de badges de "powered by", nada de texto
  centrado en párrafos largos.
- Nada de rejilla de tres features con un ícono de línea en cada una.
- Iconografía: casi ninguna. Si hace falta, trazo de 1px y del mismo peso que
  los filetes.

## 6. El dispositivo de la línea

La única pieza gráfica propia, y viene prestada de la dirección "Plano":

**La barra segmentada.** El reparto se dibuja como una sola línea horizontal
dividida en segmentos proporcionales a cada porcentaje, con marcas verticales
en cada corte y las etiquetas colgando debajo en mono.

```
├──────────────────────┼─────────────┼──────────┼─────┤
   40.00%                 25.00%        20.00%    15.00%
   Mariana                Julián        Sofía     Andrés
```

No es un gráfico de barras apiladas con colores. Es una línea marcada, en
`ink`, con los cortes en `stamp`. Un solo objeto, no cuatro rectángulos.

**El snap.** Cuando entra la última firma, la línea se tensa —una transición
corta de ancho, de 0 a 100%, con desaceleración— y las marcas aparecen de
golpe. Una sola vez, sin repetición, sin rebote. Dura menos de 400ms.

Si no hay tiempo para animarlo, la línea simplemente aparece completa. La
metáfora sobrevive sin la animación; no sobrevive si se convierte en un
efecto llamativo.

## 7. La pantalla principal

`/acuerdo/[id]` es la pieza que más se va a mirar en el demo. Se trata como
una portada de documento:

1. Encabezado: nombre del proyecto en Instrument Serif grande, y debajo, en
   mono pequeña, el identificador del acuerdo y la fecha.
2. La barra segmentada, a todo el ancho, con aire generoso arriba y abajo.
3. La tabla de reparto: participante, dirección abreviada en mono,
   porcentaje alineado a la derecha, estado de firma. Filetes visibles.
4. Los términos, en texto, con su hash en mono debajo.
5. La acción de firmar, sola, al final. Un solo botón.

Sin barra lateral. Sin tarjetas. Sin secciones plegadas. El documento se lee
de arriba abajo.

## 8. El sello de simulado

Donde algo sea mock, se marca con un bloque de filete en `caution`, con el
texto en mono mayúscula: `SIMULADO · NO MUEVE DINERO REAL`.

No es un tooltip ni una nota al pie. Ocupa espacio y se ve en el video sin
que nadie lo señale. Esa es su función.

## 9. La dirección que no elegimos

Se consideró una dirección **Plano** —Space Grotesk, azul tiza `#1E4FD8`,
líneas de cota, estética de plano de obra— más distintiva y con la metáfora
más explícita. Se descartó porque el criterio del proyecto es "seriedad de
documento", y Acta lo cumple sin pelear contra sí misma. De Plano se rescató
únicamente la barra segmentada.

Queda anotado por si en el horizonte 1 hace falta una segunda piel para
material de marca.
