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
