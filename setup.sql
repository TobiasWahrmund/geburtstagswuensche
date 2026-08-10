-- ============================================================
-- SUPABASE SETUP FÜR TOBIS GEBURTSTAGSWÜNSCHE
-- Im Supabase Dashboard unter SQL Editor komplett ausführen.
-- ============================================================

create table if not exists public.gift_reservations (
  gift_id text primary key,
  reserved_at timestamptz not null default now()
);

alter table public.gift_reservations enable row level security;

-- Jeder darf sehen, WELCHE Wünsche reserviert sind.
-- Es werden bewusst keine Namen oder sonstigen personenbezogenen
-- Daten gespeichert.
drop policy if exists "Public can view reserved gifts" on public.gift_reservations;
create policy "Public can view reserved gifts"
on public.gift_reservations
for select
to anon, authenticated
using (true);

-- Direkte INSERT/DELETE/UPDATE-Rechte werden absichtlich NICHT
-- vergeben. Reservieren passiert ausschließlich über die Funktion.
revoke insert, update, delete on public.gift_reservations from anon, authenticated;

-- Atomare Reservierung:
-- Wenn zwei Personen gleichzeitig klicken, kann nur eine gewinnen,
-- weil gift_id der Primary Key ist.
create or replace function public.reserve_gift(
  p_gift_id text,
  p_action text default 'reserve'
)
returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_action <> 'reserve' then
    return json_build_object('status', 'invalid_action');
  end if;

  if p_gift_id is null or length(trim(p_gift_id)) = 0 then
    return json_build_object('status', 'invalid_gift');
  end if;

  begin
    insert into public.gift_reservations (gift_id)
    values (trim(p_gift_id));

    return json_build_object('status', 'reserved');

  exception
    when unique_violation then
      return json_build_object('status', 'already_reserved');
  end;
end;
$$;

revoke all on function public.reserve_gift(text, text) from public;
grant execute on function public.reserve_gift(text, text) to anon, authenticated;

-- Optional: alte Test-/Reservierungen lassen sich später im Table Editor
-- manuell löschen. Für die öffentliche Seite ist kein DELETE-Endpunkt nötig.
