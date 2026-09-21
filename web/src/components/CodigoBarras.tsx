/** Bytes crudos de un hash 0x..., en pares hexadecimales. */
function bytesDeHash(hash: string): number[] {
  const limpio = hash.startsWith("0x") ? hash.slice(2) : hash;
  const bytes: number[] = [];
  for (let i = 0; i < limpio.length; i += 2) {
    bytes.push(parseInt(limpio.slice(i, i + 2), 16));
  }
  return bytes;
}

/**
 * Codigo de barras del hash de terminos (docs/BRAND.md §9): los anchos
 * salen directo de los bytes del hash, en tinta. Si cambia una coma en los
 * terminos, cambia el hash y cambia el dibujo — es la forma visual de "esto
 * es exactamente lo que firmaste".
 */
export function CodigoBarras({
  hash,
  alto = 28,
}: {
  hash: string;
  alto?: number;
}) {
  const bytes = bytesDeHash(hash);
  const anchos = bytes.map((b) => 1 + (b % 4));
  const barras = anchos.reduce<{ x: number; w: number }[]>((acc, w) => {
    const previo = acc.length > 0 ? acc[acc.length - 1] : null;
    const x = previo ? previo.x + previo.w + 1 : 0;
    return [...acc, { x, w }];
  }, []);
  const ultima = barras[barras.length - 1];
  const total = ultima ? ultima.x + ultima.w : 0;

  return (
    <svg
      viewBox={`0 0 ${total} ${alto}`}
      width="100%"
      height={alto}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Código de barras del hash de términos ${hash}`}
    >
      {barras.map(({ x, w }, i) => (
        <rect key={i} x={x} y={0} width={w} height={alto} fill="var(--raw-ink)" />
      ))}
    </svg>
  );
}
