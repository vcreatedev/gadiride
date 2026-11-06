# Gadiride

Vehicle rental website for cars, passenger vehicles, logistics vehicles and heavy equipment. Booking requests are sent through WhatsApp. Vehicles, FAQs, career roles and business details are managed in an admin panel (Sanity Studio) at `/admin`.

## Quick start

```bash
npm install
cp .env.example .env.local   # uses the development dataset
npm run dev                  # http://localhost:3000  (admin: http://localhost:3000/admin)
npm run build && npm start   # production build
```

The site works without Sanity content: anything missing falls back to the built-in defaults.

## Stack

- Next.js 15 (App Router, server build with ISR)
- Sanity v4 (embedded Studio at `/admin`, content via `next-sanity`)
- TypeScript, Tailwind CSS
- GSAP + ScrollTrigger, Lenis
- Radix (accordion, dialog), react-hook-form + zod, lucide-react

## Admin (Sanity)

Everything a visitor reads or sees is editable at `/admin`:

| Studio section | Controls |
|---|---|
| **Vehicles** | Every vehicle: name, group, type, main photo, extra photos, photo framing/background/zoom, specs, options, price, featured, show/hide, order |
| **Catalog → Vehicle types** | Types (Hatchback, SUV, Bus…): name, group, photo, animation style. New types appear in filters, "Pick a style", "Meet the fleet" and the booking forms |
| **Catalog → Vehicle groups** | Names, short names and descriptions of the 4 groups (the set itself is fixed: forms and animations depend on it) |
| **Catalog → Services** | Service sections: text, bullet points, button, form, photo |
| **Pages → Home page** | Every home section: hero, headings, story chapters, promo cards, reasons, steps, corporate, careers, final CTA, SEO |
| **Pages → Vehicles / Services / Corporate / Careers / About / Contact / FAQ / 404** | All page headings, intros, labels, SEO title, description and share image |
| **FAQs, Customer reviews, Career roles** | Lists (reviews are hidden until you add one) |
| **Site settings** | WhatsApp, phone, email, address, cities, social links, logo, footer text, share image, show prices, intro animation |

Headings ending in `.` or `?` show that character in brand orange. Any empty field falls back to the built-in text in `src/content/defaults.ts`, so the site never shows blanks.

Not in Sanity on purpose: the animated SVG vehicle drawings (code), booking form fields and validation (`src/data/forms.ts`).

### Search, drivers and vehicle partners

- The home search card has five tabs: Cars, Passenger, Trucks, Heavy equipment and **Drivers**. **Search** opens `/search/` with vehicles that fit the trip (car type, with or without driver, seats, payload, operator), then other options in the same group. Each result has **Request this…**, which sends the trip details plus that vehicle on WhatsApp.
- Matching uses each vehicle's **Specifications** (for example `Seats: 7`, `Payload: Up to 7 t`) and **Options** (`With driver`, `Self drive`, `With operator`). Fill these in so searches match well.
- **Drivers** come from the **Drivers** list in the Studio. Only real profiles are shown; drivers in the customer's pickup city come first. With no profiles, customers get a "Request a driver" button.
- **Attach your vehicle** (`/partner/`) lets owners send their car, bus, truck or machine details on WhatsApp. Nothing is listed until your team verifies it and adds it under **Vehicles**.
- Search page and partner page text is editable under **Pages**.

### Two datasets: development and production

| Where | Dataset | Studio workspace |
|---|---|---|
| Your computer (`npm run dev`) | `development` | `/admin/development` (labelled **DEV**) |
| Vercel **Preview** deployments | `development` | |
| Vercel **Production** | `production` | `/admin/production` (labelled **LIVE**) |

The dataset is chosen by `NEXT_PUBLIC_SANITY_DATASET`. Edits in the DEV workspace never reach the live site. Whenever the site is showing development data, a yellow **DEV DATA** badge appears in the bottom-left corner.

**One-time setup** (from the project folder):

```bash
npx sanity login
npx sanity dataset create development --visibility public
npx sanity cors add http://localhost:3000 --credentials
npx sanity cors add https://YOUR-DOMAIN --credentials
npm run seed:dev        # fills development with all current text and photos
npm run seed:prod       # same for production (only creates what is missing)
```

In **Vercel → Settings → Environment Variables**:

| Variable | Production | Preview | Development |
|---|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `imd3p4ax` | `imd3p4ax` | `imd3p4ax` |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` | `development` | `development` |

**Day-to-day workflow**

1. Try changes in `/admin/development` and check them on `localhost:3000` or a Vercel preview.
2. When happy, make the same edit in `/admin/production` (LIVE).
3. To reset development to a copy of live: `npm run data:prod-to-dev` (overwrites development).

The seed scripts never overwrite existing documents, so they are safe to re-run.

### Instant updates

Published changes appear within **60 seconds**. For instant updates, set `SANITY_REVALIDATE_SECRET` in Vercel (Production) and add a webhook in sanity.io/manage → API → Webhooks:

- URL: `https://YOUR-DOMAIN/api/revalidate`
- Dataset: `production`
- Trigger on: Create, Update, Delete
- Secret: the same value as `SANITY_REVALIDATE_SECRET`

### Photo tips

- Upload large originals (1600 px wide or more). The site serves resized AVIF/WebP automatically.
- **Fill the frame** (default) suits normal photos: click the crop icon and drag the hotspot onto the vehicle so it stays centred on every card size.
- **Show the whole vehicle** suits cut-out PNGs; pick a card background and use **Zoom** if it looks small.
- Add interior and boot shots under **More photos**; they appear as thumbnails on the vehicle page.

## Brand and theme

The theme comes from the Gadiride logo (`public/brand/gadiride-logo.webp`):

| Token | Value | Use |
|---|---|---|
| `brand-gradient` | `#FDB022 → #F47A16 → #E8540C` | Primary buttons, wordmark, accents |
| `brand-500` / `600` / `700` | `#F47A16` / `#E35E0B` / `#B9470A` | Accents, hover, text on white |
| `taxi` | `#FFC20E` | Highlight cards, checker motif |
| `ink-900` | `#16161A` | Text, dark sections |
| Font `font-brand` / `font-head` | Fredoka | Wordmark and card titles |

The header and footer use `src/components/Logo.tsx` (live text and SVG, works on dark and light backgrounds). The favicon is `src/app/icon.svg`. The social share image is `public/brand/og.jpg`.

## Project layout

```
src/app/(site)/        public pages (shared header/footer via SiteShell)
src/app/admin/          embedded Sanity Studio
src/app/api/revalidate Sanity webhook → cache refresh
src/sanity/            client, schemas, Studio desk structure
src/lib/content.ts     all content reads (one cached Sanity query, merged over defaults)
src/content/defaults.ts default text for every section (fallback + seed source)
scripts/seed.ts        fills a dataset with the current text and photos
src/data/              fixed groups/types, forms, services, sample content
sanity.config.ts       Studio config
```

## Pages

| Route | Content |
|---|---|
| `/` | Homepage |
| `/vehicles/` | Filterable listing across all groups |
| `/vehicles/[group]/` | Group page with filters and quote form |
| `/vehicle/[slug]/` | Vehicle detail with quote form (new vehicles from the admin render on first visit) |
| `/services/`, `/corporate/`, `/careers/`, `/about/`, `/contact/`, `/faq/` | Supporting pages |
| `/search/` | Search results (vehicles or drivers for the entered trip) |
| `/partner/` | Attach your vehicle |
| `/admin/` | Admin |

## Still needed from the client

- Real WhatsApp number, phone, email and address (enter them in **Site settings**).
- The real fleet with photos (enter it in **Vehicles**).
- Confirmed company details for `/about/` (history, registration). Nothing there should be invented.
- Verified customer reviews, if a testimonials section is wanted.

## Not built

- Online payments, user accounts, live inventory or instant booking confirmation. All enquiries go to WhatsApp.
