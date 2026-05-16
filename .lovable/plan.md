
## What's broken right now

Looking at the database I found the real cause behind almost everything you reported:

- The `rooms` table has **33 rows but only ~22 are real** — every room exists twice: an old placeholder row (slug `room-1`, no images) AND the Square‑synced row (slug `102-amour-amour-room-1-chambre-1`, with images). That's why "Amour Room 1", "Amour Room 2", "test2 amour room 2" etc. show wrong/missing pictures — they're the empty placeholders falling back to the generic property photo.
- Clicking those placeholder rows opens a near‑empty detail page (no images, no description) — that's the "doesn't open to the page description and pictures" you're seeing.
- The Square sync currently **skips** any item that doesn't match a property name, which is why Bottled Water and Extra Guest never appeared.
- Eddy property exists in the DB so it shows in the sidebar even though it has zero rooms.

## Plan

### 1. Clean up duplicate / placeholder rooms (DB migration)
- Delete the old placeholder rows (the ones with simple slugs like `room-1`…`room-7` and no `square_variation_id` and no images) for Amour, Colline, Conrad.
- Delete the stray `test2 amour room 2` and the generic top‑level `AMOUR` item row.
- Result: each room appears exactly once, with the correct Square photos.

### 2. Hide Eddy
- Hide the Eddy property from the sidebar Properties list (filter it out in the UI — keep the row in DB so future use stays open).

### 3. Rework /rooms page (Square‑style shop)
- Rename "All Items" → **"All Rooms"**.
- Keep sidebar: All Rooms · Rentals · Properties (Amour / Colline / Conrad) · Price range (Min/Max) · Availability.
- Sort dropdown: keep only **Newest**, **Price (High – Low)**, **Price (Low – High)**. Drop Popularity / A‑Z / Z‑A. Default = Newest.
- Make text darker (bump `text-ink/80` and `text-ink/70` to solid `text-ink`, sidebar labels to `font-semibold text-ink`).
- Match the screenshot's sort control look (small rounded outlined select, right‑aligned, results count on the left).

### 4. Include non‑room catalog items (Water, Extra Guest, etc.)
- Update the Square sync (`syncSquareCatalog`) so items that don't match a property are still stored — with `property_id = null` — instead of being skipped.
- /rooms page shows them under **All Rooms** (and a new "Extras" sidebar entry). They won't appear under any specific property.
- After the code change, re‑run the sync (Admin → Sync Square) to pull Water + Extra Guest in.

### 5. Redesign the room detail page (`/properties/$id/$roomSlug`) to match the Square layout
Reference: the Conrad Room 1 screenshot you sent.
- Two‑column layout (desktop): left = vertical thumbnail strip + large main image with chevrons; right = title, price (CAD$xxx.xx/month), short status, collapsible **Description** panel containing the bilingual ROOM FEATURES / CARACTÉRISTIQUES + SHARED & AMENITIES / SERVICES ET ÉQUIPEMENTS PARTAGÉS blocks (same content currently on the page, just inside the description card).
- Below: **Similar Items** carousel — other rooms from the same property, card style matching the screenshot.
- Keep the existing Book / Apply CTAs and YouTube / Map / Airbnb icon row underneath.
- Pull `description_en` / `description_fr` from the room row when present (Square sync already stores it) and fall back to the static bilingual lists otherwise.

### 6. Verify
- Refresh /rooms → expect ~13 rooms + 2 extras, each with the right photo, no Eddy in sidebar, dropdown shows 3 sort options.
- Click any room → opens the new Square‑style detail page with all images and description.

## Technical notes (for me)

- Migration deletes rows where `square_variation_id IS NULL` AND `image_urls IS NULL` (safe — those are the placeholders).
- `syncSquareCatalog`: change `if (!property) continue;` to allow `property_id: null` rows, and use a deterministic slug (`extras-<itemName>`) when no property.
- /rooms filter: add `category === "extras"` branch → `property_id IS NULL`.
- Detail page: reuse existing route `properties.$id.$roomSlug.tsx`; restructure JSX into the 2‑column grid; add "Similar Items" query (same property_id, exclude current room, limit 4).

Want me to go ahead and build this?
