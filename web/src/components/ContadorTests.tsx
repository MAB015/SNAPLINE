"use client";

import { ContadorNumero } from "@/components/ContadorNumero";

/**
 * `ContadorNumero` es un componente de cliente (usa GSAP); recibe
 * `formatear` como función. `page.tsx` ("/") es un componente de servidor,
 * y una función no se puede pasar de servidor a cliente como prop — de ahí
 * este envoltorio chico, que define el formateador del lado del cliente y
 * solo expone un `valor` numérico (serializable) hacia afuera.
 */
function formatearTests(n: number): string {
  return `${Math.round(n)} tests`;
}

export function ContadorTests({ valor }: { valor: number }) {
  return <ContadorNumero valor={valor} formatear={formatearTests} className="mono" />;
}
