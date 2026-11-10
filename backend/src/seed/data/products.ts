export interface SeedProduct {
  name: string;
  slug: string;
  category: string;
  brand: string;
  unit: "unit" | "kg" | "packet" | "litre" | "box" | "piece";
  packSize: string;
  description: string;
  aliases: string[];
  tags: string[];
  basePricePaise: number;
}

export const SEED_PRODUCTS: SeedProduct[] = [
  // --- Cooking Oils ---
  {
    name: "Fortune Sunlite Refined Sunflower Oil",
    slug: "fortune-sunflower-oil-1l",
    category: "Cooking Oils",
    brand: "Fortune",
    unit: "litre",
    packSize: "1 L",
    description: "Light and healthy refined sunflower oil rich in Vitamin E.",
    aliases: ["cooking oil", "sunflower oil", "refined oil", "oil 1l", "refined sunflower oil"],
    tags: ["cooking", "oil", "sunflower", "staple"],
    basePricePaise: 13500, // ₹135
  },
  {
    name: "Dhara Kachi Ghani Mustard Oil",
    slug: "dhara-mustard-oil-1l",
    category: "Cooking Oils",
    brand: "Dhara",
    unit: "litre",
    packSize: "1 L",
    description: "Traditional pungent kachi ghani cold-pressed mustard oil.",
    aliases: ["mustard oil", "sarson ka tel", "cooking oil", "kachi ghani"],
    tags: ["mustard", "oil", "traditional", "cooking"],
    basePricePaise: 14500, // ₹145
  },
  {
    name: "Saffola Gold Pro Healthy Lifestyle Oil",
    slug: "saffola-gold-oil-1l",
    category: "Cooking Oils",
    brand: "Saffola",
    unit: "litre",
    packSize: "1 L",
    description: "Blended cooking oil with antioxidant power and natural goodness.",
    aliases: ["saffola oil", "blended oil", "heart oil", "cooking oil"],
    tags: ["oil", "premium", "healthy"],
    basePricePaise: 16500, // ₹165
  },
  {
    name: "Gemini Refined Soybean Oil",
    slug: "gemini-soybean-oil-1l",
    category: "Cooking Oils",
    brand: "Gemini",
    unit: "litre",
    packSize: "1 L",
    description: "Refined soyabean oil fortified with vitamins A and D.",
    aliases: ["soybean oil", "soya oil", "cooking oil", "refined oil"],
    tags: ["soybean", "oil", "value"],
    basePricePaise: 12500, // ₹125
  },

  // --- Rice & Grains ---
  {
    name: "India Gate Basmati Rice Feast Rozzana",
    slug: "india-gate-basmati-rice-5kg",
    category: "Grains",
    brand: "India Gate",
    unit: "packet",
    packSize: "5 kg",
    description: "Fluffy and aromatic medium grain basmati rice for daily meals.",
    aliases: ["rice", "basmati rice", "rozzana rice", "chawal", "5kg rice"],
    tags: ["rice", "basmati", "staple", "grain"],
    basePricePaise: 33000, // ₹330
  },
  {
    name: "Fortune Everyday Basmati Rice",
    slug: "fortune-everyday-basmati-5kg",
    category: "Grains",
    brand: "Fortune",
    unit: "packet",
    packSize: "5 kg",
    description: "Specially aged aromatic basmati rice for biryanis and everyday pulao.",
    aliases: ["rice", "everyday rice", "basmati 5kg", "chawal 5kg"],
    tags: ["rice", "basmati", "daily"],
    basePricePaise: 31000, // ₹310
  },
  {
    name: "Royal Sona Masoori Rice Premium",
    slug: "royal-sona-masoori-rice-5kg",
    category: "Grains",
    brand: "Royal",
    unit: "packet",
    packSize: "5 kg",
    description: "Lightweight and aromatic South Indian sona masoori white rice.",
    aliases: ["sona masoori", "raw rice", "white rice", "rice 5kg"],
    tags: ["rice", "sona masoori", "staple"],
    basePricePaise: 29000, // ₹290
  },
  {
    name: "Aashirvaad Superior MP Sharbati Atta",
    slug: "aashirvaad-sharbati-atta-5kg",
    category: "Grains",
    brand: "Aashirvaad",
    unit: "packet",
    packSize: "5 kg",
    description: "100% pure whole wheat flour ground from heavy golden MP grains.",
    aliases: ["atta", "wheat flour", "gehu atta", "flour 5kg"],
    tags: ["flour", "atta", "staple"],
    basePricePaise: 24000, // ₹240
  },
  {
    name: "Pillsbury Chakki Fresh Whole Wheat Atta",
    slug: "pillsbury-chakki-fresh-atta-5kg",
    category: "Grains",
    brand: "Pillsbury",
    unit: "packet",
    packSize: "5 kg",
    description: "High fiber traditional chakki ground whole wheat flour.",
    aliases: ["atta", "pillsbury atta", "wheat flour"],
    tags: ["flour", "atta"],
    basePricePaise: 23000, // ₹230
  },

  // --- Detergent & Cleaning ---
  {
    name: "Surf Excel Easy Wash Detergent Powder",
    slug: "surf-excel-easy-wash-1kg",
    category: "Household & Cleaning",
    brand: "Surf Excel",
    unit: "unit",
    packSize: "1 kg",
    description: "Superior stain removal with the power of 10 hands.",
    aliases: ["detergent", "surf excel", "detergent powder", "washing powder", "surf"],
    tags: ["detergent", "washing", "laundry", "cleaning"],
    basePricePaise: 12500, // ₹125
  },
  {
    name: "Ariel Matic Front & Top Load Detergent",
    slug: "ariel-matic-detergent-1kg",
    category: "Household & Cleaning",
    brand: "Ariel",
    unit: "unit",
    packSize: "1 kg",
    description: "Enzyme-powered deep cleaning detergent powder.",
    aliases: ["detergent", "ariel detergent", "detergent powder", "ariel matic"],
    tags: ["detergent", "laundry"],
    basePricePaise: 14000, // ₹140
  },
  {
    name: "Tide Plus Double Power Detergent Lemon & Mint",
    slug: "tide-plus-double-power-1kg",
    category: "Household & Cleaning",
    brand: "Tide",
    unit: "unit",
    packSize: "1 kg",
    description: "Outstanding whiteness with fresh fragrance.",
    aliases: ["tide", "tide detergent", "detergent", "washing powder"],
    tags: ["detergent", "economy", "cleaning"],
    basePricePaise: 9500, // ₹95
  },
  {
    name: "Surf Excel Matic Liquid Detergent Front Load",
    slug: "surf-excel-matic-liquid-1l",
    category: "Household & Cleaning",
    brand: "Surf Excel",
    unit: "litre",
    packSize: "1 L",
    description: "Liquid detergent designed for washing machines, dissolving instantly.",
    aliases: ["detergent liquid", "liquid detergent", "surf liquid", "liquid surf"],
    tags: ["detergent", "liquid", "laundry"],
    basePricePaise: 21000, // ₹210
  },
  {
    name: "Vim Dishwash Liquid Gel Lemon",
    slug: "vim-dishwash-liquid-750ml",
    category: "Household & Cleaning",
    brand: "Vim",
    unit: "unit",
    packSize: "750 ml",
    description: "Degreases tough burnt food with natural lemon extract.",
    aliases: ["dishwash", "vim gel", "dish cleaner", "bartan dhone wala liquid"],
    tags: ["dishwash", "kitchen", "cleaning"],
    basePricePaise: 15500, // ₹155
  },
  {
    name: "Lizol Disinfectant Surface & Floor Cleaner Citrus",
    slug: "lizol-floor-cleaner-citrus-1l",
    category: "Household & Cleaning",
    brand: "Lizol",
    unit: "litre",
    packSize: "1 L",
    description: "Kills 99.9% of germs and leaves shiny streak-free floors.",
    aliases: ["floor cleaner", "lizol", "surface cleaner", "disinfectant"],
    tags: ["cleaning", "floor", "disinfectant"],
    basePricePaise: 18500, // ₹185
  },
  {
    name: "Dettol Liquid Handwash Refill Original",
    slug: "dettol-handwash-refill-500ml",
    category: "Household & Cleaning",
    brand: "Dettol",
    unit: "unit",
    packSize: "500 ml",
    description: "100% germ protection liquid hand wash refill pouch.",
    aliases: ["handwash", "dettol refill", "hand soap", "liquid handwash"],
    tags: ["handwash", "hygiene", "soap"],
    basePricePaise: 9900, // ₹99
  },
  {
    name: "Origami Soft Facial Tissue Box",
    slug: "origami-facial-tissue-box",
    category: "Household & Cleaning",
    brand: "Origami",
    unit: "box",
    packSize: "200 pulls",
    description: "Ultra soft, virgin cellulose 2-ply facial tissue paper box.",
    aliases: ["tissue box", "tissues", "facial tissue", "paper tissue"],
    tags: ["tissue", "paper", "hygiene"],
    basePricePaise: 8500, // ₹85
  },
  {
    name: "Shalimar Heavy Duty Oxo-Biodegradable Garbage Bags",
    slug: "shalimar-garbage-bags-roll-30",
    category: "Household & Cleaning",
    brand: "Shalimar",
    unit: "packet",
    packSize: "Roll of 30",
    description: "Leak-proof medium size black dustbin trash bags.",
    aliases: ["garbage bags", "trash bags", "dustbin bags", "kooda bag"],
    tags: ["garbage", "cleaning", "bags"],
    basePricePaise: 11000, // ₹110
  },

  // --- Staples: Pulses, Sugar, Salt & Ghee ---
  {
    name: "Tata Sampann Unpolished Toor Dal",
    slug: "tata-sampann-toor-dal-1kg",
    category: "Grains",
    brand: "Tata Sampann",
    unit: "kg",
    packSize: "1 kg",
    description: "Unpolished toor dal retaining natural dietary protein and fiber.",
    aliases: ["toor dal", "arhar dal", "tuvar dal", "dal 1kg"],
    tags: ["pulses", "dal", "staple"],
    basePricePaise: 16500, // ₹165
  },
  {
    name: "Tata Sampann Unpolished Chana Dal",
    slug: "tata-sampann-chana-dal-1kg",
    category: "Grains",
    brand: "Tata Sampann",
    unit: "kg",
    packSize: "1 kg",
    description: "Crisp and unpolished split chickpea lentils for rich curries.",
    aliases: ["chana dal", "bengal gram dal", "dal"],
    tags: ["pulses", "dal", "staple"],
    basePricePaise: 10500, // ₹105
  },
  {
    name: "Madhur Pure & Hygienic Refined Sugar",
    slug: "madhur-refined-sugar-1kg",
    category: "Grains",
    brand: "Madhur",
    unit: "kg",
    packSize: "1 kg",
    description: "Sulphur-free clean sparkling white refined crystal sugar.",
    aliases: ["sugar", "cheeni", "refined sugar", "white sugar"],
    tags: ["sugar", "staple", "sweetener"],
    basePricePaise: 4800, // ₹48
  },
  {
    name: "Tata Salt Vacuum Evaporated Iodised Salt",
    slug: "tata-salt-iodised-1kg",
    category: "Spices & Seasoning",
    brand: "Tata Salt",
    unit: "kg",
    packSize: "1 kg",
    description: "Desh ka namak with guaranteed iodine content for healthy family growth.",
    aliases: ["salt", "tata salt", "namak", "iodised salt"],
    tags: ["salt", "staple", "seasoning"],
    basePricePaise: 2600, // ₹26
  },
  {
    name: "Amul Pure Cow Ghee Tin",
    slug: "amul-cow-ghee-1l",
    category: "Cooking Oils",
    brand: "Amul",
    unit: "litre",
    packSize: "1 L",
    description: "Traditional granular aromatic clarified butter made from fresh cow milk.",
    aliases: ["ghee", "amul ghee", "cow ghee", "desi ghee"],
    tags: ["ghee", "dairy", "staple"],
    basePricePaise: 58000, // ₹580
  },

  // --- Spices & Seasoning ---
  {
    name: "Everest Turmeric (Haldi) Powder",
    slug: "everest-turmeric-powder-200g",
    category: "Spices & Seasoning",
    brand: "Everest",
    unit: "packet",
    packSize: "200 g",
    description: "Rich golden yellow turmeric ground from select Salem roots.",
    aliases: ["turmeric", "haldi", "turmeric powder", "haldi powder"],
    tags: ["spices", "haldi", "seasoning"],
    basePricePaise: 6500, // ₹65
  },
  {
    name: "MDH Lal Mirch Red Chilli Powder",
    slug: "mdh-red-chilli-powder-200g",
    category: "Spices & Seasoning",
    brand: "MDH",
    unit: "packet",
    packSize: "200 g",
    description: "Spicy and vibrant red chilli powder ground from sun-dried chillies.",
    aliases: ["red chilli", "mirch powder", "lal mirch", "chilli powder"],
    tags: ["spices", "chilli", "seasoning"],
    basePricePaise: 8200, // ₹82
  },

  // --- Beverages & Snacks ---
  {
    name: "Tata Tea Gold Granules",
    slug: "tata-tea-gold-500g",
    category: "Beverages & Snacks",
    brand: "Tata Tea",
    unit: "packet",
    packSize: "500 g",
    description: "Exquisite blend of Assam CTC teas with gently pressed aroma leaves.",
    aliases: ["tea", "chai patti", "tata tea", "tata gold tea", "tea 500g"],
    tags: ["tea", "beverages", "chai"],
    basePricePaise: 29000, // ₹290
  },
  {
    name: "Maggi 2-Minute Masala Noodles Pack",
    slug: "maggi-masala-noodles-12pack",
    category: "Beverages & Snacks",
    brand: "Nestle",
    unit: "packet",
    packSize: "Pack of 12",
    description: "India's favorite instant noodles infused with authentic Indian spices.",
    aliases: ["maggi", "instant noodles", "noodles pack", "maggi 12 pack"],
    tags: ["noodles", "snacks", "instant"],
    basePricePaise: 16800, // ₹168
  },
  {
    name: "Parle-G Gold Glucose Biscuits Family Pack",
    slug: "parle-g-gold-biscuits-1kg",
    category: "Beverages & Snacks",
    brand: "Parle",
    unit: "packet",
    packSize: "1 kg",
    description: "Crisp glucose biscuits filled with milk and wheat nourishment.",
    aliases: ["biscuits", "parle g", "glucose biscuits", "biscuit pack"],
    tags: ["biscuits", "snacks", "bakery"],
    basePricePaise: 11000, // ₹110
  },
  {
    name: "Bisleri Packaged Drinking Water Bottles",
    slug: "bisleri-water-case-12",
    category: "Beverages & Snacks",
    brand: "Bisleri",
    unit: "box",
    packSize: "Case of 12 x 1L",
    description: "Ozonised and mineral-fortified pure drinking water bottles.",
    aliases: ["water", "mineral water", "water case", "bisleri bottles"],
    tags: ["water", "beverage", "beverages"],
    basePricePaise: 19000, // ₹190
  },
  {
    name: "Coca-Cola Original Taste Soft Drink Cans",
    slug: "coca-cola-case-24",
    category: "Beverages & Snacks",
    brand: "Coca-Cola",
    unit: "box",
    packSize: "Case of 24 x 300ml",
    description: "Crisp and refreshing carbonated soft drink cans.",
    aliases: ["coke", "coca cola", "soft drink case", "cold drink"],
    tags: ["beverages", "soft drinks"],
    basePricePaise: 75000, // ₹750
  },
  {
    name: "Thums Up Charged Carbonated Drink",
    slug: "thums-up-2l-bottle",
    category: "Beverages & Snacks",
    brand: "Thums Up",
    unit: "litre",
    packSize: "2 L",
    description: "Thunderous, strong spicy cola soda with extra punch.",
    aliases: ["thums up", "cold drink 2l", "soft drink", "cola"],
    tags: ["beverages", "soft drinks"],
    basePricePaise: 9000, // ₹90
  },

  // --- Personal Care ---
  {
    name: "Lifebuoy Total Germ Protection Soap",
    slug: "lifebuoy-soap-pack-4",
    category: "Personal Care",
    brand: "Lifebuoy",
    unit: "packet",
    packSize: "Pack of 4 x 125g",
    description: "Antibacterial bathing bars with Active Silver formula.",
    aliases: ["soap", "bath soap", "lifebuoy", "soap pack of 4", "bathing soap"],
    tags: ["soap", "hygiene", "personal care"],
    basePricePaise: 14000, // ₹140
  },
  {
    name: "Colgate Strong Teeth Dental Cream Toothpaste",
    slug: "colgate-strong-teeth-150g",
    category: "Personal Care",
    brand: "Colgate",
    unit: "unit",
    packSize: "150 g",
    description: "Calcium-rich fluoride toothpaste for decay prevention.",
    aliases: ["toothpaste", "colgate", "paste 150g", "dant manjan"],
    tags: ["toothpaste", "oral care", "hygiene"],
    basePricePaise: 9500, // ₹95
  },

  // --- Office & Admin Supplies ---
  {
    name: "JK Copier A4 Paper Multi-Purpose Ream",
    slug: "jk-copier-a4-paper-500",
    category: "Office Supplies",
    brand: "JK Paper",
    unit: "packet",
    packSize: "Ream of 500 sheets (75 GSM)",
    description: "Bright white high opacity paper for smooth, jam-free photocopying.",
    aliases: ["a4 paper", "paper ream", "copier paper", "xerox paper", "a4 paper ream"],
    tags: ["office", "stationery", "paper"],
    basePricePaise: 32000, // ₹320
  },
  {
    name: "Reynolds 045 Fine Carabine Ball Pens Box",
    slug: "reynolds-ball-pens-box-50",
    category: "Office Supplies",
    brand: "Reynolds",
    unit: "box",
    packSize: "Box of 50 (Blue)",
    description: "Reliable classic fine point ballpoint pens for non-smudge writing.",
    aliases: ["pens", "ball pens", "ball pens box of 50", "blue pens"],
    tags: ["office", "stationery", "pens"],
    basePricePaise: 24000, // ₹240
  },
  {
    name: "Camlin Whiteboard Marker Set Assorted",
    slug: "camlin-whiteboard-markers-pack-4",
    category: "Office Supplies",
    brand: "Camlin",
    unit: "box",
    packSize: "Pack of 4 colours",
    description: "Bold refillable dry-erase markers for clear presentations.",
    aliases: ["marker set", "whiteboard markers", "markers", "board pens"],
    tags: ["office", "stationery", "marker"],
    basePricePaise: 13000, // ₹130
  },
  {
    name: "HP Laserjet Multi-Function Toner Cartridge",
    slug: "hp-laserjet-toner-cartridge",
    category: "Office Supplies",
    brand: "HP",
    unit: "piece",
    packSize: "1 Cartridge",
    description: "High yield black laserjet print toner cartridge.",
    aliases: ["toner", "printer toner", "laser toner", "printer ink"],
    tags: ["office", "printer", "toner"],
    basePricePaise: 185000, // ₹1,850
  },
  {
    name: "Eco-Friendly Biodegradable Paper Cups",
    slug: "biodegradable-paper-cups-100",
    category: "Office Supplies",
    brand: "EcoCraft",
    unit: "packet",
    packSize: "Pack of 100 (150 ml)",
    description: "Sturdy leak-proof hot beverage paper cups for office pantry.",
    aliases: ["paper cups", "disposable cups", "chai cups", "cups pack of 100"],
    tags: ["office", "pantry", "cups"],
    basePricePaise: 12000, // ₹120
  },
];
