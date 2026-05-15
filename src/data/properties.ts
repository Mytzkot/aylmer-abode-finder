// Static property metadata; live availability comes from rooms table.
import imgAmour from "@/assets/property-amour.jpg";
import imgConrad from "@/assets/property-conrad.jpg";
import imgColline from "@/assets/property-colline.jpg";

export interface PropertyMeta {
  id: string;
  address: string;
  city: string;
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
  phone: "+13439874565",
  whatsapp: "https://wa.me/13439874565",
  sms: "sms:+13439874565",
  tel: "tel:+13439874565",
  messenger: "https://m.me/389262180946566",
  facebook: "https://facebook.com/ZorbaRentals/",
  youtube: "https://youtube.com/@shakeshake-m7t",
  email: "mailto:zorbagraphic@gmail.com",
  website: "https://zorbaco.com",
};

export const FAQ_KB: { q: string; a: string; keywords: string[] }[] = [
  { q: "Is Wi-Fi included?", a: "Yes — high-speed Wi-Fi is included in every room at no extra cost.", keywords: ["wifi", "wi-fi", "internet", "wi fi"] },
  { q: "What furniture is in the room?", a: "Each room includes a queen bed, smart TV, mini-fridge, coffee maker, keypad lock, desk, and wardrobe.", keywords: ["furnish", "furniture", "bed", "tv", "fridge", "desk"] },
  { q: "Are utilities included?", a: "Yes — heating, electricity, water, and Wi-Fi are all included.", keywords: ["utilities", "heat", "electric", "water", "hydro"] },
  { q: "Do you check credit?", a: "No credit check required. Only the first month's rent is needed to move in.", keywords: ["credit", "score", "check"] },
  { q: "Do you allow pets?", a: "No pets are allowed at any of our properties.", keywords: ["pet", "dog", "cat", "animal"] },
  { q: "How is the bus access?", a: "Direct STO buses (40, 50, 59, 800) get you to downtown Ottawa in about 15 minutes.", keywords: ["bus", "transit", "sto", "transport"] },
];
