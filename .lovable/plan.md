# Mobile QA + fix footer spacing + track down the stray "1"

## 1. Fix the messy mobile footer spacing (root cause found)

`src/styles.css` has a global rule:

```css
button, a { min-height: 44px; }
```

This is meant to give nav/CTA controls a comfortable tap target, but it applies to **every** link in the footer too. With `space-y-2.5` on the `<ul>` already adding gap, each link row is then padded to 44px tall — that's why the STAY / COMPANY / CONNECT lists look airy and "spaced out between words" on mobile.

**Fix:** in `src/styles.css`, scope the rule so it only enforces tap-targets on actual interactive controls, not text links inside dense lists. Replace the blanket selector with `.touch-min` (already used on the buttons that need it) and drop the global `button, a { min-height: 44px }`. Header / drawer buttons already set their own height via padding + `touch-min`. Then in `Footer.tsx`, tighten the link lists from `space-y-2.5` to `space-y-1` so the rows pack neatly under each column header.

Net effect: footer columns become compact paragraph-style link stacks instead of widely spaced rows. CTAs and nav buttons keep their tap size because of their existing `py-2`/`py-3` padding.

## 2. The stray "1" at the bottom corner

You said it appears at the very bottom-left or bottom-right of the page. I checked every component mounted in `__root.tsx` (Header, Outlet, Footer, FaqChatbot, Toaster) and the whole footer markup — nothing in our code renders a literal "1" there. The two realistic candidates:

- **The Lovable preview badge** (the small floating mark Lovable injects into the preview iframe in the bottom-right corner). That isn't part of your site and won't appear on the published `aylmer-rooms-hub.lovable.app` URL.
- **A leftover devtools / browser overlay** (translation extension, password manager, etc.)

After build mode, I'll open the preview on mobile width and visually confirm which one it is. If it's the Lovable badge, it can be hidden on the published site via the publish settings (Hide Lovable Badge). If it turns out to be something in our code I missed, I'll remove it then.

## 3. The reusable "mobile QA" prompt you asked for

Save this to paste into chat anytime you want me to do a full mobile pass:

> **Mobile QA pass — please go through every public page (`/`, `/rooms`, `/properties`, each `/properties/:id`, `/book`, `/pay`, `/apply`, `/about`, `/faq`, `/newcomer`, `/transit`, `/extras`, `/portal`) at 360×800 and 414×896 and check ALL of the following. Show me before/after screenshots for anything you fix.**
>
> 1. **No horizontal scroll** on any page — page width must equal viewport width.
> 2. **Header**: logo + EN/FR/AR toggle + Book Now + hamburger all fit on one line, nothing clipped, nothing overlapping. Hamburger menu opens, scrolls, and closes cleanly.
> 3. **Language toggle**: switch to FR, then AR, on every page. Confirm (a) all visible text translates, (b) RTL flips layout cleanly in Arabic with no broken alignment, (c) the choice persists after navigation.
> 4. **Hero / above-the-fold**: H1 fits without breaking awkwardly mid-word, CTA button visible without scrolling.
> 5. **Cards, grids, forms**: padding consistent, inputs full-width, labels readable, buttons reachable with thumb.
> 6. **Footer**: link columns stack neatly under the brand block, link rows are compact (not airy), social row centered, bottom bar (© line and zorbaco.com line) vertically aligned and not wrapping weirdly, designer credit strip readable.
> 7. **Floating chatbot bubble**: visible on the right edge, doesn't cover footer text when scrolled to the bottom, doesn't overlap CTAs in the hero.
> 8. **Images**: lazy-load, aspect ratios stable, no layout shift, alt text present.
> 9. **Tap targets**: every clickable thing ≥ 40px tall.
> 10. **No stray characters, dev badges, debug counters, or untranslated English strings** anywhere on the page.
>
> After the pass, list every issue found, group by page, and fix all of them in one batch. Then re-screenshot each fixed page to confirm.

## Files I'll touch in build mode

- `src/styles.css` — drop the global `button, a { min-height: 44px }`; keep `.touch-min` as the opt-in helper.
- `src/components/Footer.tsx` — tighten `space-y-2.5` → `space-y-1` on the three column `<ul>`s.
- `src/components/FaqChatbot.tsx` — remove the leftover `-mt-[64px]` offset on the chatbot bubble (it was there to stack above the now-deleted WhatsApp float).
- Visual check of the "1" against the preview; if it's a Lovable preview badge I'll tell you, no code change needed.
