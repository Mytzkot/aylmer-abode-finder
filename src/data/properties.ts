// Static property metadata; live availability comes from rooms table.
import imgAmour from "@/assets/property-amour.jpg";
import imgConrad from "@/assets/property-conrad.jpg";
import imgColline from "@/assets/property-colline.jpg";

export interface PropertyMeta {
  id: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  images: string[];
  youtube: string;
  maps: string;
  airbnb: string;
  walkscore: { name: string; detail: string }[];
}

export const PROPERTIES: PropertyMeta[] = [
  {
    id: "102-amour",
    address: "102 Chemin d'Amour",
    city: "Gatineau, QC",
    lat: 45.39456,
    lng: -75.83815,
    images: [
      imgAmour,
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
    ],
    youtube: "https://www.youtube.com/@shakeshake-m7t",
    maps: "https://www.google.com/maps/search/?api=1&query=102+Chemin+d'Amour+Gatineau+QC",
    airbnb: "https://www.airbnb.com",
    walkscore: [
      { name: "Galeries Aylmer", detail: "Groceries · 5 min walk" },
      { name: "Marina d'Aylmer", detail: "Waterfront · 8 min" },
      { name: "UQO Campus", detail: "10-min direct bus" },
      { name: "Algonquin College", detail: "20-min bus" },
      { name: "University of Ottawa", detail: "25-min bus" },
    ],
  },
  {
    id: "58-conrad",
    address: "58 Rue Conrad Valéra",
    city: "Gatineau, QC",
    lat: 45.39810,
    lng: -75.84520,
    images: [
      imgConrad,
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80",
    ],
    youtube: "https://www.youtube.com/@shakeshake-m7t",
    maps: "https://www.google.com/maps/search/?api=1&query=58+Rue+Conrad+Valéra+Gatineau+QC",
    airbnb: "https://www.airbnb.com",
    walkscore: [
      { name: "Galeries Aylmer", detail: "Groceries · 7 min walk" },
      { name: "Marina d'Aylmer", detail: "Waterfront · 12 min" },
      { name: "UQO Campus", detail: "10-min direct bus" },
      { name: "Algonquin College", detail: "22-min bus" },
      { name: "University of Ottawa", detail: "25-min bus" },
    ],
  },
  {
    id: "260-colline",
    address: "260 Av. de la Colline",
    city: "Gatineau, QC",
    lat: 45.41260,
    lng: -75.78180,
    images: [
      imgColline,
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=80",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
    ],
    youtube: "https://www.youtube.com/@shakeshake-m7t",
    maps: "https://www.google.com/maps/search/?api=1&query=260+Avenue+de+la+Colline+Gatineau+QC",
    airbnb: "https://www.airbnb.com",
    walkscore: [
      { name: "Galeries Aylmer", detail: "Groceries · 10 min walk" },
      { name: "Marina d'Aylmer", detail: "Waterfront · 15 min" },
      { name: "UQO Campus", detail: "12-min direct bus" },
      { name: "Algonquin College", detail: "20-min bus" },
      { name: "University of Ottawa", detail: "28-min bus" },
    ],
  },
];

export const STO_LINES = [
  { line: "40", desc: "Express Aylmer — direct to downtown Ottawa via Portage" },
  { line: "50", desc: "Aylmer — UQO / Hull / Ottawa downtown" },
  { line: "59", desc: "Aylmer Plateau — Hull terminal" },
  { line: "800", desc: "Rapibus — high-frequency cross-Gatineau" },
];

export const NEWCOMER_LINKS = [
  { name: "Ville de Gatineau", url: "https://www.gatineau.ca", desc: "City services, garbage, permits" },
  { name: "Immigration Québec", url: "https://www.quebec.ca/en/immigration", desc: "Settlement & permits" },
  { name: "YOW Ottawa Airport", url: "https://yow.ca", desc: "Flights & transport" },
  { name: "VIA Rail", url: "https://www.viarail.ca", desc: "Train across Canada" },
  { name: "Uber Eats", url: "https://www.ubereats.com", desc: "Food delivery — works at all addresses" },
  { name: "DoorDash", url: "https://www.doordash.com", desc: "Food & grocery delivery" },
];

export const EMERGENCY = [
  { name: "Emergency", number: "911" },
  { name: "Gatineau Non-Emergency", number: "819-243-2345" },
  { name: "Info-Santé", number: "811" },
];

export const CONTACT = {
  phone: "+13432025460",
  whatsapp: "https://wa.me/13432025460",
  whatsappShort: "wa.me/13432025460",
  sms: "sms:+13432025460",
  tel: "tel:+13432025460",
  messenger: "https://m.me/Lisa.Mona.Mich",
  messengerShort: "m.me/Lisa.Mona.Mich",
  facebook: "https://www.facebook.com/ZorbaRentals/",
  facebookShort: "facebook.com/ZorbaRentals",
  youtube: "https://www.youtube.com/@shakeshake-m7t",
  youtubeShort: "youtube.com/@shakeshake-m7t",
  instagram: "https://www.instagram.com/zorbarentals",
  instagramShort: "instagram.com/zorbarentals",
  email: "mailto:zorbagraphic@gmail.com",
  emailShort: "zorbagraphic@gmail.com",
  website: "https://zorbaco.com",
  websiteShort: "zorbaco.com",
};

export const PROPERTY_MAP_LINKS: Record<string, { full: string; short: string }> = {
  "102-amour": { full: "102 Chemin d'Amour, Gatineau, J9H 5V4", short: "https://bit.ly/4ihMIeD" },
  "58-conrad": { full: "58 Rue Conrad-Valéra, Gatineau, J9J 3L7", short: "https://bit.ly/3OFEvTX" },
  "260-colline": { full: "260 Avenue de la Colline, Gatineau, J9J 1M1", short: "https://bit.ly/4eWMAOM" },
};


export const FAQ_KB: { q: string; a: string; keywords: string[] }[] = [
  { q: "Is Wi-Fi included?", a: "Yes, fast Wi-Fi and all utilities are included in your monthly rent.", keywords: ["wifi", "wi-fi", "internet", "wi fi", "utilities", "heat", "electric", "water", "hydro"] },
  { q: "What furniture comes with the room?", a: "Every room has a queen bed with linens & duvet, a 32\" Roku Smart TV, desk, chair, wardrobe, mini-fridge, kettle, and coffee maker.", keywords: ["furnish", "furniture", "bed", "tv", "fridge", "desk", "wardrobe", "kettle", "coffee"] },
  { q: "Do I need a credit check?", a: "No credit check and no credit score needed. Only the first month's rent is required to move in.", keywords: ["credit", "score", "check", "deposit", "move in"] },
  { q: "Are pets allowed?", a: "Currently we do not allow pets.", keywords: ["pet", "dog", "cat", "animal"] },
  { q: "How do I get to UQO / downtown?", a: "One direct bus ride to UQO (about 10 minutes). 15-minute direct bus to downtown Ottawa/Hull. We're only 8km from downtown.", keywords: ["bus", "transit", "sto", "transport", "uqo", "downtown", "ottawa", "hull", "university"] },
  { q: "What's the kitchen like?", a: "Each guest house has a full shared kitchen with a stove, microwave, air fryer, fridge/freezer, and dishes.", keywords: ["kitchen", "stove", "microwave", "cook", "air fryer", "dishes"] },
  { q: "Is there parking and laundry?", a: "Yes — free parking and free laundry at every location.", keywords: ["parking", "park", "laundry", "washer", "dryer"] },
  { q: "How do I apply?", a: "Click \"Apply Now\", choose a location and budget, and fill in the form. We review and contact you to arrange a viewing.", keywords: ["apply", "application", "form", "sign up", "book"] },
  { q: "What does it cost?", a: "Monthly rooms range from $750 to $1600 depending on size and availability.", keywords: ["cost", "price", "rent", "rate", "how much", "monthly"] },
  { q: "Is housekeeping included?", a: "Yes — bi-weekly housekeeping of all common areas (kitchen, bathrooms, laundry room).", keywords: ["housekeeping", "cleaning", "clean", "maid"] },
  { q: "Can I talk to a person?", a: "Yes! Call or text 1-343-202-5460, or message us on WhatsApp.", keywords: ["person", "human", "talk", "call", "phone", "contact", "speak"] },
];
