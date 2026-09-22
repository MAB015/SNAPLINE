"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

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

// Clave de localStorage donde se guarda la preferencia explicita de tema
// (la que pisa `prefers-color-scheme` al tocar el interruptor). Un solo
// valor compartido por todas las pantallas: "claro" u "oscuro".
const CLAVE_TEMA_GUARDADO = "snapline:tema";

// Listeners del store externo de "tema anulado". No usamos useState porque
// el mismo store tiene que poder notificar cambios que vienen de afuera del
// componente (otra pestana via el evento "storage", o el propio alternar()
// escribiendo en localStorage), que es exactamente el caso de uso de
// useSyncExternalStore.
const listenersTemaGuardado = new Set<() => void>();

function suscribirseTemaGuardado(notificar: () => void) {
  listenersTemaGuardado.add(notificar);
  const alCambiarStorage = (evento: StorageEvent) => {
    if (evento.key === CLAVE_TEMA_GUARDADO) notificar();
  };
  window.addEventListener("storage", alCambiarStorage);
  return () => {
    listenersTemaGuardado.delete(notificar);
    window.removeEventListener("storage", alCambiarStorage);
  };
}

function leerTemaGuardadoCliente(): Tema | null {
  const valor = window.localStorage.getItem(CLAVE_TEMA_GUARDADO);
  return valor === "claro" || valor === "oscuro" ? valor : null;
}

// El servidor no tiene localStorage: el snapshot de servidor tiene que ser
// fijo y deterministico (igual que `leerPreferenciaOscuraServidor` de
// arriba) para no desincronizar la hidratacion. `useSyncExternalStore` ya
// resuelve el ajuste al valor real de cliente sin marcar error de
// hidratacion; puede haber un flash muy breve de tema por defecto en el
// primer pintado si habia una preferencia guardada distinta — se deja
// documentado, no hace falta un script inline para esto.
function leerTemaGuardadoServidor(): Tema | null {
  return null;
}

function guardarTemaGuardado(tema: Tema) {
  window.localStorage.setItem(CLAVE_TEMA_GUARDADO, tema);
  listenersTemaGuardado.forEach((notificar) => notificar());
}

/**
 * Tema oscuro con interruptor (docs/BRAND.md §4). Local a la pantalla que lo
 * monta, no a toda la app: pone `data-theme` en un `div` propio en lugar de
 * en `<html>`, que es de otra rama. Por defecto sigue `prefers-color-scheme`
 * (via `useSyncExternalStore`, para no desincronizar el primer render del
 * servidor) y el interruptor lo anula.
 *
 * La preferencia explicita del interruptor se guarda en `localStorage`
 * (`snapline:tema`), asi que persiste entre pantallas: elegir tema en / y
 * navegar a /acuerdo/[id] (o viceversa) mantiene la eleccion. Cada pantalla
 * sigue montando su propio `ProveedorTema` (no hay un tema compartido via
 * contexto de React entre rutas, eso seguiria siendo de `layout.tsx`), pero
 * todas leen y escriben la misma clave de almacenamiento del navegador.
 */
export function ProveedorTema({ children }: { children: ReactNode }) {
  const prefiereOscuro = useSyncExternalStore(
    suscribirsePreferenciaOscura,
    leerPreferenciaOscuraCliente,
    leerPreferenciaOscuraServidor,
  );
  const anulado = useSyncExternalStore(
    suscribirseTemaGuardado,
    leerTemaGuardadoCliente,
    leerTemaGuardadoServidor,
  );
  const tema: Tema = anulado ?? (prefiereOscuro ? "oscuro" : "claro");

  return (
    <TemaContext.Provider
      value={{
        tema,
        alternar: () => guardarTemaGuardado(tema === "claro" ? "oscuro" : "claro"),
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

/**
 * Boton del interruptor. Tiene que montarse dentro de `ProveedorTema`.
 *
 * Icono en vez de texto (docs/BRAND.md §12: "Iconografia: casi ninguna.
 * Trazo de 1px, del mismo peso que los filetes"): un solo glifo SVG en
 * linea que cambia segun el tema, sin libreria de iconos ni archivo de
 * imagen -- mismo criterio que el resto de las texturas de este sistema.
 * Muestra el icono del tema DESTINO (luna cuando el clic lleva a oscuro,
 * sol cuando lleva a claro), igual que el texto que reemplaza ("Oscuro"/
 * "Claro" ya nombraban el destino, no el estado actual).
 *
 * Area de toque >=24x24px (WCAG 2.5.8): `h-8 w-8` (32px) es el mismo
 * criterio que ya se aplico en `HashVivo.tsx` para sus botones/enlaces de
 * icono. Foco visible con `outline` (no `box-shadow`: cero sombras es
 * regla dura de §12) en vez de depender del outline por defecto del
 * navegador, que varia entre navegadores.
 */
export function InterruptorTema() {
  const contexto = useContext(TemaContext);
  if (!contexto) return null;

  const destino: Tema = contexto.tema === "claro" ? "oscuro" : "claro";

  return (
    <button
      type="button"
      onClick={contexto.alternar}
      aria-label={`Cambiar a tema ${destino}`}
      className="border-rule text-ink-60 hover:border-ink hover:text-ink focus-visible:border-ink focus-visible:text-ink flex h-8 w-8 shrink-0 items-center justify-center border outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      {destino === "oscuro" ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M12.25 7.46A5.25 5.25 0 1 1 6.54 1.75A4.08 4.08 0 0 0 12.25 7.46Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="2.92" stroke="currentColor" />
          <path
            d="M7 0.58V1.75M7 12.25V13.42M2.46 2.46 3.29 3.29M10.71 10.71 11.54 11.54M0.58 7H1.75M12.25 7H13.42M2.46 11.54 3.29 10.71M10.71 3.29 11.54 2.46"
            stroke="currentColor"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
