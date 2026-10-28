# Gaadi Adda

Premium vehicle rental portal: cars, passenger vehicles, logistics vehicles and heavy equipment. Booking requests hand off to WhatsApp.

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export to ./out
npm start        # serve the export locally
```

## Stack

- Next.js 15 (App Router, static export)
- TypeScript in strict mode
- Tailwind CSS
- GSAP + ScrollTrigger + DrawSVG + SplitText
- Lenis (smooth scroll, synced to ScrollTrigger)
- Radix (accordion, dialog)
- react-hook-form + zod
- lucide-react

No backend. No database. The only external action is opening a WhatsApp link.

## Client configuration

Open `src/config/site.ts` and fill in:

| Field | What to enter |
|---|---|
| `whatsappNumber` | International digits, e.g. `"919876543210"` |
| `phone` | Display format, e.g. `"+91 98765 43210"` |
| `email` | Business email |
| `address` | Business address |
| `cities` | Array of `{ name, note? }` objects |
| `social` | Array of `{ label, href }` objects |
| `showPrices` | Set `true` once real prices are added in `vehicles.ts` |

Empty values are hidden on the site, never faked.

## Vehicle data

`src/data/vehicles.ts` holds the sample fleet. Every entry is marked `sample: true`. Replace them with the client's confirmed list. Each vehicle needs:

- `slug`: URL-safe id
- `name`, `type`, `group`, `art` (which SVG to render), `color`
- `specs`: array of `{ label, value }`
- `summary`, `options`
- `pricePerDay`: leave undefined until the client confirms

## Replacing vehicle art with photos

The SVG vehicles are stand-ins. To use real photography:

1. Prepare a **transparent side-profile PNG** of the body (no wheels) and a **separate wheel PNG**, both at 2x resolution with consistent lighting.
2. Place them in `/public/vehicles/`, e.g. `suv-body.webp` and `suv-wheel.webp`.
3. In `src/data/vehicleArt.ts`, add a `png` field to the vehicle entry:
   ```ts
   png: { body: "/vehicles/suv-body.webp", wheel: "/vehicles/suv-wheel.webp" }
   ```
4. Update `VehicleSvg.tsx` to render `<img>` when `png` exists. The `VehicleRig` already reads the `wheels` array for positions and radii, so rotation continues to work.

For the JCB, supply separate arm, boom and bucket PNGs with the pivot points noted. Update the `arms` array in `vehicleArt.ts`.

## Services and FAQ

- `src/data/services.ts`: service list and career roles.
- `src/data/faq.ts`: FAQ answers. Keep answers honest; anything unconfirmed should say "Message us on WhatsApp for details".
- `src/data/forms.ts`: booking form fields per category.

## Animation notes

- **Speedometer loader** plays once per session (tracked in sessionStorage). Skip button always visible. Falls back to a fade when reduced motion is on.
- **Hero drive-in**: vehicle enters with wheel rotation derived from distance, suspension dip on braking, parallax scenery.
- **Tab switch**: current vehicle exits right, next enters from left.
- **Line-drawing story**: pinned ScrollTrigger section. Requires stroke-based SVGs (the ones in vehicleArt are ready). Falls back to static drawings for reduced motion.
- **Fleet convoy**: scroll-linked horizontal movement with synchronized wheel rotation.
- **Lenis** smooth scroll syncs to ScrollTrigger via the GSAP ticker. Disabled for reduced motion and touch devices.

## Pages

| Route | Content |
|---|---|
| `/` | Full homepage with all sections |
| `/vehicles/` | Filterable listing across all groups |
| `/vehicles/[group]/` | Group page with filters and quote form |
| `/vehicle/[slug]/` | Vehicle detail with gallery and quote form |
| `/services/` | All service lines with inline quote forms |
| `/corporate/` | Corporate offering and enquiry form |
| `/careers/` | Roles and job enquiry form |
| `/about/` | Company information (confirmed facts only) |
| `/contact/` | WhatsApp, phone, email, address |
| `/faq/` | Full accordion |

All routes are statically exported.

## Deployment

The `out/` folder is a static site. Deploy to Vercel, Netlify, Cloudflare Pages, or any static host.

```bash
npm run build
# Upload the out/ directory
```

## What is NOT built

- Backend, database, API
- Authentication, accounts
- Payments
- Live inventory or booking confirmation
- Admin panel
- Email sending (all enquiries go to WhatsApp)
