## Add Reset Filters button to desktop filter bar

**File:** `src/routes/rooms.tsx`

**Change:** Add a "Reset" button to the desktop filter bar (`FiltersPanel`), aligned to the right of the existing filter row. Clicking it calls the already-defined `resetFilters()` (resets location to "all", stayType to "any", price range to [50, 1500], and availOnly to false).

**Details:**
- Append a new flex item at the end of `FiltersPanel` containing a button styled to match the existing outline buttons (border `border-ink/25`, font-bold, rounded-lg, padded to align with the form controls' bottom edge).
- Wrap label in `<T>Reset Filters</T>` so it picks up the translation system.
- Only visible on desktop where the full bar shows; mobile drawer already has its own Reset button — no change there.

No other files touched.