## Footer redesign — Porkbun-style layout, Zorba colors

Rework `src/components/Footer.tsx` to match the reference screenshot's structure while keeping the current dark navy (`bg-surface-dark`) background, white text, and brand accent colors.

### New layout (single row, 4 columns on desktop)

```text
┌─────────────────────────┬──────────────┬──────────────┬──────────────┐
│ [logo] Zorba Rentals    │ STAY         │ SUPPORT      │ OUR COMPANY  │
│                         │ All Rooms    │ Contact      │ About Us     │
│ Short tagline about     │ 102 Amour    │ FAQ          │ Newcomer     │
│ Zorba (1 paragraph).    │ 58 Conrad    │ How it works │ Transit      │
│                         │ 260 Colline  │ WhatsApp     │ Apply Now    │
│ 📍 Aylmer-Gatineau, QC  │ Booking Page │ Phone        │              │
│ 📞 +1 343 202 5460      │ Pay Online   │ Email        │ PAYMENTS     │
│ ✉  zorbagraphic@…       │ Tenant Portal│              │ Payment Methods → │
│                         │              │              │ (link only)  │
│                         │              │              │              │
│ [social icon row]       │              │              │              │
└─────────────────────────┴──────────────┴──────────────┴──────────────┘
─────────────────────────────────────────────────────────────────────────
© 2026 Zorba Rentals · Aylmer-Gatineau, QC
```

### Key changes vs current footer

1. **Small logo at top-left of column 1**, inline with the "Zorba Rentals" wordmark — replaces the giant bottom logo badge entirely (delete the `max-w-[220px]` white badge block).
2. **Single tight column spacing** — link rows use consistent `py-1` (no extra gaps between sections inside a column). Columns sit side-by-side on desktop, stack on mobile.
3. **Socials moved up** under the contact info in column 1 (like Porkbun's icon row under the address block), instead of in their own bordered row.
4. **Payment Methods becomes a single link**, not 8 chips. Clicking it opens a small dialog/popover listing: Visa, Mastercard, Amex, Stripe, PayPal, e-Transfer, Apple Pay, Google Pay. (Uses existing shadcn `Dialog`.)
5. **Map section stays** below the column grid, full width, same Leaflet `LocationsMap`.
6. **Bottom bar**: single thin divider + copyright line only (no separate socials row — they're already in column 1).

### Column contents

- **Col 1 — Brand**: small logo + "Zorba Rentals" heading, 1-line tagline (`t.home.subtitle` or similar short translated string), address / phone / email rows with icons, then the 5 social icon circles (WhatsApp, Phone, Messenger, Facebook page, YouTube, Instagram — keeping the recent Messenger vs Facebook split).
- **Col 2 — Stay**: All Rooms, the 3 property addresses, Booking Page, Pay Online, Tenant Portal.
- **Col 3 — Support**: Contact, FAQ, How it works, WhatsApp, Phone, Email.
- **Col 4 — Our Company**: About Us, Newcomer Guide, Transit, Apply Now + a "PAYMENTS" subheading with the single "Payment Methods" trigger link.

### Files touched

- `src/components/Footer.tsx` — full restructure of the JSX (single file, no other changes).
- No data, route, or i18n changes required. Existing `CONTACT`, `PROPERTIES`, `T` translation wrapper, and `LocationsMap` are reused.
