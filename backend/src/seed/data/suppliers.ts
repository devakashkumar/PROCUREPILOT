export interface SeedSupplier {
  name: string;
  slug: string;
  city: string;
  state: string;
  reliabilityScore: number;
  onTimeDeliveryRate: number;
  avgDeliveryDays: number;
  shippingFeePaise: number;
  freeShippingAbovePaise: number;
  minOrderValuePaise: number;
  rating: number;
  verified: boolean;
  tags: string[];
  contact: {
    email: string;
    phone: string;
  };
  notes: string;
}

export const SEED_SUPPLIERS: SeedSupplier[] = [
  {
    name: "Apex Prime Logistics",
    slug: "apex-prime-logistics",
    city: "Jaipur",
    state: "Rajasthan",
    reliabilityScore: 96,
    onTimeDeliveryRate: 0.98,
    avgDeliveryDays: 2,
    shippingFeePaise: 35000, // ₹350
    freeShippingAbovePaise: 500000, // Free above ₹5,000
    minOrderValuePaise: 150000, // ₹1,500
    rating: 4.9,
    verified: true,
    tags: ["premium", "reliable", "fast", "local"],
    contact: {
      email: "orders@apexprime.in",
      phone: "+91 141 234 5678",
    },
    notes: "Premium tier with highest reliability and rapid dispatch",
  },
  {
    name: "Bharat Wholesalers & Mandi",
    slug: "bharat-wholesalers",
    city: "Delhi",
    state: "Delhi",
    reliabilityScore: 62,
    onTimeDeliveryRate: 0.72,
    avgDeliveryDays: 5,
    shippingFeePaise: 20000, // ₹200
    freeShippingAbovePaise: 800000, // Free above ₹8,000
    minOrderValuePaise: 100000, // ₹1,000
    rating: 3.7,
    verified: true,
    tags: ["budget", "bulk-grain", "economy"],
    contact: {
      email: "sales@bharatwholesalers.com",
      phone: "+91 11 4567 8901",
    },
    notes: "Lowest base rates but higher delivery times and occasional delays",
  },
  {
    name: "Express Kirana Supply Co.",
    slug: "express-kirana-supply",
    city: "Jaipur",
    state: "Rajasthan",
    reliabilityScore: 88,
    onTimeDeliveryRate: 0.94,
    avgDeliveryDays: 1,
    shippingFeePaise: 25000, // ₹250
    freeShippingAbovePaise: 400000, // Free above ₹4,000
    minOrderValuePaise: 100000,
    rating: 4.6,
    verified: true,
    tags: ["same-day", "fastest", "local", "groceries"],
    contact: {
      email: "dispatch@expresskirana.com",
      phone: "+91 141 987 6543",
    },
    notes: "Fastest turnaround time for urgent replenishment",
  },
  {
    name: "MegaTrade FMCG Hub",
    slug: "megatrade-fmcg-hub",
    city: "Ahmedabad",
    state: "Gujarat",
    reliabilityScore: 84,
    onTimeDeliveryRate: 0.89,
    avgDeliveryDays: 3,
    shippingFeePaise: 40000, // ₹400
    freeShippingAbovePaise: 1000000, // Free above ₹10,000
    minOrderValuePaise: 250000, // ₹2,500
    rating: 4.4,
    verified: true,
    tags: ["bulk-tiers", "fmcg", "high-volume"],
    contact: {
      email: "b2b@megatradehub.com",
      phone: "+91 79 3322 1100",
    },
    notes: "High MOQ with attractive tiered volume discounts",
  },
  {
    name: "Jaipur Central Mandi Traders",
    slug: "jaipur-central-mandi",
    city: "Jaipur",
    state: "Rajasthan",
    reliabilityScore: 78,
    onTimeDeliveryRate: 0.82,
    avgDeliveryDays: 2,
    shippingFeePaise: 15000, // ₹150
    freeShippingAbovePaise: 300000, // Free above ₹3,000
    minOrderValuePaise: 50000, // ₹500
    rating: 4.1,
    verified: true,
    tags: ["local", "staples", "mandi", "fresh"],
    contact: {
      email: "contact@jaipurmandi.org",
      phone: "+91 141 554 3322",
    },
    notes: "Well-connected local agricultural produce and staple supplier",
  },
  {
    name: "Vedic Pure Essentials",
    slug: "vedic-pure-essentials",
    city: "Indore",
    state: "Madhya Pradesh",
    reliabilityScore: 92,
    onTimeDeliveryRate: 0.95,
    avgDeliveryDays: 3,
    shippingFeePaise: 30000, // ₹300
    freeShippingAbovePaise: 600000, // Free above ₹6,000
    minOrderValuePaise: 120000,
    rating: 4.8,
    verified: true,
    tags: ["ghee", "spices", "quality", "certified"],
    contact: {
      email: "procure@vedicessentials.in",
      phone: "+91 731 400 9988",
    },
    notes: "Specializes in pure dairy, cold-pressed oils, and premium spices",
  },
  {
    name: "National Stationery & Office Mart",
    slug: "national-stationery-mart",
    city: "Gurugram",
    state: "Haryana",
    reliabilityScore: 85,
    onTimeDeliveryRate: 0.91,
    avgDeliveryDays: 3,
    shippingFeePaise: 25000,
    freeShippingAbovePaise: 500000,
    minOrderValuePaise: 100000,
    rating: 4.5,
    verified: true,
    tags: ["office", "stationery", "paper", "packaging"],
    contact: {
      email: "support@nationalstationery.com",
      phone: "+91 124 678 1234",
    },
    notes: "Reliable B2B source for all paper, printer, and admin supplies",
  },
];
