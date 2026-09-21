import {
  encodeAbiParameters,
  encodePacked,
  keccak256,
  recoverTypedDataAddress,
  toBytes,
  type Address,
  type Hex,
  type PublicClient,
} from "viem";
import type { BorradorPayload } from "./supabase";

/**
 * Firma EIP-712 y lectura del `SplitPoolFactory` (D5, docs/ARCHITECTURE.md
 * §2 y §4). Direccion y bloque de despliegue de
 * `deployments/hashkey-testnet.json`: se copian como literales, igual que en
 * `web/src/lib/wagmi.ts`, porque ese archivo vive fuera de la raiz de build
 * de Next y no sobrevive el despliegue en Vercel.
 */
export const FACTORY_ADDRESS: Address = "0x2da2f4E4577f8c8090b08dff8A2A288fd2dfa559";
export const FACTORY_DEPLOY_BLOCK = BigInt(33_379_462);

const CHAIN_ID = 133;

export const splitPoolFactoryAbi = [
  {
    type: "function",
    name: "createPool",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "agreement",
        type: "tuple",
        components: [
          { name: "participants", type: "address[]" },
          { name: "bps", type: "uint16[]" },
          { name: "termsHash", type: "bytes32" },
          { name: "salt", type: "bytes32" },
        ],
      },
      { name: "signatures", type: "bytes[]" },
    ],
    outputs: [{ name: "pool", type: "address" }],
  },
  {
    type: "function",
    name: "consumed",
    stateMutability: "view",
    inputs: [{ name: "", type: "bytes32" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "event",
    name: "PoolCreated",
    inputs: [
      { name: "pool", type: "address", indexed: true },
      { name: "structHash", type: "bytes32", indexed: true },
    ],
  },
] as const;

/** Dominio de `SplitPoolFactory.sol`: ata la firma a esta cadena y a este
 *  contrato exactos. */
export const dominioAcuerdo = {
  name: "SNAPLINE",
  version: "1",
  chainId: CHAIN_ID,
  verifyingContract: FACTORY_ADDRESS,
} as const;

/** Mismos cuatro campos, mismo orden, que `SplitPoolFactory.Agreement`. */
export const tiposAcuerdo = {
  Agreement: [
    { name: "participants", type: "address[]" },
    { name: "bps", type: "uint16[]" },
    { name: "termsHash", type: "bytes32" },
    { name: "salt", type: "bytes32" },
  ],
} as const;

export type Agreement = {
  participants: Address[];
  bps: number[];
  termsHash: Hex;
  salt: Hex;
};

/** El orden de `agreement_json.participantes` es el que ya se uso para
 *  guardar el borrador (`web/src/app/nuevo/page.tsx`) y es el mismo que
 *  importa en el contrato: firmas y `createPool` tienen que respetarlo. */
export function agreementDesdeBorrador(payload: BorradorPayload): Agreement {
  return {
    participants: payload.participantes.map((p) => p.direccion),
    bps: payload.participantes.map((p) => p.bps),
    termsHash: payload.terminosHash,
    salt: payload.salt,
  };
}

function mensajeAcuerdo(agreement: Agreement) {
  return {
    participants: agreement.participants,
    bps: agreement.bps,
    termsHash: agreement.termsHash,
    salt: agreement.salt,
  };
}

const AGREEMENT_TYPEHASH = keccak256(
  toBytes("Agreement(address[] participants,uint16[] bps,bytes32 termsHash,bytes32 salt)"),
);

/**
 * Igual al `structHash` que calcula `SplitPoolFactory.sol`. Es la mitad "de
 * adentro" del digest EIP-712 (sin el domain separator) y es la clave que el
 * contrato usa tanto para `consumed` como para el topico indexado de
 * `PoolCreated` — con esto alcanza para reconstruir "¿ya se desplego?" leyendo
 * la cadena, sin una tabla nueva en Supabase (limite duro del proyecto).
 */
export function calcularStructHash(agreement: Agreement): Hex {
  const participantsHash = keccak256(encodePacked(["address[]"], [agreement.participants]));
  const bpsHash = keccak256(encodePacked(["uint16[]"], [agreement.bps]));
  return keccak256(
    encodeAbiParameters(
      [{ type: "bytes32" }, { type: "bytes32" }, { type: "bytes32" }, { type: "bytes32" }, { type: "bytes32" }],
      [AGREEMENT_TYPEHASH, participantsHash, bpsHash, agreement.termsHash, agreement.salt],
    ),
  );
}

/** Recupera quien firmo, puramente en el cliente (sin red): solo ECDSA de
 *  cuenta externa, que es lo unico que soporta el contrato (ver
 *  docs/THREAT-MODEL.md §5.4). */
export function recuperarFirmante(agreement: Agreement, signature: Hex): Promise<Address> {
  return recoverTypedDataAddress({
    domain: dominioAcuerdo,
    types: tiposAcuerdo,
    primaryType: "Agreement",
    message: mensajeAcuerdo(agreement),
    signature,
  });
}

/** `true` si el paquete de firmas de este acuerdo ya desplego un pool.
 *  Fuente de verdad on-chain: siempre se consulta antes de firmar/desplegar
 *  (D5 tarea 6, evitar despliegue doble). */
export function leerConsumido(publicClient: PublicClient, structHash: Hex): Promise<boolean> {
  return publicClient.readContract({
    address: FACTORY_ADDRESS,
    abi: splitPoolFactoryAbi,
    functionName: "consumed",
    args: [structHash],
  });
}

/** Direccion del pool ya desplegado para este `structHash`, buscando el
 *  evento `PoolCreated` desde el bloque de despliegue del factory. `null` si
 *  todavia no existe. */
export async function buscarPoolDesplegado(
  publicClient: PublicClient,
  structHash: Hex,
): Promise<Address | null> {
  const logs = await publicClient.getContractEvents({
    address: FACTORY_ADDRESS,
    abi: splitPoolFactoryAbi,
    eventName: "PoolCreated",
    args: { structHash },
    fromBlock: FACTORY_DEPLOY_BLOCK,
    toBlock: "latest",
  });
  return logs[0]?.args.pool ?? null;
}
