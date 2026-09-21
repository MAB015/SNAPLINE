# web

Next.js 16 (App Router) + TypeScript + Tailwind 4 + Privy + viem/wagmi +
Supabase. Sistema visual completo (Acta Viva) y borrador de acuerdo
funcionando contra el relay; `/acuerdo/[id]` y `/pool/[dir]` todavía corren
con datos falsos — se conectan a la cadena en D5.

```bash
npm install
cp ../.env.example .env.local   # completar Privy, Supabase, direcciones y DEPLOYER_PRIVATE_KEY
npm run dev
```

- `/` — índice de lo que hay dibujado.
- `/nuevo` — crear un acuerdo: participantes, bps, términos; guarda el
  borrador en el relay y genera el link para compartir. Requiere
  `NEXT_PUBLIC_PRIVY_APP_ID`.
- `/acuerdo/[id]` — pantalla de reparto, con datos falsos hasta D5.
  `?firmado=1` fuerza el acuerdo completo para ver el snap de la línea.

El sistema visual vive en `src/app/globals.css` como tokens de Tailwind:
colores por superficie (papel/cadena) y por tema (claro/oscuro), resueltos
en cascada vía `data-theme`/`data-surface`; tres familias tipográficas y la
escala cerrada de `docs/BRAND.md`. La escala de radios y la de sombras se
borran a propósito, para que no haya atajo alrededor de las reglas duras.

El goteo de gas (`src/app/api/goteo/route.ts`) necesita
`DEPLOYER_PRIVATE_KEY` en `.env.local`, además de en `contracts/.env`: son
archivos de build distintos.

Ver `docs/ARCHITECTURE.md` sección 3 para las rutas y `docs/BRAND.md` para el
sistema visual.
