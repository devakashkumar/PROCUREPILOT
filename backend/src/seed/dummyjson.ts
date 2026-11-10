import { logger } from "../config/logger.js";

// Local high-quality Unsplash CDN category fallback images (clean, fast, grocery-specific)
const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  Grains: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
  "Cooking Oils": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
  "Household & Cleaning": "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80",
  "Spices & Seasoning": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80",
  "Beverages & Snacks": "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=80",
  "Personal Care": "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
  "Office Supplies": "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80",
  default: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
};

interface DummyJsonProduct {
  id: number;
  title: string;
  category: string;
  thumbnail: string;
}

export async function fetchDummyJsonImages(): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch("https://dummyjson.com/products/category/groceries?limit=50", {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = (await res.json()) as { products?: DummyJsonProduct[] };
      if (data.products && Array.isArray(data.products)) {
        for (const item of data.products) {
          if (item.title && item.thumbnail) {
            imageMap.set(item.title.toLowerCase(), item.thumbnail);
          }
        }
        logger.info(`Fetched ${imageMap.size} product images from DummyJSON`);
      }
    }
  } catch (err) {
    logger.warn("DummyJSON unreachable or timed out. Using local category image fallback.");
  }

  return imageMap;
}

export function getProductImage(
  productName: string,
  category: string,
  dummyMap: Map<string, string>
): string {
  const lowerName = productName.toLowerCase();

  // Check direct or substring match from DummyJSON
  for (const [title, url] of dummyMap.entries()) {
    if (lowerName.includes(title) || title.includes(lowerName)) {
      return url;
    }
  }

  // Fallback to category image
  return CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES.default!;
}
