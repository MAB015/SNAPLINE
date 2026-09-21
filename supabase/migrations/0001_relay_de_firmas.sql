-- Relay de firmas — SNAPLINE
--
-- Dos tablas, nada mas. Ver docs/ARCHITECTURE.md seccion 4.
--
-- El relay transporta firmas y muestra un borrador. No altera el acuerdo, no
-- custodia fondos y no firma por nadie: la verificacion ocurre en cadena.
-- Todo lo de aqui se accede con la clave anonima desde el navegador, asi que
-- el modelo es "publico salvo lo que este prohibido".

create table public.drafts (
  id           uuid        primary key default gen_random_uuid(),
  agreement_json jsonb     not null,
  terms_text   text        not null,
  created_by   text        not null,
  created_at   timestamptz not null default now(),
  constraint drafts_created_by_es_direccion
    check (created_by ~ '^0x[0-9a-f]{40}$')
);

-- Sin unicidad por (draft_id, signer): cualquiera con el id del borrador puede
-- insertar una firma basura a nombre de otro, y una restriccion unica dejaria
-- ese hueco ocupado para siempre. Se aceptan varias filas por firmante y el
-- cliente se queda con la que verifica.
create table public.signatures (
  id         uuid        primary key default gen_random_uuid(),
  draft_id   uuid        not null references public.drafts (id) on delete restrict,
  signer     text        not null,
  signature  text        not null,
  signed_at  timestamptz not null default now(),
  constraint signatures_signer_es_direccion
    check (signer ~ '^0x[0-9a-f]{40}$'),
  constraint signatures_es_ecdsa
    check (signature ~ '^0x[0-9a-f]{130}$')
);

create index signatures_draft_id_idx on public.signatures (draft_id);

alter table public.drafts     enable row level security;
alter table public.signatures enable row level security;

-- Insertar: si. Cualquiera arma un borrador o aporta una firma.
create policy drafts_insert_publico on public.drafts
  for insert to anon, authenticated with check (true);

create policy signatures_insert_publico on public.signatures
  for insert to anon, authenticated with check (true);

-- Leer: no directamente. Sin politica de select, una clave anonima no puede
-- listar todos los borradores. Se lee por id a traves de las funciones de
-- abajo, que es lo que hace el link para compartir.
--
-- Modificar y borrar: nunca. No hay politica y tampoco privilegio. Un borrador
-- es inmutable por construccion; si cambiara, el structHash cambia y el
-- contrato rechaza todas las firmas ya recogidas.
revoke update, delete on public.drafts     from anon, authenticated;
revoke update, delete on public.signatures from anon, authenticated;

create function public.get_draft(p_id uuid)
returns table (
  id uuid,
  agreement_json jsonb,
  terms_text text,
  created_by text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select d.id, d.agreement_json, d.terms_text, d.created_by, d.created_at
  from public.drafts d
  where d.id = p_id;
$$;

create function public.get_signatures(p_draft_id uuid)
returns table (
  id uuid,
  draft_id uuid,
  signer text,
  signature text,
  signed_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.draft_id, s.signer, s.signature, s.signed_at
  from public.signatures s
  where s.draft_id = p_draft_id
  order by s.signed_at;
$$;

revoke execute on function public.get_draft(uuid)      from public;
revoke execute on function public.get_signatures(uuid) from public;
grant  execute on function public.get_draft(uuid)      to anon, authenticated;
grant  execute on function public.get_signatures(uuid) to anon, authenticated;
