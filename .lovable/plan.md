## Redesign Footer — Black with Big ZORBA Wordmark

Match the Lodgify-style reference: dark footer, four columns of links, socials inline, and a giant "ZORBA" wordmark across the bottom.

### Changes to `src/components/Footer.tsx` (only file touched)

Replace the current cream footer with a single dark section:

1. **Background**: solid black (`bg-ink` / near-black), cream text, brand-blue accents on hover.

2. **Top row — four link columns** (stacked on mobile, 4 cols on md+):
   - **Zorba** — Home, About Us, FAQ, Newcomer Guide, Transit
   - **Stay** — All Rooms, Properties (102 Amour, 58 Conrad, 260 Colline), Daily/Weekly Booking
   - **Apply** — Apply Now, Contact, How it works
   - **Support & Contact** — Phone (+1 343 987 4565), Email (zorbagraphic@gmail.com), WhatsApp, Messenger, Address line (Aylmer-Gatineau, QC)

3. **Divider + socials row**: existing 6 social pills (WhatsApp, Phone, Facebook, YouTube, Instagram, Messenger) aligned left; language note / copyright aligned right.

4. **Giant ZORBA wordmark**: full-width display text at the bottom in Fraunces 900, brand-blue (`text-brand`), clamped to viewport (`text-[18vw]`), tight leading, slightly clipped baseline — same vibe as "Lodgify" in the reference.

5. Keep the existing `pb-32 md:pb-24` so the floating contact bar doesn't overlap.

6. All link text stays bilingual via the existing `<T>` wrapper.

### Out of scope
- No new routes, data, or business logic.
- No changes to `Header`, `FloatingContactBar`, or page content.
- No new assets (the giant "ZORBA" is rendered as text, not an image).

### Visual sketch

```text
┌────────────────────────────────────────────────────────────┐
│ ZORBA          STAY            APPLY          SUPPORT      │
│ Home           All Rooms       Apply Now      +1 343…      │
│ About          102 Amour       Contact        email@…      │
│ FAQ            58 Conrad       How it works   WhatsApp     │
│ Newcomer       260 Colline                    Aylmer, QC   │
│ Transit        Book Daily                                  │
│────────────────────────────────────────────────────────────│
│ [ws][ph][fb][yt][ig][msg]              © 2026 Zorba ·  EN  │
│                                                            │
│  ZZZZZ  OOOOO  RRRRR  BBBBB  AAAAA   ← giant wordmark     │
└────────────────────────────────────────────────────────────┘
```
