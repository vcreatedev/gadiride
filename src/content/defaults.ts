/**
 * Default copy for every editable text on the site.
 *
 * - Used as a fallback whenever a field is empty in Sanity, so the site never breaks.
 * - Used by `npm run seed` to create the initial documents in a dataset.
 *
 * Once a field is filled in Sanity, Sanity wins. Headings ending in "." or "?"
 * render that last character in the brand orange.
 */

export type Seo = { title: string; description: string };
export type TitleText = { title: string; text: string };

export const homeDefaults = {
  seo: {
    title: "Gadiride | Self drive car rental in Hyderabad, buses, trucks and JCBs",
    description:
      "Self drive and chauffeur-driven cars in Hyderabad from ₹1,199 a day, plus tempo travellers, buses, trucks and JCBs. Doorstep and RGIA airport delivery. Call 9000-478-478.",
  },
  hero: {
    title: "Every vehicle. Every journey.",
    highlight: "One ride.",
    subtitle: "From city cars and group travel to trucks and JCBs. Tell us what you need and get a quote on WhatsApp.",
    primaryCta: "Find your vehicle",
    secondaryCta: "Explore our services",
  },
  styles: { title: "Pick a style." },
  featured: {
    title: "Popular right now.",
    text: "A few of the vehicles customers ask for most. Every request gets a quote from our team.",
    linkLabel: "View all vehicles",
  },
  story: {
    title: "From hatchback to JCB.",
    cta: "Get a quote",
    chapters: [
      { key: "Choose", title: "Start with what you need", text: "A trip, a load or a job site. Pick the vehicle group and we take it from there.", readout: "Route" },
      { key: "Cars", title: "Cars for every day", text: "Hatchbacks for the city, sedans for the airport, SUVs for family trips and luxury cars for weddings. Self drive or with a driver.", readout: "Cars" },
      { key: "Passenger", title: "Seats for the whole group", text: "Tempo travellers, minibuses and buses for functions, tours and staff transport.", readout: "Groups" },
      { key: "Logistics", title: "Loads, moved", text: "Pickups and trucks for shop stock, house shifting and inter-city goods.", readout: "Goods" },
      { key: "Heavy equipment", title: "Machines for the site", text: "Backhoe loaders (JCB) by the hour or the day, with or without an operator.", readout: "Site work" },
      { key: "Book", title: "One message away", text: "Send your details on WhatsApp and get a quote from our team.", readout: "Ready" },
    ],
  },
  fleet: { title: "Meet the fleet.", text: "From a city hatchback to luxury coaches and heavy machines.", cta: "View all vehicles" },
  services: { title: "More than car rental.", text: "Six ways we help, from a weekend car to a fleet for your company.", linkLabel: "Learn more" },
  promos: [
    { title: "Need it today?", text: "Same-day goods transport requests are welcome. Tell us the load and the address.", cta: "Request a truck", group: "logistics", tone: "brand" },
    { title: "Group trip?", text: "Tempo travellers and buses for weddings, tours and pilgrimages.", cta: "Plan group travel", group: "passenger", tone: "dark" },
    { title: "Site work?", text: "Backhoe loaders by the hour or the day, with an operator if you need one.", cta: "Hire a JCB", group: "equipment", tone: "taxi" },
    { title: "Want a driver?", text: "Sit back on long drives. Add a driver to any car request.", cta: "Car with driver", group: "cars", tone: "light" },
  ],
  why: {
    titleTop: "Why rent with",
    titleBottom: "Gadiride",
    items: [
      { title: "Every vehicle, one place", text: "Cars, buses, trucks and JCBs from a single team, so you do not need four different contacts." },
      { title: "Quotes on WhatsApp", text: "Send your details once. Our team replies on the app you already use." },
      { title: "Drive or be driven", text: "Self drive for many cars, or add a driver or operator when you need one." },
      { title: "Personal or business", text: "From a family weekend to daily staff transport and site work." },
    ],
  },
  how: {
    title: "How booking works.",
    text: "A request, not an instant booking. A person from our team checks every one.",
    steps: [
      { title: "Choose a vehicle or service", text: "Pick a group in the booking card or browse the fleet." },
      { title: "Share your details", text: "Dates, places, passengers, load or site. Only what we need to quote." },
      { title: "Send it on WhatsApp", text: "Your request opens in WhatsApp, already written. Press send." },
      { title: "Our team confirms", text: "We reply with availability and price. Your booking is confirmed only after that." },
    ],
  },
  corporate: {
    title: "Moving a team or a fleet?",
    text: "Staff transport, guest cars, long-term vehicles, goods and machinery. Tell us what your company needs and we will put together one plan.",
    points: ["Monthly and long-term arrangements", "Mixed vehicles across all groups", "One contact for every request"],
  },
  careers: { title: "Drive with us", text: "We work with drivers, heavy vehicle drivers, equipment operators and office and operations staff.", cta: "See careers" },
  partner: {
    title: "Own a vehicle? Attach it.",
    text: "Cars, tempo travellers, buses, trucks or machines: list them with Gadiride, with or without a driver. Our team verifies every vehicle before it is offered.",
    cta: "Attach your vehicle",
  },
  testimonials: { title: "What customers say." },
  cities: { title: "Cities we serve." },
  faq: { title: "Questions, answered." },
  final: {
    title: "Where are you headed?",
    text: "Tell us the vehicle, the place and the date. We will reply with a quote.",
    primaryCta: "Find your vehicle",
    whatsappCta: "Chat on WhatsApp",
  },
};

export const pageDefaults = {
  vehicles: {
    seo: { title: "All vehicles", description: "Self drive cars, chauffeur cars, tempo travellers, buses, trucks and JCBs on rent in Hyderabad." },
    title: "All vehicles.",
    intro: "Filter by group and type, then request a quote for the one you need.",
    quoteTitle: "Get a quote.",
    quoteText: "Fill in the details and continue on WhatsApp. Our team replies with availability and price.",
    faqTitle: "Good to know.",
    emptyTitle: "Nothing listed for this filter yet",
    emptyText: "Ask us on WhatsApp. We often have more than what is listed here.",
    detailQuoteTitle: "Request a quote",
    detailQuoteText: "We check availability for your dates and reply on WhatsApp. Or call 9000-478-478.",
    stockPhotoNote: "Representative photo. Exact model, make and details confirmed with your quote.",
  },
  services: {
    seo: { title: "Services", description: "Car rental, passenger transport, goods transport, heavy equipment hire, corporate fleet and driver services." },
    title: "Our services.",
    intro: "Who each service is for, what it includes and how to ask for a quote.",
    confirmNote: "Details of this service are confirmed on WhatsApp.",
  },
  corporate: {
    seo: { title: "Corporate transport and fleet", description: "Staff transport, guest cars, long-term fleet, goods transport and machinery for companies." },
    title: "Corporate transport.",
    intro: "One partner for people, goods and machinery. Tell us what your company needs.",
    uses: [
      { title: "Staff transport", text: "Daily pickup and drop with tempo travellers and buses." },
      { title: "Guest and executive cars", text: "Sedans, SUVs and luxury cars with drivers for visitors and leadership." },
      { title: "Long-term vehicles", text: "Monthly and longer arrangements for teams that need cars on hand." },
      { title: "Operations", text: "Trucks for goods and backhoe loaders for project sites." },
    ],
    groupsLabel: "Across every group:",
  },
  careers: {
    seo: { title: "Careers", description: "Work with Gadiride as a driver, heavy vehicle driver, equipment operator or in operations." },
    title: "Drive with us.",
    intro: "We work with drivers, operators and office staff. Send your details and we will contact you when there is a matching opening.",
    rolesTitle: "Roles we hire for.",
    note: "Current openings are shared on WhatsApp. No listings are shown here until confirmed.",
    formTitle: "Send your details",
    formText: "Your details open in WhatsApp. Send the message to apply.",
  },
  about: {
    seo: { title: "About us", description: "Gadiride is a Hyderabad vehicle rental company: self drive cars, chauffeur cars, passenger vehicles, trucks and JCBs." },
    title: "About Gadiride.",
    intro: "A Hyderabad rental company that brings every kind of vehicle together, so you find the right one with one call or message.",
    heading: "What we do.",
    paragraphs: [
      "Gadiride rents self drive cars across Hyderabad, from fuel-saving hatchbacks to seven-seat SUVs, with doorstep delivery, airport delivery at RGIA and unlimited km plans.",
      "We also provide chauffeur-driven cars for outstation trips and weddings, tempo travellers and buses for groups, trucks for goods and backhoe loaders for construction sites.",
      "Instead of calling different agencies for different needs, call 9000-478-478 or message us on WhatsApp. Our team replies with options and a price.",
    ],
  },
  contact: {
    seo: { title: "Contact", description: "Call 9000-478-478 or WhatsApp Gadiride for self drive cars and vehicle rentals in Hyderabad." },
    title: "Talk to us.",
    intro: "Call 9000-478-478 or message us on WhatsApp. We help with bookings every day.",
    whatsappTitle: "Chat on WhatsApp",
    whatsappText: "Ask about any vehicle, service or job. Our team replies on WhatsApp.",
    whatsappCta: "Open WhatsApp",
    otherTitle: "Other ways to reach us",
    emptyText: "Please call or WhatsApp us for booking help.",
  },
  faq: {
    seo: { title: "FAQ", description: "Answers about vehicles, booking requests, drivers, goods transport and heavy equipment." },
    title: "Questions, answered.",
    intro: "Anything else? Ask us on WhatsApp.",
  },
  search: {
    seo: { title: "Search", description: "Vehicles and drivers that fit your trip. Request one and our team confirms on WhatsApp." },
    title: "Your search.",
    intro: "Vehicles that fit your trip. Pick one and send the request on WhatsApp.",
    resultsTitle: "for your trip",
    othersTitle: "More options in this group",
    noMatchTitle: "No exact match yet",
    noMatchText: "Here are the closest options. Send a request anyway and our team will check what is possible.",
    availabilityNote: "Availability for your dates is confirmed by our team on WhatsApp before anything is booked.",
    requestCta: "Request this",
    detailsLabel: "Details",
    driversTitle: "Drivers for your trip",
    driversEmpty: "Our team matches you with a verified driver. Send your request and we will reply on WhatsApp.",
    driversEmptyCta: "Request a driver",
    editLabel: "Edit search",
  },
  drivers: {
    seo: { title: "Hire a driver", description: "Hire a verified driver for your own vehicle or ours, for local or outstation trips." },
    title: "Hire a driver.",
    intro: "Verified drivers in Hyderabad for your own car or ours. Local or outstation, by the day or longer.",
    listTitle: "Our drivers",
    empty: "Our team matches you with a verified driver. Search above with your trip details and we will reply on WhatsApp.",
  },
  partner: {
    seo: { title: "Attach your vehicle", description: "List your car, bus, truck or machine with Gadiride, with or without a driver." },
    title: "Attach your vehicle.",
    intro: "Own a car in Hyderabad? Attach it with Gadiride and earn from rentals. Tempo travellers, buses, trucks and JCBs welcome too.",
    steps: [
      { title: "Send your vehicle details", text: "Type, model, year and city. It opens in WhatsApp, already written." },
      { title: "We verify the vehicle", text: "Our team checks the vehicle and documents and agrees terms with you." },
      { title: "Start getting requests", text: "Once listed, matching customer requests are shared with you." },
    ],
    formTitle: "Your vehicle",
    formText: "Send the details on WhatsApp. Nothing is listed until our team has verified it.",
  },
  notFound: {
    title: "Wrong turn.",
    text: "This page does not exist. The road home is right here.",
    cta: "Back to home",
  },
};

export const footerDefaults = {
  blurb: "Self drive and chauffeur cars in Hyderabad, plus buses, trucks and JCBs. Doorstep and airport delivery. Call 9000-478-478.",
};

export type HomeContent = typeof homeDefaults;
export type PageContent = typeof pageDefaults;
export type PageKey = keyof PageContent;
