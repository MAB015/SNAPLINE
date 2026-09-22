"use client";

import { ContadorNumero } from "@/components/ContadorNumero";

/**
 * `ContadorNumero` es un componente de cliente (usa GSAP); recibe
 * `formatear` como función. `page.tsx` ("/") es un componente de servidor,
 * y una función no se puede pasar de servidor a cliente como prop — mismo
 * motivo y mismo patrón que `ContadorTests.tsx`, calcado sin lógica nueva.
 */
function formatearCasosFuzz(n: number): string {
  return `${Math.round(n)} casos`;
}

export function ContadorFuzz({ valor }: { valor: number }) {
  return <ContadorNumero valor={valor} formatear={formatearCasosFuzz} className="mono" />;
}
