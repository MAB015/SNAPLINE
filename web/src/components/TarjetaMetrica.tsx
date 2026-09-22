import type { ReactNode } from "react";

/**
 * Tarjeta de métrica en superficie `chain`: etiqueta chica en mayúscula
 * arriba, contenido libre debajo (docs/BRAND.md §5-§9, patrón "tarjeta
 * oscura individual con cifra grande y etiqueta chica encima" documentado
 * en la investigación de sharplink.com). El peso visual lo dan el tamaño
 * tipográfico, el contraste y el espacio — nunca glow ni degradado
 * (docs/BRAND.md §12, regla dura).
 *
 * `children` en lugar de una prop `valor` porque no todas las tarjetas
 * muestran una sola cifra: la de contratos verificados monta una lista de
 * `HashVivo`. Quien la usa decide qué va adentro y con qué tamaño de texto
 * (la escala cerrada de docs/BRAND.md §5 — p.ej. envolver un
 * `<ContadorNumero>`/`<ContadorTests>` en `text-2xl` para la cifra grande).
 *
 * `data-surface="chain"` en la raíz: idempotente si ya hay un ancestro con
 * el mismo atributo (mismo valor, no cambia nada al reaplicarse), así que
 * la tarjeta queda aislada y reusable sola — sin depender de que quien la
 * monte ya haya abierto una superficie `chain` alrededor. Por el mismo
 * motivo lleva `bg-chain text-on-chain` propios en vez de heredarlos.
 *
 * No agrega su propia textura de rejilla (docs/BRAND.md §7): si vive
 * dentro de una sección que ya la puso una vez de fondo — como la sección
 * "Verificado en cadena" de `/` —, duplicarla por tarjeta generaría dos
 * capas superpuestas del mismo patrón.
 *
 * El borde usa `border-on-chain/20`, no `border-rule`: `--color-rule` se
 * deriva de `--raw-ink`, que `[data-surface="chain"]` en `globals.css` NO
 * sobreescribe (solo lo hace para los tokens de participante y de sistema).
 * En tema claro eso dejaría un filete oscuro sobre fondo oscuro, casi
 * invisible. `on-chain/20` es el mismo patrón que ya usan los separadores
 * internos del bloque sellado de `/acuerdo/[id]` y de esta misma sección.
 */
export function TarjetaMetrica({
  etiqueta,
  children,
  className = "",
}: {
  etiqueta: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-surface="chain"
      className={`bg-chain text-on-chain border border-on-chain/20 px-5 py-5 ${className}`}
    >
      <p className="mono text-xs tracking-wide uppercase opacity-80">{etiqueta}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}
