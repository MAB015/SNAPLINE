import type { Hash, PublicClient } from "viem";

/**
 * Reemplazo de `publicClient.waitForTransactionReceipt` para las pantallas que
 * firman una transacción y necesitan saber cuándo se confirma.
 *
 * Bug real reproducido en D6 (ver DECISIONS.md): en el navegador, con la
 * wallet embebida de Privy + `wagmi` + el proxy `/api/rpc`, la promesa de
 * `waitForTransactionReceipt` puede quedar colgada para siempre — el botón
 * nunca vuelve a su estado normal — aunque el recibo YA esté disponible en
 * cadena (confirmado con `eth_getTransactionReceipt` directo, capturado en
 * DevTools con `status: "0x1"` y los logs del evento). Se descartó que sea un
 * problema del RPC/proxy o de `viem`/`@wagmi/core`: el mismo transporte
 * (`http("/api/rpc")`), el mismo `hash` real y la misma llamada
 * `waitForTransactionReceipt` resuelven en menos de un segundo cuando se
 * ejercitan desde Node —tanto con un cliente `viem` crudo como con
 * `@wagmi/core` (`writeContract` + `getPublicClient` +
 * `waitForTransactionReceipt`, la misma capa que usan `useWriteContract` y
 * `usePublicClient` por debajo)— repitiendo dos transacciones reales
 * seguidas en la misma sesión, igual que el reporte original. La única capa
 * no reproducible fuera del navegador es la reactividad de wagmi/Privy
 * (reconexiones de `useSyncPrivyWallets` en `@privy-io/wagmi`, fuera de
 * nuestro control): `waitForTransactionReceipt` interno de `viem` comparte
 * un mecanismo de "observe"/dedup global keyed por `client.uid` con
 * `watchBlockNumber`, y una reconexión que haga circular el estado de
 * `wagmiConfig` es la sospechosa más plausible para que ese mecanismo se
 * quede sin emitir — no se pudo confirmar el mecanismo exacto sin DevTools
 * de navegador en vivo.
 *
 * En vez de perseguir esa causa dentro de wagmi/Privy (fuera del control de
 * esta app), esta función hace su propio polling directo de
 * `getTransactionReceipt`, sin pasar por `watchBlockNumber`/`observe` de
 * `viem`: no depende de ningún estado compartido reactivo, así que no puede
 * quedar huérfana. Tiene un timeout explícito para que un botón nunca quede
 * atascado para siempre — peor caso, tira `EsperaReciboTimeoutError` con el
 * hash, para que quien llama pueda mostrar un comprobante degradado en vez
 * de un error genérico (la tx puede seguir confirmando igual, solo dejamos
 * de esperarla).
 */
export class EsperaReciboTimeoutError extends Error {
  readonly hash: Hash;

  constructor(hash: Hash) {
    super(
      "Se agotó el tiempo de espera confirmando la transacción en cadena. Revisá el explorador con el hash.",
    );
    this.name = "EsperaReciboTimeoutError";
    this.hash = hash;
  }
}

export async function esperarRecibo(
  publicClient: PublicClient,
  hash: Hash,
  opciones: { intervaloMs?: number; timeoutMs?: number } = {},
) {
  const intervaloMs = opciones.intervaloMs ?? 2000;
  const timeoutMs = opciones.timeoutMs ?? 120_000;
  const desde = Date.now();

  while (true) {
    try {
      const recibo = await publicClient.getTransactionReceipt({ hash });
      if (recibo) return recibo;
    } catch {
      // Todavía no está minada, o hipo transitorio del RPC: se reintenta.
    }
    if (Date.now() - desde > timeoutMs) {
      throw new EsperaReciboTimeoutError(hash);
    }
    await new Promise((resolve) => setTimeout(resolve, intervaloMs));
  }
}

/**
 * Segundo bug real, distinto del de arriba, confirmado en vivo con logs
 * instrumentados (D6): a veces `writeContractAsync` — que por debajo llama
 * `Embedded1193Provider.request({ method: "eth_sendTransaction" })` de
 * Privy — nunca resuelve su promesa, ni siquiera para entregar el hash. En
 * esa corrida la consola mostró `Embedded1193Provider.request() called...`
 * y ahí se cortó, sin más logs; un `eth_call` manual a `balanceOf` mostró
 * que la transacción de todos modos se había ejecutado en cadena. Sospecha
 * de origen: la misma condición de carrera de `useSyncPrivyWallets` que
 * explica `EsperaReciboTimeoutError` arriba, pero disparada en un punto
 * anterior de la cadena de promesas — antes de tener un hash, así que acá
 * no hay nada que mostrar como comprobante degradado. Quien llama tiene que
 * resolver la duda de otra forma (polling de saldo u otro estado en cadena
 * — ver `esperarCondicion`).
 */
export class EnvioTimeoutError extends Error {
  constructor() {
    super("Se agotó el tiempo de espera enviando la transacción a la wallet.");
    this.name = "EnvioTimeoutError";
  }
}

/** Envuelve una promesa que puede quedar colgada para siempre (el caso de
 *  arriba) y la corta con `EnvioTimeoutError` si no resuelve a tiempo. La
 *  promesa original sigue corriendo igual — no hay forma de cancelar
 *  `eth_sendTransaction` una vez pedido — pero quien llama ya no se queda
 *  esperándola. */
export async function conTimeout<T>(promesa: Promise<T>, timeoutMs: number): Promise<T> {
  let temporizador: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    temporizador = setTimeout(() => reject(new EnvioTimeoutError()), timeoutMs);
  });
  try {
    return await Promise.race([promesa, timeout]);
  } finally {
    clearTimeout(temporizador!);
  }
}

/**
 * Sondeo genérico de "¿ya pasó esto?" para el fallback del caso 2: sin hash
 * no hay recibo que esperar, pero sí hay un estado en cadena que debería
 * cambiar si la tx efectivamente se ejecutó (un saldo que sube, un pool que
 * aparece desplegado). `verificar` se reintenta hasta que devuelva un valor
 * verdadero o se agote `timeoutMs`, en cuyo caso devuelve `null` — ahí sí es
 * un error real, no una tx que tardó en confirmar.
 */
export async function esperarCondicion<T>(
  verificar: () => Promise<T | null>,
  opciones: { intervaloMs?: number; timeoutMs?: number } = {},
): Promise<T | null> {
  const intervaloMs = opciones.intervaloMs ?? 2000;
  const timeoutMs = opciones.timeoutMs ?? 25_000;
  const desde = Date.now();

  while (true) {
    const valor = await verificar();
    if (valor) return valor;
    if (Date.now() - desde > timeoutMs) return null;
    await new Promise((resolve) => setTimeout(resolve, intervaloMs));
  }
}
