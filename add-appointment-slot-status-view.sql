-- appointments RLS currently restricts SELECT to a user's own rows (confirmed by
-- direct testing: an authenticated non-admin user querying appointments only ever
-- gets back rows where user_email matches their own login, even filtering explicitly
-- by date/status). That means the booking calendar has never been able to see
-- OTHER users' confirmed/pending appointments -- so slots that are actually taken
-- still show as open (blue) to everyone except the person who booked them, and two
-- different users could book the exact same slot.
--
-- Fix: expose only the non-personal scheduling fields (no name/email/notes) through
-- a view. Views run with the privileges of their owner by default (not the querying
-- user's), so this bypasses the underlying per-user RLS restriction without loosening
-- it or leaking any personal data through a broader table-level policy.

create or replace view public.appointment_slot_status as
select date, start_time, end_time, status
from public.appointments
where status in ('pending', 'confirmed');

grant select on public.appointment_slot_status to anon, authenticated;
