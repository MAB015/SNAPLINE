import { keccak256, toBytes } from "viem";

/** Tipos de la pantalla de reparto. Sin dependencias de cadena: en D3 la
 *  maqueta es estatica y en D5 estos mismos tipos se llenan con datos reales. */

export type EstadoFirma = "firmado" | "pendiente";

export type Participante = {
  nombre: string;
  rol: string;
  direccion: `0x${string}`;
  /** Puntos base. Los cuatro participantes suman 10000 o el acuerdo no existe. */
  bps: number;
  firma: EstadoFirma;
};

export type Acuerdo = {
  id: string;
  proyecto: string;
  fecha: string;
  terminos: string;
  terminosHash: `0x${string}`;
  participantes: Participante[];
};

/** bps -> "40.00%". Nunca se redondea a entero: el acuerdo es al centesimo. */
export function formatearBps(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`;
}

/** 0x1234…cdef. La direccion completa vive en el atributo title. */
export function abreviarDireccion(direccion: string): string {
  return `${direccion.slice(0, 6)}…${direccion.slice(-4)}`;
}

export function sumaBps(participantes: Participante[]): number {
  return participantes.reduce((total, p) => total + p.bps, 0);
}

export function todasFirmadas(participantes: Participante[]): boolean {
  return participantes.every((p) => p.firma === "firmado");
}

/** Del texto de términos solo se guarda esto (docs/ARCHITECTURE.md §2, §4). */
export function calcularHashTerminos(texto: string): `0x${string}` {
  return keccak256(toBytes(texto));
}

/** Explorador de HSKChain Testnet, de deployments/hashkey-testnet.json. */
const EXPLORADOR_BASE = "https://testnet-explorer.hskchain.net";

export function urlExplorador(valor: string): string {
  const ruta = valor.length === 66 ? "tx" : "address";
  return `${EXPLORADOR_BASE}/${ruta}/${valor}`;
}

/** Color + trama de participante (docs/BRAND.md §6): se asignan por orden en
 *  el acuerdo, no por persona. Con mas de cuatro, el color se repite. */
export type TokenParticipante = "p1" | "p2" | "p3" | "p4";

export function tokenParticipante(indice: number): TokenParticipante {
  const tokens: TokenParticipante[] = ["p1", "p2", "p3", "p4"];
  return tokens[indice % tokens.length];
}

/** Hash simple y determinista de una direccion, para el identicon y para
 *  cualquier otro derivado visual que no necesite criptografia real. */
function hashDireccion(direccion: string): number {
  let hash = 0;
  for (let i = 0; i < direccion.length; i++) {
    hash = (hash * 31 + direccion.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Direccion de pool placeholder para la maqueta: determinista a partir de
 *  una semilla, no una direccion real. El bloque sellado de /acuerdo/[id]
 *  la usa mientras D5 no conecte el despliegue real; la pantalla ya avisa
 *  arriba que es una maqueta estatica. */
export function direccionSimulada(semilla: string): `0x${string}` {
  let hash = hashDireccion(semilla) >>> 0;
  let hex = "";
  while (hex.length < 40) {
    hash = (hash * 1103515245 + 12345) >>> 0;
    hex += hash.toString(16).padStart(8, "0");
  }
  return `0x${hex.slice(0, 40)}`;
}

/** Rejilla simetrica 5x5 del identicon (docs/BRAND.md §8): la direccion da
 *  la forma, el acuerdo da el color. Solo hacen falta 15 bits (5 filas x 3
 *  columnas unicas): las columnas 3 y 4 espejan a la 1 y 0. */
export function celdasIdenticon(direccion: string): boolean[][] {
  const hash = hashDireccion(direccion);
  const filas: boolean[][] = [];
  for (let fila = 0; fila < 5; fila++) {
    const mitad: boolean[] = [];
    for (let col = 0; col < 3; col++) {
      const bit = (hash >> (fila * 3 + col)) & 1;
      mitad.push(bit === 1);
    }
    filas.push([...mitad].reverse().concat(mitad.slice(1)));
  }
  return filas;
}

/** Datos falsos de docs/DEMO-SCRIPT.md. Se borran cuando entre el relay. */
export const ACUERDO_DE_MUESTRA: Acuerdo = {
  id: "0f3a9c21",
  proyecto: "Campaña Tropicana — video + identidad",
  fecha: "23 de septiembre de 2026",
  terminos:
    "El pago del cliente por la campaña se reparte entre los cuatro participantes en las proporciones de esta tabla, sobre cada monto que reciba el pool, sin descuentos previos. El reparto no se modifica una vez firmado: no hay altas, bajas ni cambios de porcentaje. Cada participante retira su parte cuando quiera; nadie puede retirar la de otro.",
  terminosHash:
    "0x7d2a4f1c8e5b93a06f4c1d8e2b7a95c3f0e6d4b8a1c9f2e7d5b3a0c6f8e4d1b2",
  participantes: [
    {
      nombre: "Mariana",
      rol: "Dirección creativa",
      direccion: "0x9A3fB2c7D14e8F60a5B3c9D2e7F18a4C6b0D5e83",
      bps: 4000,
      firma: "firmado",
    },
    {
      nombre: "Julián",
      rol: "Desarrollo",
      direccion: "0x4C7d1E9a0B85f36C2a7D4e1F98b0C53a6E2d7F41",
      bps: 2500,
      firma: "firmado",
    },
    {
      nombre: "Sofía",
      rol: "Ilustración",
      direccion: "0xE10b6A4c9F72d35B8e0C1a7D46f29B53c8A0e7D6",
      bps: 2000,
      firma: "firmado",
    },
    {
      nombre: "Andrés",
      rol: "Edición de video",
      direccion: "0x2B8f0D5a6C93e71A4d0B7c2E85f16D39a4C7b0E2",
      bps: 1500,
      firma: "pendiente",
    },
  ],
};

/** Segundo acuerdo de muestra: menos participantes y otro reparto, para ver
 *  la maqueta con datos distintos a los de docs/DEMO-SCRIPT.md sin escribir
 *  contra el relay todavia. */
export const OTRO_ACUERDO_DE_MUESTRA: Acuerdo = {
  id: "5c8e21af",
  proyecto: "Podcast Semilla — temporada 1",
  fecha: "30 de septiembre de 2026",
  terminos:
    "El pago de cada auspicio se reparte entre los tres participantes en las proporciones de esta tabla, sobre cada monto que reciba el pool, sin descuentos previos. El reparto no se modifica una vez firmado: no hay altas, bajas ni cambios de porcentaje. Cada participante retira su parte cuando quiera; nadie puede retirar la de otro.",
  terminosHash:
    "0x3f9c0a7d2e5b81f4c6a0d3e7b9f2c5a80e4d1b7c3f6a9e2d5b8c0f3a6d9e2b71",
  participantes: [
    {
      nombre: "Camila",
      rol: "Conducción y producción",
      direccion: "0x1F4a8C2e6B90d3F57a1C4e8B02d6F9a3C7e0B4d1",
      bps: 5000,
      firma: "firmado",
    },
    {
      nombre: "Tomás",
      rol: "Edición de audio",
      direccion: "0x6D0b3E7a1C4f80B25d9A6c3E7f0B4d8A1c5E9f2b",
      bps: 3000,
      firma: "firmado",
    },
    {
      nombre: "Renata",
      rol: "Difusión y redes",
      direccion: "0xA83c6F1e4B70D2a58c1F4b7E0a3D6c9F2b5E8a41",
      bps: 2000,
      firma: "pendiente",
    },
  ],
};

/** Acuerdos de muestra por id, para navegar a mas de una maqueta. Cualquier
 *  otro id sigue cayendo en `ACUERDO_DE_MUESTRA` (comportamiento previo). */
export const ACUERDOS_DE_MUESTRA: Record<string, Acuerdo> = {
  [ACUERDO_DE_MUESTRA.id]: ACUERDO_DE_MUESTRA,
  [OTRO_ACUERDO_DE_MUESTRA.id]: OTRO_ACUERDO_DE_MUESTRA,
};
