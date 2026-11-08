import bcrypt from "bcryptjs";
import { connectDb, disconnectDb } from "../config/db.js";
import { logger } from "../config/logger.js";
import { User } from "../models/User.js";
import { Business } from "../models/Business.js";
import { Product } from "../models/Product.js";
import { Supplier } from "../models/Supplier.js";
import { SupplierOffer } from "../models/SupplierOffer.js";
import { ProcurementRequest } from "../models/ProcurementRequest.js";
import { PurchaseOrder } from "../models/PurchaseOrder.js";
import { Payment } from "../models/Payment.js";
import { WebhookEvent } from "../models/WebhookEvent.js";
import { Counter } from "../models/Counter.js";
import { SEED_PRODUCTS } from "./data/products.js";
import { SEED_SUPPLIERS } from "./data/suppliers.js";
import { fetchDummyJsonImages, getProductImage } from "./dummyjson.js";

// Deterministic Pseudo-Random Number Generator (Mulberry32)
class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }
}

export async function runSeed(reset = false): Promise<void> {
  logger.info(`Starting database seeding (reset=${reset})...`);
  await connectDb();

  if (reset) {
    logger.warn("Wiping existing collections...");
    await Promise.all([
      User.deleteMany({}),
      Business.deleteMany({}),
      Product.deleteMany({}),
      Supplier.deleteMany({}),
      SupplierOffer.deleteMany({}),
      ProcurementRequest.deleteMany({}),
      PurchaseOrder.deleteMany({}),
      Payment.deleteMany({}),
      WebhookEvent.deleteMany({}),
      Counter.deleteMany({}),
    ]);
    logger.info("Existing collections cleared.");
  }

  // 1. Fetch DummyJSON images with local fallback
  const dummyImages = await fetchDummyJsonImages();

  // 2. Upsert Products
  logger.info("Upserting catalog products...");
  const productDocs = [];
  for (const p of SEED_PRODUCTS) {
    const imageUrl = getProductImage(p.name, p.category, dummyImages);
    const doc = await Product.findOneAndUpdate(
      { slug: p.slug },
      {
        name: p.name,
        slug: p.slug,
        category: p.category,
        brand: p.brand,
        unit: p.unit,
        packSize: p.packSize,
        description: p.description,
        aliases: p.aliases,
        imageUrl,
        tags: p.tags,
        isActive: true,
      },
      { upsert: true, new: true }
    );
    productDocs.push({ doc, basePricePaise: p.basePricePaise });
  }
  logger.info(`Saved ${productDocs.length} products.`);

  // 3. Upsert Suppliers
  logger.info("Upserting suppliers...");
  const supplierDocs = [];
  for (const s of SEED_SUPPLIERS) {
    const doc = await Supplier.findOneAndUpdate(
      { slug: s.slug },
      {
        name: s.name,
        slug: s.slug,
        city: s.city,
        state: s.state,
        reliabilityScore: s.reliabilityScore,
        onTimeDeliveryRate: s.onTimeDeliveryRate,
        avgDeliveryDays: s.avgDeliveryDays,
        shippingFeePaise: s.shippingFeePaise,
        freeShippingAbovePaise: s.freeShippingAbovePaise,
        minOrderValuePaise: s.minOrderValuePaise,
        rating: s.rating,
        verified: s.verified,
        tags: s.tags,
        contact: s.contact,
      },
      { upsert: true, new: true }
    );
    supplierDocs.push(doc);
  }
  logger.info(`Saved ${supplierDocs.length} suppliers.`);

  // 4. Generate Supplier Offers deterministically
  logger.info("Generating reproducible supplier offers...");
  const rng = new SeededRandom(20260401); // Fixed seed for absolute reproducibility
  let offerCount = 0;

  for (const { doc: product, basePricePaise } of productDocs) {
    for (const supplier of supplierDocs) {
      // Not every supplier carries everything: office suppliers don't carry grocery, etc.
      const isOfficeProduct = product.category === "Office Supplies";
      const isOfficeSupplier = supplier.slug === "national-stationery-mart";

      if (isOfficeProduct && !isOfficeSupplier && rng.next() > 0.25) {
        continue;
      }
      if (!isOfficeProduct && isOfficeSupplier) {
        continue;
      }

      // Base multiplier depends on supplier profile
      let multiplier = rng.range(0.92, 1.12);
      if (supplier.slug === "bharat-wholesalers") {
        multiplier *= 0.94; // Economy pricing
      } else if (supplier.slug === "apex-prime-logistics") {
        multiplier *= 1.05; // Premium quality pricing
      }

      const pricePaise = Math.round(basePricePaise * multiplier);

      // Stock quantity: 40 to 600, with 7% deliberately low or zero stock for edge testing
      const isLowStock = rng.next() < 0.07;
      const stockQty = isLowStock ? rng.int(0, 10) : rng.int(40, 600);

      // Minimum order quantity: 1 to 10
      const moq = supplier.slug === "megatrade-fmcg-hub" ? rng.int(5, 10) : rng.int(1, 3);

      // Delivery days centered around supplier avg
      const deliveryDays = Math.max(1, supplier.avgDeliveryDays + rng.int(-1, 1));

      // Optional bulk discount tier
      const hasBulkTier = supplier.slug === "megatrade-fmcg-hub" || rng.next() < 0.3;
      const bulkTiers = hasBulkTier
        ? [
            {
              minQty: moq * 4,
              pricePaise: Math.round(pricePaise * 0.93),
            },
          ]
        : [];

      await SupplierOffer.findOneAndUpdate(
        { productId: product._id, supplierId: supplier._id },
        {
          productId: product._id,
          supplierId: supplier._id,
          pricePaise,
          stockQty,
          moq,
          deliveryDays,
          leadTimeNote: deliveryDays <= 2 ? "Same or next day dispatch" : "Standard road logistics",
          bulkTiers,
          isActive: true,
        },
        { upsert: true, new: true }
      );
      offerCount++;
    }
  }
  logger.info(`Generated and indexed ${offerCount} supplier offers.`);

  // 5. Create Demo User & Business
  logger.info("Setting up demo account...");
  const demoEmail = "demo@procurepilot.ai";
  const existingUser = await User.findOne({ email: demoEmail });

  if (!existingUser) {
    const passwordHash = await bcrypt.hash("Demo@12345", 12);
    const businessId = new (await import("mongoose")).default.Types.ObjectId();
    const userId = new (await import("mongoose")).default.Types.ObjectId();

    const business = await Business.create({
      _id: businessId,
      ownerId: userId,
      name: "Sharma Supermart",
      type: "supermarket",
      city: "Jaipur",
      gstin: "08AABCS1429B1Z0",
      monthlyBudgetPaise: 20000000, // ₹2,00,000
      currency: "INR",
      preferences: {
        priority: "balanced",
        minReliability: 70,
      },
    });

    await User.create({
      _id: userId,
      name: "Rajesh Sharma",
      email: demoEmail,
      passwordHash,
      role: "owner",
      businessId: business._id,
      lastLoginAt: new Date(),
    });

    logger.info("Demo account created: demo@procurepilot.ai / Demo@12345");
  } else {
    logger.info("Demo account already present.");
  }

  logger.info("✅ Database seeding completed successfully.");
}

// Allow CLI invocation directly
if (process.argv[1]?.endsWith("seed.ts") || process.argv[1]?.endsWith("seed.js")) {
  const isReset = process.argv.includes("--reset");
  runSeed(isReset)
    .then(async () => {
      await disconnectDb();
      process.exit(0);
    })
    .catch(async (err) => {
      // eslint-disable-next-line no-console
      console.error("Seeding failed:", err);
      await disconnectDb();
      process.exit(1);
    });
}
