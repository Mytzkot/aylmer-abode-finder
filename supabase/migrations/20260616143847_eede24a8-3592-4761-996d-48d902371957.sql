-- Revoke public access to Square internal identifier columns.
-- Server-side admin operations use the service_role key which bypasses
-- column grants, so syncSquareCatalog continues to work unchanged.

REVOKE SELECT (square_item_id, square_variation_id) ON public.rooms FROM anon, authenticated;
REVOKE SELECT (square_location_id) ON public.properties FROM anon, authenticated;

-- Keep service_role with full access (already granted via GRANT ALL).
GRANT SELECT (square_item_id, square_variation_id) ON public.rooms TO service_role;
GRANT SELECT (square_location_id) ON public.properties TO service_role;