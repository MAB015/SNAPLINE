# SNAPLINE

**Acuerdos de reparto de ingresos por proyecto, para equipos distribuidos.**

Un grupo define quién se queda con qué porcentaje y bajo qué términos. Todos
firman. En el momento de la firma se despliega el pool de cobro de ese
proyecto, con saldo cero. Esa dirección queda como el destino acordado. El día
que llegue dinero, el reparto ya es automático y nadie decide nada.

El nombre viene de la cuerda entizada que los constructores tensan y sueltan
de golpe para marcar una línea recta y exacta. La firma es ese golpe: desde
ahí el reparto queda marcado y ya no se discute.

---

> ### ⚠ Estado: prototipo de hackathon
>
> Código escrito en diez días por una persona para el **EAG Global
> Buildathon** (cierre: 1 de octubre de 2026). Desplegado en **Base Sepolia**,
> sin auditar. **No debe usarse con dinero real.**
>
> **La salida a pesos colombianos está simulada.** No mueve dinero y no habla
> con ningún banco. Está marcada como simulada dentro de la propia interfaz.
> Todo lo demás —contratos, firmas, despliegue, pagos, retiros— es real contra
> una testnet real.

---

## Cómo funciona

1. **Se define el acuerdo.** Participantes, porcentajes en puntos básicos con
   suma exacta de 10000, y términos. Del texto solo se guarda el hash.
2. **Todos firman** con EIP-712 fuera de cadena, desde su propio dispositivo.
3. **El snap.** Con la última firma, una sola transacción las agrupa y
   despliega el pool. Si falta una firma, el pool no existe.
4. **El cliente paga** a la dirección del pool, con cuenta o sin ella.
5. **Cada quien retira** su parte cuando quiera. Nadie aprueba nada.
6. **Quien no quiera saber de cripto** saca su parte a pesos *(simulado)*.

Quien nunca ha tocado una wallet entra con su correo y obtiene una dirección
sin ver una frase semilla.

## Estado del proyecto

Ver [`STATUS.md`](STATUS.md) para el estado por área,
[`TASKS.md`](TASKS.md) para lo pendiente y
[`DECISIONS.md`](DECISIONS.md) para el porqué de cada decisión.

## Documentación

| Documento | Qué contiene |
|---|---|
| [`docs/PRD.md`](docs/PRD.md) | Problema, usuarios, alcance del MVP, qué queda fuera y por qué |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Contratos, web, relay de firmas y dónde está exactamente la frontera del mock |
| [`docs/THREAT-MODEL.md`](docs/THREAT-MODEL.md) | Supuestos, vectores, mitigaciones y **lo que no está mitigado** |
| [`docs/SCOPE-PLAN.md`](docs/SCOPE-PLAN.md) | Plan día por día hasta el 1 de octubre, con puntos de corte |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Mejoras futuras en tres horizontes, cada una con su porqué |
| [`docs/BRAND.md`](docs/BRAND.md) | Dirección visual y sistema de diseño |
| [`docs/DEMO-SCRIPT.md`](docs/DEMO-SCRIPT.md) | Guion del video de 3 minutos, plano por plano |
| [`docs/PITCH.md`](docs/PITCH.md) | El argumento escrito, con las limitaciones declaradas |
| [`CLAUDE.md`](CLAUDE.md) | Reglas de trabajo: áreas, convención de commits, regla de simplicidad |

## Estructura

```
contracts/    Solidity + Foundry. SplitPool, SplitPoolFactory, MockUSDT
web/          Next.js (App Router), TypeScript, Tailwind, viem/wagmi, Privy
deployments/  Direcciones desplegadas por cadena, para verificar en el explorador
docs/         Documentación del proyecto
```

## Cómo correrlo

> Pendiente hasta que exista código. Ver `TASKS.md`.

Requisitos previstos: Node 20+, una cuenta de [Privy](https://privy.io) y un
proyecto de [Supabase](https://supabase.com) (gratuitos). Copiar
`.env.example` y rellenar.

## Direcciones desplegadas

> Pendiente. Aparecerán en [`deployments/base-sepolia.json`](deployments/) y
> verificadas en BaseScan.

## Lo que NO hace, a propósito

No renegocia porcentajes, no resuelve disputas, no maneja salidas a mitad de
proyecto, no tiene gobernanza. Un acuerdo que se puede cambiar es un acuerdo
que hay que volver a discutir, y todo el valor de SNAPLINE está en que el
reparto deje de ser discutible. Cada pieza está en el roadmap con su
justificación.

## Licencia

MIT. Ver [`LICENSE`](LICENSE).
