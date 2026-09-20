import type { EstadoFirma as Estado } from "@/lib/acuerdo";

/**
 * Estado de firma de una fila. En mono mayuscula, sin iconos ni colores de
 * semaforo: lo pendiente se apaga, lo firmado se lee en tinta plena.
 *
 * El rojo `stamp` no entra aqui a proposito. Esta reservado a la linea y al
 * estado global del acuerdo; repetido por fila dejaria de pesar.
 */
export function EstadoFirma({ estado }: { estado: Estado }) {
  const firmado = estado === "firmado";
  return (
    <span
      className={`mono text-xs uppercase tracking-wide ${firmado ? "text-ink" : "text-ink-60"}`}
    >
      {firmado ? "Firmado" : "Pendiente"}
    </span>
  );
}

/**
 * Estado del acuerdo completo. Es el unico sitio de la pantalla donde el
 * rojo de sello acompana a la linea.
 */
export function EstadoAcuerdo({
  firmadas,
  total,
}: {
  firmadas: number;
  total: number;
}) {
  const completo = firmadas === total;
  return (
    <p
      className={`mono text-xs uppercase tracking-wide ${completo ? "text-stamp" : "text-ink-60"}`}
    >
      {completo
        ? "Acuerdo firmado · pool desplegado"
        : `${firmadas} de ${total} firmas`}
    </p>
  );
}
