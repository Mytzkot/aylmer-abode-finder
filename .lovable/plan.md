## Shrink and left-align the footer logo badge

In `src/components/Footer.tsx`, the giant Zorba logo at the bottom currently sits in a white badge that spans up to 1100px wide and is centered.

**Change:**
- Replace `flex justify-center` with left alignment (drop the centering, add left padding consistent with the footer's `max-w-6xl` content).
- Shrink the white badge from `max-w-[1100px]` with `px-8 py-6 md:px-12 md:py-10` down to roughly `max-w-[260px]` with tighter padding (`px-5 py-3`).
- Keep the same white rounded badge styling and the logo image, just smaller and aligned left within the footer's content column.

No other files touched.
