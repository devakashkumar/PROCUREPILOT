import { IProcurementRequirements } from "../../models/ProcurementRequest.js";

/**
 * Deterministic fallback parser for procurement requests.
 * Extracts items, quantities, units, budget in paise, priority, and constraints.
 */
export function parseRequirementsFallback(text: string): IProcurementRequirements {
  const normalized = text.toLowerCase();

  // 1. Parse Budget
  let amountPaise: number | null = null;

  // Lakhs format: "1.5 lakh", "2 lakhs"
  const lakhMatch = text.match(/(?:(?:budget|under|max(?:imum)?|total)\s*(?:is|of|[:=])?\s*)?(?:₹|rs\.?|inr)?\s*([0-9]+(?:\.[0-9]+)?)\s*(?:lakh|lac|lakhs|lacs)/i);
  if (lakhMatch && lakhMatch[1]) {
    const lakhs = parseFloat(lakhMatch[1]);
    amountPaise = Math.round(lakhs * 100000 * 100);
  }

  // K format: "15k", "20 k"
  if (amountPaise === null) {
    const kMatch = text.match(/(?:(?:budget|under|max(?:imum)?|total)\s*(?:is|of|[:=])?\s*)?(?:₹|rs\.?|inr)?\s*([0-9]+(?:\.[0-9]+)?)\s*k\b/i);
    if (kMatch && kMatch[1]) {
      const k = parseFloat(kMatch[1]);
      amountPaise = Math.round(k * 1000 * 100);
    }
  }

  // Explicit currency symbol / prefix: "₹15,000", "Rs 25000", "under Rs 15000", "under 15,000"
  if (amountPaise === null) {
    const currencyMatch = text.match(
      /(?:(?:under|budget|max(?:imum)?|total)\s*[:=]?\s*)?(?:₹|rs\.?|inr)\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)/i
    );
    if (currencyMatch && currencyMatch[1]) {
      const rawNum = currencyMatch[1].replace(/,/g, "");
      amountPaise = Math.round(parseFloat(rawNum) * 100);
    }
  }

  // Generic "under 15000" or "budget 15000" without currency symbol
  if (amountPaise === null) {
    const genericBudgetMatch = text.match(
      /(?:under|budget|max(?:imum)?|total)\s*[:=]?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)/i
    );
    if (genericBudgetMatch && genericBudgetMatch[1]) {
      const rawNum = genericBudgetMatch[1].replace(/,/g, "");
      const num = parseFloat(rawNum);
      if (num >= 50) {
        amountPaise = Math.round(num * 100);
      }
    }
  }

  // 2. Parse Priority
  let priority: "cheapest" | "reliable" | "balanced" | "fastest" = "balanced";
  if (/\b(reliable|reliability|quality|trusted|verified|reputable)\b/i.test(normalized)) {
    priority = "reliable";
  } else if (/\b(cheapest|cheaper|lowest price|economy|budget-friendly|cheap)\b/i.test(normalized)) {
    priority = "cheapest";
  } else if (/\b(fastest|fast|urgent|quick|speed|asap|rapid)\b/i.test(normalized)) {
    priority = "fastest";
  }

  // 3. Parse Constraints
  let maxDeliveryDays: number | null = null;
  const deliveryMatch = text.match(/(?:within|in|under)\s*([0-9]+)\s*(?:day|days)/i);
  if (deliveryMatch && deliveryMatch[1]) {
    maxDeliveryDays = parseInt(deliveryMatch[1], 10);
  }

  let minReliability: number | null = null;
  const relMatch = text.match(/([0-9]{2})\s*%\s*(?:reliability|trust|score)/i);
  if (relMatch && relMatch[1]) {
    minReliability = parseInt(relMatch[1], 10);
  }

  // 4. Parse Items & Quantities
  const knownProducts = [
    { pattern: /(?:cooking\s*oil|sunflower\s*oil|mustard\s*oil|refined\s*oil|oil)/i, name: "Cooking Oil 1L", category: "Cooking Oils", unit: "litre" },
    { pattern: /(?:basmati\s*rice|sona\s*masoori|chawal|rice)/i, name: "Rice 5kg", category: "Grains", unit: "packet" },
    { pattern: /(?:detergent\s*powder|washing\s*powder|detergent\s*liquid|detergent|surf)/i, name: "Detergent 1kg", category: "Household & Cleaning", unit: "unit" },
    { pattern: /(?:sugar|cheeni)/i, name: "Sugar 1kg", category: "Grains", unit: "kg" },
    { pattern: /(?:wheat\s*flour|atta)/i, name: "Wheat Flour 5kg", category: "Grains", unit: "packet" },
    { pattern: /(?:tea|chai\s*patti)/i, name: "Tea 500g", category: "Beverages & Snacks", unit: "packet" },
    { pattern: /(?:salt|namak)/i, name: "Salt 1kg", category: "Spices & Seasoning", unit: "kg" },
    { pattern: /(?:toor\s*dal|arhar\s*dal)/i, name: "Toor Dal 1kg", category: "Grains", unit: "kg" },
    { pattern: /(?:chana\s*dal)/i, name: "Chana Dal 1kg", category: "Grains", unit: "kg" },
    { pattern: /(?:ghee|cow\s*ghee)/i, name: "Ghee 1L", category: "Cooking Oils", unit: "litre" },
    { pattern: /(?:turmeric|haldi)/i, name: "Turmeric Powder 200g", category: "Spices & Seasoning", unit: "packet" },
    { pattern: /(?:red\s*chilli|chilli\s*powder)/i, name: "Red Chilli Powder 200g", category: "Spices & Seasoning", unit: "packet" },
    { pattern: /(?:dishwash|vim)/i, name: "Dishwash Liquid 750ml", category: "Household & Cleaning", unit: "unit" },
    { pattern: /(?:floor\s*cleaner|lizol)/i, name: "Floor Cleaner 1L", category: "Household & Cleaning", unit: "litre" },
    { pattern: /(?:handwash)/i, name: "Handwash 500ml", category: "Household & Cleaning", unit: "unit" },
    { pattern: /(?:tissue\s*box|tissues)/i, name: "Tissue Box", category: "Household & Cleaning", unit: "box" },
    { pattern: /(?:garbage\s*bags|trash\s*bags)/i, name: "Garbage Bags Roll", category: "Household & Cleaning", unit: "packet" },
    { pattern: /(?:a4\s*paper|paper\s*ream)/i, name: "A4 Paper Ream", category: "Office Supplies", unit: "packet" },
    { pattern: /(?:ball\s*pens|pens)/i, name: "Ball Pens Box of 50", category: "Office Supplies", unit: "box" },
    { pattern: /(?:marker\s*set|markers)/i, name: "Marker Set", category: "Office Supplies", unit: "box" },
    { pattern: /(?:printer\s*toner|toner)/i, name: "Printer Toner", category: "Office Supplies", unit: "piece" },
    { pattern: /(?:water\s*bottles|mineral\s*water)/i, name: "Mineral Water Case of 12", category: "Beverages & Snacks", unit: "box" },
    { pattern: /(?:soft\s*drinks|coca-cola|coke)/i, name: "Soft Drink Case of 24", category: "Beverages & Snacks", unit: "box" },
    { pattern: /(?:paper\s*cups)/i, name: "Paper Cups Pack of 100", category: "Office Supplies", unit: "packet" },
  ];

  // Split input into clauses/segments by commas, "and", "&", "+", or newlines
  const clauses = text.split(/[,;\n]|\band\b|&|\+/i);
  const items: IProcurementRequirements["items"] = [];
  const addedNames = new Set<string>();

  for (const clause of clauses) {
    for (const prod of knownProducts) {
      if (addedNames.has(prod.name)) continue;

      // Ensure NO other numbers between quantity and product keyword
      const itemRegex = new RegExp(
        `\\b(\\d+)\\s*(?:units?|packets?|pkts?|bags?|boxes?|litres?|l|kg|pieces?|pcs?)?\\s*(?:of)?\\s*(?:[a-zA-Z\\s]*?)(${prod.pattern.source})\\b`,
        "i"
      );
      const match = clause.match(itemRegex);

      if (match && match[1]) {
        const quantity = Math.min(100000, parseInt(match[1], 10));
        if (quantity > 0) {
          items.push({
            name: prod.name,
            normalizedName: prod.name.toLowerCase(),
            quantity,
            unit: prod.unit,
            category: prod.category,
            notes: null,
          });
          addedNames.add(prod.name);
          break;
        }
      }
    }
  }

  // Clarifications
  const clarifications: string[] = [];
  if (amountPaise === null) {
    clarifications.push("No budget was specified. Would you like to set a maximum spending limit?");
  }
  if (items.length === 0) {
    clarifications.push("We couldn't detect specific items in your request. Please specify item quantities and names.");
  }

  return {
    items,
    budget: {
      amountPaise,
      currency: "INR",
    },
    priority,
    constraints: {
      maxDeliveryDays,
      minReliability,
      preferredSuppliers: [],
      excludedSuppliers: [],
    },
    clarifications,
  };
}
