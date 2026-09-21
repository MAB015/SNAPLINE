"use client";

import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type Tema = "claro" | "oscuro";

const TemaContext = createContext<{ tema: Tema; alternar: () => void } | null>(null);

const MEDIA_OSCURO = "(prefers-color-scheme: dark)";

function suscribirsePreferenciaOscura(notificar: () => void) {
  const media = window.matchMedia(MEDIA_OSCURO);
  media.addEventListener("change", notificar);
  return () => media.removeEventListener("change", notificar);
}

function leerPreferenciaOscuraCliente() {
  return window.matchMedia(MEDIA_OSCURO).matches;
}

function leerPreferenciaOscuraServidor() {
  return false;
}

/**
 * Tema oscuro con interruptor (docs/BRAND.md §4). Local a la pantalla que lo
 * monta, no a toda la app: pone `data-theme` en un `div` propio en lugar de
 * en `<html>`, que es de otra rama. Por defecto sigue `prefers-color-scheme`
 * (via `useSyncExternalStore`, para no desincronizar el primer render del
 * servidor) y el interruptor lo anula.
 */
export function TemaAcuerdo({ children }: { children: ReactNode }) {
  const prefiereOscuro = useSyncExternalStore(
    suscribirsePreferenciaOscura,
    leerPreferenciaOscuraCliente,
    leerPreferenciaOscuraServidor,
  );
  const [anulado, setAnulado] = useState<Tema | null>(null);
  const tema: Tema = anulado ?? (prefiereOscuro ? "oscuro" : "claro");

  return (
    <TemaContext.Provider
      value={{
        tema,
        alternar: () => setAnulado(tema === "claro" ? "oscuro" : "claro"),
      }}
    >
      <div
        data-theme={tema === "oscuro" ? "dark" : undefined}
        className="bg-doc text-ink min-h-full"
      >
        {children}
      </div>
    </TemaContext.Provider>
  );
}

/** Boton del interruptor. Tiene que montarse dentro de `TemaAcuerdo`. */
export function InterruptorTema() {
  const contexto = useContext(TemaContext);
  if (!contexto) return null;

  return (
    <button
      type="button"
      onClick={contexto.alternar}
      aria-label={`Cambiar a tema ${contexto.tema === "claro" ? "oscuro" : "claro"}`}
      className="border-rule text-ink-60 hover:border-ink hover:text-ink mono border px-3 py-1.5 text-xs tracking-wide uppercase"
    >
      {contexto.tema === "claro" ? "Oscuro" : "Claro"}
    </button>
  );
}
