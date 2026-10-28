/**
 * Single place for client-supplied business details.
 * TODO(client): fill these in. Empty values are hidden on the site, never faked.
 */
export const site = {
  name: "Gadiride",
  tagline: "Every vehicle. One ride.",
  /** International format, digits only, e.g. "919876543210". Empty = WhatsApp opens without a preset contact. */
  whatsappNumber: "",
  /** e.g. "+91 98765 43210". Empty = Call links hidden. */
  phone: "",
  email: "",
  address: "",
  /** Cities the client confirms. Empty = "Cities we serve" section hidden. */
  cities: [] as { name: string; note?: string }[],
  social: [] as { label: string; href: string }[],
  /** Set true once real prices are supplied in data/vehicles.ts */
  showPrices: false,
};
