# Footer + Floating Buttons Cleanup

## 1. Remove the floating WhatsApp button

Keep only the chatbot bubble floating on the right edge. Delete `<FloatingContactBar />` from `src/routes/__root.tsx` so just `<FaqChatbot />` renders. (WhatsApp is still reachable from the Connect column and the social row in the footer.)

## 2. Remove the "1" at the bottom of the page

That "1" is the visitor counter rendering "👁 1 visitors" in the navy bottom bar. Remove the `<VisitorCount />` element (and its component) from the bottom bar in `src/components/Footer.tsx`. The bottom bar then reads: `zorbaco.com · Website made with love ♥`.

## 3. Fix the mobile footer — no broken word spacing

On a 322px viewport the current footer wraps awkwardly (big gaps between words, link text breaking mid-phrase, bottom bar misaligned). Tighten it:

- **Container padding**: reduce `px-6 sm:px-8` to `px-4 sm:px-6` so columns aren't squeezed.
- **Link text**: drop mobile size from `text-[15px] md:text-[16px]` to `text-[14px] md:text-[16px]`; keep `leading-tight`; add `break-words` so long items (emails, phone) don't force horizontal stretching.
- **IconLink rows**: remove `truncate` on the label span (it was clipping). Allow the text to wrap naturally under the icon row by switching to `items-start` and `min-w-0` on the span.
- **Column headings**: keep coral STAY/COMPANY/CONNECT, unchanged.
- **Bottom bar**: on mobile stack the two blocks (`flex-col` with `items-center text-center`), tighter `gap-2`, smaller `text-[12px]` so the single line "zorbaco.com · Website made with love ♥" fits without weird inter-word gaps.
- **Designer credit strip**: reduce mobile padding from `py-9 md:py-10` to `py-6 md:py-10` and add `px-4` so the sentence wraps cleanly instead of justifying.
- **Footer wrapper**: lower mobile bottom padding from `pb-16` to `pb-10` (no longer need clearance for two floating buttons — only the chatbot remains, which sits mid-screen).

## 4. Quick pass on all pages

After the changes, spot-check `/`, `/rooms`, `/properties`, `/book`, `/faq`, `/about`, `/pay`, `/apply` at 322px to confirm:
- No horizontal scroll (already covered by `overflow-x: hidden` on html/body).
- Footer renders identically and cleanly on every page (it lives in `__root.tsx`, so one fix covers all).
- Only the chatbot bubble floats; nothing covers footer text.

## Files touched

- `src/routes/__root.tsx` — remove `FloatingContactBar` import + usage.
- `src/components/Footer.tsx` — remove `VisitorCount`, tighten mobile sizes/padding, fix bottom bar stacking, fix IconLink truncation.
- `src/components/FloatingContactBar.tsx` — leave file in place but unused (safe to keep, or delete in implementation step).
