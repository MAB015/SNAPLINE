# web

Next.js 16 (App Router) + TypeScript + Tailwind 4. Privy y viem/wagmi entran
en D4; hoy esto es solo el sistema visual y la maqueta de la pantalla de
reparto.

```bash
npm install
npm run dev
```

- `/` — índice de lo que hay dibujado.
- `/acuerdo/[id]` — pantalla de reparto con datos falsos.
  `?firmado=1` fuerza el acuerdo completo para ver el snap de la línea.

El sistema visual vive en `src/app/globals.css` como tokens de Tailwind:
seis colores, tres familias y la escala cerrada de `docs/BRAND.md`. La escala
de radios y la de sombras se borran a propósito, para que no haya atajo
alrededor de las reglas duras.

Ver `docs/ARCHITECTURE.md` sección 3 para las rutas y `docs/BRAND.md` para el
sistema visual.
