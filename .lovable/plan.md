## Fix social icons: separate Messenger and Facebook page

### Issue
The floating contact bar shows a Facebook icon that links to Messenger (`m.me/...`). It should be a Messenger icon. The actual Facebook page (`https://www.facebook.com/ZorbaRentals`) isn't surfaced as its own action.

### Changes

**1. `src/components/FloatingContactBar.tsx`**
- Change the first pill's icon from `Facebook` to `MessageCircle` (Messenger), keep it linking to `CONTACT.messenger`, keep the `#0084FF` Messenger blue, and update the `label`/`title` to "Messenger".
- (WhatsApp keeps `MessageCircle` — fine, both messaging apps share that glyph, distinguished by their brand colors green vs. blue.)

**2. `src/data/properties.ts`**
- Update `CONTACT.facebook` to `https://www.facebook.com/ZorbaRentals` (current value has a trailing slash variant).

**3. Add Facebook page link to the Contact section on the home page (`src/routes/index.tsx`)**
- Below the `<ContactForm />` inside `#contact`, add a small "Visit us on Facebook" link/button using the `Facebook` lucide icon in Facebook blue (`#1877F2`), opening `CONTACT.facebook` in a new tab.

**4. Footer (`src/components/Footer.tsx`)**
- The `SOCIALS` array already has a separate Facebook pill linking to `CONTACT.facebook` — no change needed, it will now point to the corrected URL via the data file.

### Out of scope
- No layout/styling overhaul, no copy changes elsewhere, no new routes.
