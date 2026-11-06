/**
 * Sample FAQs (replaced by the FAQ documents in Sanity once added).
 * `group` decides which service page shows the question; untagged ones are general.
 */
export type FaqSeed = { q: string; a: string; group?: "cars" | "passenger" | "logistics" | "equipment" };

export const FAQ: FaqSeed[] = [
  { group: "cars", q: "How do I rent a self drive car in Hyderabad?", a: "Search with your pickup area, date, time and number of days, pick a car and send the request on WhatsApp, or call 9000-478-478. Our team confirms availability, shares the pickup point or delivers the car to you." },
  { group: "cars", q: "Is there a security deposit?", a: "Select cars come with a zero deposit option. For the rest, a refundable deposit applies and is returned after the car is checked in. Ask our team which option suits your booking." },
  { group: "cars", q: "Are the kilometres unlimited?", a: "Yes, unlimited km plans are available. Lower-priced plans with a daily km limit are also offered if you are only driving in the city." },
  { group: "cars", q: "What documents do I need?", a: "A valid driving licence and a government ID such as Aadhaar. You must be 18 or older. Documents are verified once before your first pickup; repeat bookings are quicker." },
  { group: "cars", q: "Do you deliver the car to my home or to the airport?", a: "Yes. We deliver across Hyderabad and to Rajiv Gandhi International Airport (RGIA), Shamshabad. You can also pick up from the nearest branch." },
  { group: "cars", q: "What about fuel?", a: "Return the car with the same fuel level as at pickup. If it comes back lower, the difference is charged at the current fuel price." },
  { group: "cars", q: "Can I take the car outside Telangana?", a: "Yes, outstation trips are allowed. Mention your route when booking so we can share any interstate permit or toll details." },
  { group: "cars", q: "What if I return the car late or want to extend?", a: "Message or call us before your return time to extend. Late returns without notice are charged by the hour, and extensions depend on the car being free." },
  { group: "cars", q: "What is the cancellation policy?", a: "Cancel early for a full refund. Closer to pickup time, a part of the amount is refunded. The exact terms are shared with your booking confirmation." },
  { group: "cars", q: "What if the car breaks down?", a: "Call our 24×7 roadside help. We arrange repair on the spot or a replacement car as quickly as possible." },
  { group: "cars", q: "Can I rent a car with a driver?", a: "Yes. Choose \"With driver\" in the search. Chauffeur-driven cars suit outstation trips, weddings and airport transfers." },
  { group: "passenger", q: "Do you have tempo travellers and buses?", a: "Yes. Tempo travellers, minibuses and buses with drivers for group trips, weddings, tours and staff transport from Hyderabad." },
  { group: "logistics", q: "Do you help with loading for goods transport?", a: "Yes. Add loading helpers in the search and our team confirms them with your quote." },
  { group: "equipment", q: "Is an operator included with heavy equipment?", a: "You can choose with or without an operator. Our team confirms availability and charges." },
  { q: "Do you work with companies?", a: "Yes. Use the corporate enquiry form for long-term, bulk or mixed-fleet needs." },
  { q: "How do I reach you?", a: "Call 9000-478-478 or message us on WhatsApp. Our team replies quickly, every day." },
];
