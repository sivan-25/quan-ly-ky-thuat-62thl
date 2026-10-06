-- Trigger functions should not be directly callable through PostgREST RPC.
-- The inventory archive guard continues to execute through its table trigger.
revoke execute on function public.guard_inventory_material_archive() from public;
revoke execute on function public.guard_inventory_material_archive() from anon;
revoke execute on function public.guard_inventory_material_archive() from authenticated;
