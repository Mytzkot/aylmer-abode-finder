## Findings

**Test rooms** — exactly one row matches `name ILIKE '%test%'`:
- `test2 amour room 2` ($754, Amour property) — id `c694742e-…`

**Bad price entries** (anything below $750 in the rooms table):
- `Bottled Water` ($1) — addon, no property
- `Housekeeping Fee` ($15) — addon, no property
- `Extra Guest` ($30) — addon, no property
- `5x5 Strorage unit — 5x5 storage spage` ($112) — addon, no property

These four rows have `property_id = NULL` and are clearly Square catalog items that were synced into `rooms` by mistake (the project also has a separate `addons` table). They're what's dragging the "from" price down to $50 and they appear as junk in the All Rooms grid.

After removing them, real room prices are **$750–$1100**. Nothing is above $1200, so the upper bound only needs trimming, not data fixes.

**Range display is hard-coded.** `src/routes/rooms.tsx` defines `PRICE_MIN = 50` and `PRICE_MAX = 1500` as constants — the slider/range labels do not come from data, so cleaning the table alone won't update the visible "$50–$1500/month" until we also touch the constants (or derive them).

**Property card "0 rooms available".** In `src/routes/properties.index.tsx` the grouping tries to match `room.address` substring against the static `PROPERTIES[].address` — but rooms in the DB don't have an `address` column; they have `property_id` (UUID). The matcher falls through, every property gets an empty array, and `PropertyCard` shows "0 rooms available". The fix is to join via `property_id` → `properties.slug` → static `PROPERTIES.id` (slugs already match: `102-amour`, `58-conrad`, `260-colline`).

## Plan

### 1. Delete junk rows from `rooms` (data change)
Single `DELETE` via the insert tool, removing 5 rows by id:
- `c694742e-…` (test2 amour room 2)
- `47640d0c-…` (Bottled Water)
- `a37d5640-…` (Housekeeping Fee)
- `afe8f2b4-…` (Extra Guest)
- `a519038f-…` (5x5 storage)

Also add a safety net so a future Square resync doesn't recreate them: filter `name ILIKE '%test%'` for the test row at the same time.

I'll note for you that the four addon-like rows were synced from Square into the wrong table. The `syncSquareCatalog` server function should eventually be updated to write services/fees into `public.addons` instead of `public.rooms` — out of scope for this change unless you ask.

### 2. Trim the rooms-page price range (frontend)
In `src/routes/rooms.tsx`:
- Change `PRICE_MIN = 50` → `750`
- Change `PRICE_MAX = 1500` → `1200`

This makes the slider label read "$750–$1200/month" and keeps a small upper buffer above the current $1100 max so future higher-priced rooms still fit.

### 3. Wire real per-property room counts (frontend)
In `src/routes/properties.index.tsx`:
- Fetch both `properties` (id, slug) and `rooms` (id, property_id, current_status) from Supabase.
- Build `slugById: Record<uuid, slug>` from the properties query.
- Group rooms by `slugById[room.property_id]`, which matches `PROPERTIES[].id` directly.
- Drop the address-substring matcher entirely.

No changes to `PropertyCard.tsx` are needed — it already renders `"{available} of {total} rooms available"` when `rooms.length > 0` and falls back to the single-line form otherwise. Once the grouping works, each card shows the real numbers (Amour ~10, Conrad ~7, Colline ~8). The "View rooms →" fallback isn't needed because the data is wired.

## Acceptance check

- DB: `SELECT count(*) FROM public.rooms WHERE base_rate < 750 OR name ILIKE '%test%'` → 0.
- `/rooms`: slider label reads `$750–$1200/month`; no addon rows in the grid.
- `/properties`: each of the three cards shows a non-zero "X of Y rooms available" line matching the per-property counts in `rooms`.

## Out of scope (mentioning, not doing)
- Moving Square fees/services out of `rooms` into the existing `addons` table and updating `syncSquareCatalog` accordingly.
- The 4th `properties` row (`162 Eddy Street`) has no rooms and is already hidden from `/rooms` via `HIDDEN_PROPERTY_SLUGS`; it will simply not appear in the static `/properties` grid either (the static list only has the three guest houses).
