// ============================================================
// LUXE STORE — Prisma Seed
// Run: npm run prisma:seed
// ============================================================

import { PrismaClient, StockStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── Helpers ─────────────────────────────────────────────────

function slug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function sku(prefix: string, index: number) {
  return `${prefix}-${String(index).padStart(4, "0")}`;
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function price(min: number, max: number) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function comparePrice(basePrice: number) {
  const markup = 1 + rand(15, 40) / 100;
  return parseFloat((basePrice * markup).toFixed(2));
}

// Supabase public placeholder images (will be replaced by real uploads)
const PLACEHOLDER = "https://images.unsplash.com/photo-";

const beautyImages = [
  `${PLACEHOLDER}1541807084-5c52e6e76cf0?w=600&q=80`,
  `${PLACEHOLDER}1596462502278-27bfdc403348?w=600&q=80`,
  `${PLACEHOLDER}1556228720-195a672e8a03?w=600&q=80`,
  `${PLACEHOLDER}1571781926291-c477ebfd024b?w=600&q=80`,
  `${PLACEHOLDER}1616394584738-fc6e612e71b9?w=600&q=80`,
  `${PLACEHOLDER}1512496015851-a90fb38ba796?w=600&q=80`,
  `${PLACEHOLDER}1522335789203-aabd1fc54bc9?w=600&q=80`,
  `${PLACEHOLDER}1583241800698-e8ab01830a22?w=600&q=80`,
  `${PLACEHOLDER}1631730486544-8f05edc3b6cc?w=600&q=80`,
  `${PLACEHOLDER}1598440947619-2c35fc9aa908?w=600&q=80`,
];

const techImages = [
  `${PLACEHOLDER}1505740420928-5e560c06d30e?w=600&q=80`,
  `${PLACEHOLDER}1585771724684-38269d6639fd?w=600&q=80`,
  `${PLACEHOLDER}1526406915894-7bcd65f60845?w=600&q=80`,
  `${PLACEHOLDER}1593642632559-0c6d3fc62b89?w=600&q=80`,
  `${PLACEHOLDER}1546435770-a3e426bf472b?w=600&q=80`,
  `${PLACEHOLDER}1484704849700-f032a568e944?w=600&q=80`,
  `${PLACEHOLDER}1550745648-6d2b1939e6e6?w=600&q=80`,
  `${PLACEHOLDER}1601524909162-71059dfc5e6e?w=600&q=80`,
];

function pickImg(arr: string[], i: number) {
  return arr[i % arr.length];
}

// ─── Main ─────────────────────────────────────────────────────

async function main() {
  console.log("🌱  Seeding Luxe Store database…");

  // ── 1. Admin User ─────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@luxestore.com" },
    update: {},
    create: {
      email: "admin@luxestore.com",
      name: "Store Admin",
      role: Role.SUPER_ADMIN,
      passwordHash: adminPassword,
      emailVerified: new Date(),
    },
  });
  console.log("✓  Admin user:", admin.email);

  // Demo customer
  const customerPassword = await bcrypt.hash("Demo@123456", 12);
  await prisma.user.upsert({
    where: { email: "demo@luxestore.com" },
    update: {},
    create: {
      email: "demo@luxestore.com",
      name: "Demo Customer",
      role: Role.USER,
      passwordHash: customerPassword,
      emailVerified: new Date(),
    },
  });

  // ── 2. Categories ─────────────────────────────────────────
  const beautyCategory = await prisma.category.upsert({
    where: { slug: "beauty" },
    update: {},
    create: {
      name: "Beauty",
      slug: "beauty",
      description: "Luxury beauty, skincare & cosmetics",
      image: beautyImages[0],
      sortOrder: 1,
    },
  });

  const techCategory = await prisma.category.upsert({
    where: { slug: "tech" },
    update: {},
    create: {
      name: "Tech",
      slug: "tech",
      description: "Premium electronics & gadgets",
      image: techImages[0],
      sortOrder: 2,
    },
  });

  // Beauty subcategories
  const beautySubcats = [
    { name: "Skincare",     sortOrder: 1 },
    { name: "Makeup",       sortOrder: 2 },
    { name: "Hair Care",    sortOrder: 3 },
    { name: "Body Care",    sortOrder: 4 },
    { name: "Perfume",      sortOrder: 5 },
    { name: "Beauty Tools", sortOrder: 6 },
  ];

  const beautySubMap: Record<string, string> = {};
  for (const sc of beautySubcats) {
    const cat = await prisma.category.upsert({
      where: { slug: slug(sc.name) },
      update: {},
      create: {
        name: sc.name,
        slug: slug(sc.name),
        parentId: beautyCategory.id,
        sortOrder: sc.sortOrder,
        image: pickImg(beautyImages, sc.sortOrder),
      },
    });
    beautySubMap[sc.name] = cat.id;
  }

  // Tech subcategories
  const techSubcats = [
    { name: "Headphones",   sortOrder: 1 },
    { name: "Cameras",      sortOrder: 2 },
    { name: "Tablets",      sortOrder: 3 },
    { name: "Gaming",       sortOrder: 4 },
    { name: "Power Banks",  sortOrder: 5 },
    { name: "Smart Devices",sortOrder: 6 },
    { name: "Smart Home",   sortOrder: 7 },
    { name: "Accessories",  sortOrder: 8 },
    { name: "Keyboards",    sortOrder: 9 },
    { name: "Mouse",        sortOrder: 10 },
    { name: "Audio",        sortOrder: 11 },
    { name: "Wearables",    sortOrder: 12 },
  ];

  const techSubMap: Record<string, string> = {};
  for (const sc of techSubcats) {
    const cat = await prisma.category.upsert({
      where: { slug: slug(sc.name) },
      update: {},
      create: {
        name: sc.name,
        slug: slug(sc.name),
        parentId: techCategory.id,
        sortOrder: sc.sortOrder,
        image: pickImg(techImages, sc.sortOrder),
      },
    });
    techSubMap[sc.name] = cat.id;
  }

  console.log("✓  Categories seeded");

  // ── 3. Brands ─────────────────────────────────────────────
  const beautyBrands = [
    { name: "La Mer",            website: "https://lamer.com"          },
    { name: "Charlotte Tilbury", website: "https://charlottetilbury.com"},
    { name: "Drunk Elephant",    website: "https://drunkelephant.com"  },
    { name: "NARS",              website: "https://narscosmetics.com"  },
    { name: "Tatcha",            website: "https://tatcha.com"         },
    { name: "Dior Beauty",       website: "https://dior.com"           },
    { name: "Chanel Beauty",     website: "https://chanel.com"         },
    { name: "YSL Beauty",        website: "https://yslbeauty.com"      },
    { name: "Tom Ford Beauty",   website: "https://tomford.com"        },
    { name: "Sulwhasoo",         website: "https://sulwhasoo.com"      },
    { name: "Sisley Paris",      website: "https://sisley-paris.com"   },
    { name: "Augustinus Bader",  website: "https://augustinusbader.com"},
    { name: "Dyson Beauty",      website: "https://dyson.com"          },
    { name: "FOREO",             website: "https://foreo.com"          },
    { name: "GHD",               website: "https://ghd.com"            },
    { name: "Creed",             website: "https://creed.com"          },
    { name: "Jo Malone",         website: "https://jomalone.com"       },
    { name: "Maison Margiela",   website: "https://maisonmargiela.com" },
  ];

  const techBrands = [
    { name: "Apple",       website: "https://apple.com"    },
    { name: "Sony",        website: "https://sony.com"     },
    { name: "Bose",        website: "https://bose.com"     },
    { name: "Samsung",     website: "https://samsung.com"  },
    { name: "Anker",       website: "https://anker.com"    },
    { name: "Logitech",    website: "https://logitech.com" },
    { name: "DJI",         website: "https://dji.com"      },
    { name: "Beats",       website: "https://beatsbydre.com"},
    { name: "Sennheiser",  website: "https://sennheiser.com"},
    { name: "Razer",       website: "https://razer.com"    },
    { name: "Jabra",       website: "https://jabra.com"    },
    { name: "Philips Hue", website: "https://philips-hue.com"},
    { name: "Garmin",      website: "https://garmin.com"   },
  ];

  const allBrands = [...beautyBrands, ...techBrands];
  const brandMap: Record<string, string> = {};

  for (let i = 0; i < allBrands.length; i++) {
    const b = allBrands[i];
    const brand = await prisma.brand.upsert({
      where: { slug: slug(b.name) },
      update: {},
      create: {
        name: b.name,
        slug: slug(b.name),
        website: b.website,
        isFeatured: i < 6,
        sortOrder: i,
      },
    });
    brandMap[b.name] = brand.id;
  }

  console.log("✓  Brands seeded");

  // ── 4. Products ───────────────────────────────────────────

  // Helper to create a product with images and specs
  async function createProduct(data: {
    name: string;
    brandName: string;
    categoryId: string;
    priceRange: [number, number];
    description: string;
    specs: Array<{ name: string; value: string }>;
    tags: string[];
    imgArr: string[];
    imgIndex: number;
    skuPrefix: string;
    index: number;
    isFeatured?: boolean;
    isBestSeller?: boolean;
    isNewArrival?: boolean;
    isOnSale?: boolean;
    stock?: number;
  }) {
    const basePrice = price(data.priceRange[0], data.priceRange[1]);
    const cp = comparePrice(basePrice);
    const stockQty = data.stock ?? rand(0, 150);
    const stockStatus: StockStatus =
      stockQty === 0
        ? StockStatus.OUT_OF_STOCK
        : stockQty <= 5
        ? StockStatus.LOW_STOCK
        : StockStatus.IN_STOCK;

    const productSlug = slug(`${data.name}-${data.brandName}`);
    const existing = await prisma.product.findUnique({ where: { slug: productSlug } });
    if (existing) return existing;

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: productSlug,
        sku: sku(data.skuPrefix, data.index),
        description: data.description,
        shortDescription: data.description.slice(0, 120) + "…",
        price: basePrice,
        comparePrice: data.isOnSale ? cp : null,
        categoryId: data.categoryId,
        brandId: data.brandName ? brandMap[data.brandName] : undefined,
        stock: stockQty,
        stockStatus,
        isFeatured: data.isFeatured ?? false,
        isBestSeller: data.isBestSeller ?? false,
        isNewArrival: data.isNewArrival ?? rand(0, 1) === 1,
        isOnSale: data.isOnSale ?? false,
        tags: data.tags,
        ratingAvg: parseFloat((rand(35, 50) / 10).toFixed(1)),
        ratingCount: rand(5, 842),
        salesCount: rand(10, 5000),
        images: {
          create: [
            {
              url: pickImg(data.imgArr, data.imgIndex),
              isPrimary: true,
              sortOrder: 0,
            },
            {
              url: pickImg(data.imgArr, data.imgIndex + 1),
              isPrimary: false,
              sortOrder: 1,
            },
            {
              url: pickImg(data.imgArr, data.imgIndex + 2),
              isPrimary: false,
              sortOrder: 2,
            },
          ],
        },
        specifications: {
          create: data.specs.map((s, i) => ({ ...s, sortOrder: i })),
        },
      },
    });
    return product;
  }

  // ── BEAUTY PRODUCTS (147) ─────────────────────────────────

  // Skincare (30 products)
  const skincareProducts = [
    { name: "The Crème de la Mer Moisturizing Cream",       brand: "La Mer",            price: [180, 380] as [number,number], sale: true,  featured: true,  best: true  },
    { name: "Regenerating Serum Concentrate",                brand: "La Mer",            price: [240, 480] as [number,number], sale: false, featured: false, best: true  },
    { name: "Magic Mushroom Eye Cream",                      brand: "Tatcha",            price: [68,  120] as [number,number], sale: false, featured: true,  best: false },
    { name: "The Water Cream Oil-Free Pore Minimizing",      brand: "Tatcha",            price: [68,  110] as [number,number], sale: true,  featured: false, best: true  },
    { name: "The Dewy Skin Cream Rich Moisture",             brand: "Tatcha",            price: [72,  125] as [number,number], sale: false, featured: false, best: false },
    { name: "T.L.C. Sukari Babyfacial Mask",                brand: "Drunk Elephant",    price: [80,  135] as [number,number], sale: false, featured: true,  best: true  },
    { name: "Virgin Marula Luxury Facial Oil",               brand: "Drunk Elephant",    price: [72,  115] as [number,number], sale: true,  featured: false, best: false },
    { name: "Protini Polypeptide Cream",                     brand: "Drunk Elephant",    price: [68,  110] as [number,number], sale: false, featured: false, best: true  },
    { name: "Sleeping Cream Nocturnal Renewal",              brand: "Sisley Paris",      price: [195, 360] as [number,number], sale: false, featured: true,  best: false },
    { name: "Black Rose Precious Face Oil",                  brand: "Sisley Paris",      price: [180, 340] as [number,number], sale: true,  featured: false, best: true  },
    { name: "The Rich Cream",                                brand: "Augustinus Bader",  price: [265, 450] as [number,number], sale: false, featured: true,  best: true  },
    { name: "The Face Oil",                                  brand: "Augustinus Bader",  price: [185, 320] as [number,number], sale: false, featured: false, best: false },
    { name: "The Toner",                                     brand: "Augustinus Bader",  price: [85,  145] as [number,number], sale: true,  featured: false, best: false },
    { name: "Snow Mushroom Essence",                         brand: "Tatcha",            price: [58,  98]  as [number,number], sale: false, featured: false, best: false },
    { name: "First Moisture Rich Cream",                     brand: "Sulwhasoo",         price: [58,  115] as [number,number], sale: false, featured: false, best: true  },
    { name: "Concentrated Ginseng Renewing Serum",           brand: "Sulwhasoo",         price: [148, 285] as [number,number], sale: true,  featured: true,  best: false },
    { name: "Timepiece Radiance Revitalising Serum",         brand: "Sisley Paris",      price: [295, 520] as [number,number], sale: false, featured: false, best: false },
    { name: "Capture Totale Super Potent Serum",             brand: "Dior Beauty",       price: [120, 220] as [number,number], sale: true,  featured: true,  best: true  },
    { name: "L'Huile Précieuse Multi-Perfecting Oil",        brand: "Chanel Beauty",     price: [105, 185] as [number,number], sale: false, featured: false, best: false },
    { name: "Hydra Beauty Micro Sérum",                      brand: "Chanel Beauty",     price: [90,  165] as [number,number], sale: false, featured: false, best: true  },
    { name: "Skin Illuminating Powder Foundation",           brand: "NARS",              price: [48,  88]  as [number,number], sale: false, featured: false, best: false },
    { name: "Pro Filt'r Soft Matte Foundation",              brand: "NARS",              price: [48,  82]  as [number,number], sale: true,  featured: false, best: true  },
    { name: "Vitamin C Brightening Serum",                   brand: "Drunk Elephant",    price: [88,  145] as [number,number], sale: false, featured: false, best: false },
    { name: "Retinol Eye Cream Renewal",                     brand: "La Mer",            price: [215, 395] as [number,number], sale: false, featured: false, best: false },
    { name: "Glycolic Renewal Serum 10%",                    brand: "Sisley Paris",      price: [148, 265] as [number,number], sale: true,  featured: false, best: false },
    { name: "SPF 50+ Daily Moisturiser Shield",              brand: "Tatcha",            price: [58,  95]  as [number,number], sale: false, featured: false, best: false },
    { name: "Phytomer Eye Contour Gel Cream",                brand: "Sulwhasoo",         price: [68,  120] as [number,number], sale: false, featured: false, best: false },
    { name: "Ceramide Barrier Repair Cream",                 brand: "Augustinus Bader",  price: [145, 265] as [number,number], sale: false, featured: true,  best: false },
    { name: "Hydrating Rose Toning Essence",                 brand: "Tatcha",            price: [48,  85]  as [number,number], sale: true,  featured: false, best: false },
    { name: "Resurfacing Overnight Treatment Mask",          brand: "Drunk Elephant",    price: [62,  98]  as [number,number], sale: false, featured: false, best: true  },
  ];

  for (let i = 0; i < skincareProducts.length; i++) {
    const p = skincareProducts[i];
    await createProduct({
      name: p.name,
      brandName: p.brand,
      categoryId: beautySubMap["Skincare"],
      priceRange: p.price,
      description: `Experience the pinnacle of skincare luxury with ${p.name} by ${p.brand}. Formulated with cutting-edge ingredients and time-honored rituals, this product delivers transformative results. Dermatologist-tested and cruelty-free.`,
      specs: [
        { name: "Skin Type",    value: "All Skin Types" },
        { name: "Volume",       value: `${rand(15, 100)}ml` },
        { name: "Cruelty Free", value: "Yes" },
        { name: "Vegan",        value: rand(0,1) ? "Yes" : "No" },
      ],
      tags: ["skincare", "luxury", slug(p.brand)],
      imgArr: beautyImages,
      imgIndex: i,
      skuPrefix: "SKC",
      index: i + 1,
      isFeatured: p.featured,
      isBestSeller: p.best,
      isOnSale: p.sale,
    });
  }
  console.log("✓  Skincare products (30)");

  // Makeup (30 products)
  const makeupProducts = [
    { name: "Flawless Filter Complexion Booster",      brand: "Charlotte Tilbury", price: [45, 80]   as [number,number], sale: true,  featured: true,  best: true  },
    { name: "Pillow Talk Lipstick",                    brand: "Charlotte Tilbury", price: [34, 58]   as [number,number], sale: false, featured: true,  best: true  },
    { name: "Magic Cream Moisturiser",                 brand: "Charlotte Tilbury", price: [48, 90]   as [number,number], sale: false, featured: false, best: true  },
    { name: "Hollywood Flawless Filter Foundation",   brand: "Charlotte Tilbury", price: [49, 85]   as [number,number], sale: true,  featured: false, best: false },
    { name: "Eyes to Mesmerise Eye Shadow",            brand: "Charlotte Tilbury", price: [32, 55]   as [number,number], sale: false, featured: false, best: false },
    { name: "All Day Luminous Powder Foundation",      brand: "NARS",              price: [48, 86]   as [number,number], sale: false, featured: true,  best: false },
    { name: "Orgasm Blush",                            brand: "NARS",              price: [32, 52]   as [number,number], sale: false, featured: true,  best: true  },
    { name: "Radiant Creamy Concealer",                brand: "NARS",              price: [32, 52]   as [number,number], sale: true,  featured: false, best: true  },
    { name: "Climax Mascara Volume",                   brand: "NARS",              price: [26, 38]   as [number,number], sale: false, featured: false, best: false },
    { name: "Powermatte Lip Pigment",                  brand: "NARS",              price: [26, 38]   as [number,number], sale: false, featured: false, best: false },
    { name: "Rouge Allure Velvet Luminous Matte",      brand: "Chanel Beauty",     price: [42, 68]   as [number,number], sale: true,  featured: true,  best: true  },
    { name: "Les Beiges Healthy Glow Foundation",      brand: "Chanel Beauty",     price: [58, 92]   as [number,number], sale: false, featured: false, best: false },
    { name: "Vitalumière Aqua Foundation",             brand: "Chanel Beauty",     price: [56, 88]   as [number,number], sale: false, featured: false, best: false },
    { name: "Inimitable Mascara",                      brand: "Chanel Beauty",     price: [38, 58]   as [number,number], sale: false, featured: false, best: false },
    { name: "Le Volume de Chanel Mascara",             brand: "Chanel Beauty",     price: [38, 58]   as [number,number], sale: false, featured: false, best: false },
    { name: "Rouge Dior Satin Lipstick",               brand: "Dior Beauty",       price: [42, 68]   as [number,number], sale: true,  featured: true,  best: true  },
    { name: "Diorshow Iconic Overcurl Mascara",        brand: "Dior Beauty",       price: [38, 58]   as [number,number], sale: false, featured: false, best: false },
    { name: "Forever Skin Glow Foundation",            brand: "Dior Beauty",       price: [60, 95]   as [number,number], sale: false, featured: false, best: true  },
    { name: "Backstage Eye Palette Warm Neutrals",     brand: "Dior Beauty",       price: [65, 105]  as [number,number], sale: false, featured: false, best: false },
    { name: "YSL Lipsexxy Plumping Gloss",             brand: "YSL Beauty",        price: [38, 58]   as [number,number], sale: false, featured: false, best: false },
    { name: "Touche Éclat Concealer",                  brand: "YSL Beauty",        price: [42, 65]   as [number,number], sale: true,  featured: true,  best: true  },
    { name: "All Hours Foundation",                    brand: "YSL Beauty",        price: [52, 82]   as [number,number], sale: false, featured: false, best: false },
    { name: "Black Opium Eye Shadow",                  brand: "YSL Beauty",        price: [48, 75]   as [number,number], sale: false, featured: false, best: false },
    { name: "Tom Ford Lip Color Satin Matte",          brand: "Tom Ford Beauty",   price: [58, 90]   as [number,number], sale: false, featured: true,  best: true  },
    { name: "Eye Color Quad Eye Shadow",               brand: "Tom Ford Beauty",   price: [88, 145]  as [number,number], sale: true,  featured: false, best: false },
    { name: "Traceless Foundation Stick",              brand: "Tom Ford Beauty",   price: [72, 115]  as [number,number], sale: false, featured: false, best: false },
    { name: "Contour Blush Highlight Duo",             brand: "Charlotte Tilbury", price: [56, 90]   as [number,number], sale: false, featured: false, best: false },
    { name: "Nude Setting Powder",                     brand: "NARS",              price: [38, 60]   as [number,number], sale: false, featured: false, best: false },
    { name: "Diorshow Brow Styler",                    brand: "Dior Beauty",       price: [34, 52]   as [number,number], sale: false, featured: false, best: false },
    { name: "Liquid Liner Precision",                  brand: "YSL Beauty",        price: [32, 50]   as [number,number], sale: false, featured: false, best: false },
  ];

  for (let i = 0; i < makeupProducts.length; i++) {
    const p = makeupProducts[i];
    await createProduct({
      name: p.name,
      brandName: p.brand,
      categoryId: beautySubMap["Makeup"],
      priceRange: p.price,
      description: `${p.name} by ${p.brand} — a masterclass in makeup artistry. Precision-engineered for long-lasting wear and a luxurious finish. Suitable for all skin tones.`,
      specs: [
        { name: "Finish",     value: ["Matte","Satin","Glossy","Luminous"][rand(0,3)] },
        { name: "Coverage",   value: ["Sheer","Light","Medium","Full"][rand(0,3)]     },
        { name: "Longevity",  value: `${rand(8, 24)} hours`                           },
        { name: "Cruelty Free", value: "Yes"                                          },
      ],
      tags: ["makeup", "cosmetics", slug(p.brand)],
      imgArr: beautyImages,
      imgIndex: i,
      skuPrefix: "MKP",
      index: i + 1,
      isFeatured: p.featured,
      isBestSeller: p.best,
      isOnSale: p.sale,
    });
  }
  console.log("✓  Makeup products (30)");

  // Hair Care (20 products)
  const hairProducts = [
    { name: "Supersonic Hair Dryer",                   brand: "Dyson Beauty",    price: [380, 430] as [number,number], sale: false, featured: true,  best: true  },
    { name: "Airwrap Multi-Styler Complete",            brand: "Dyson Beauty",    price: [499, 600] as [number,number], sale: false, featured: true,  best: true  },
    { name: "Corrale Straightener",                     brand: "Dyson Beauty",    price: [380, 420] as [number,number], sale: true,  featured: false, best: false },
    { name: "Platinum+ Styler Professional",            brand: "GHD",             price: [199, 260] as [number,number], sale: false, featured: true,  best: true  },
    { name: "Gold Styler Classic",                      brand: "GHD",             price: [149, 195] as [number,number], sale: true,  featured: false, best: false },
    { name: "Max Styler Wide Plate",                    brand: "GHD",             price: [219, 285] as [number,number], sale: false, featured: false, best: false },
    { name: "Virtue Recovery Shampoo",                  brand: "Sisley Paris",    price: [32,  58]  as [number,number], sale: false, featured: false, best: false },
    { name: "Hair Rituel Precious Hair Care Oil",       brand: "Sisley Paris",    price: [88,  145] as [number,number], sale: true,  featured: false, best: true  },
    { name: "Revitalising Fortifying Shampoo",          brand: "Sisley Paris",    price: [48,  80]  as [number,number], sale: false, featured: false, best: false },
    { name: "Deep Nourishing Hair Mask",                brand: "Augustinus Bader",price: [65,  110] as [number,number], sale: false, featured: false, best: false },
    { name: "Scalp Serum Revitalising",                 brand: "Drunk Elephant",  price: [52,  90]  as [number,number], sale: false, featured: false, best: false },
    { name: "Biotin Collagen Shampoo Thickening",       brand: "Tatcha",          price: [38,  65]  as [number,number], sale: true,  featured: false, best: false },
    { name: "Purple Toning Conditioner Blonde",         brand: "GHD",             price: [28,  48]  as [number,number], sale: false, featured: false, best: false },
    { name: "Split End Repair Serum",                   brand: "Tatcha",          price: [45,  75]  as [number,number], sale: false, featured: false, best: false },
    { name: "Curl Defining Cream",                      brand: "Drunk Elephant",  price: [35,  60]  as [number,number], sale: false, featured: false, best: false },
    { name: "Heat Protection Spray 230°C",              brand: "GHD",             price: [22,  38]  as [number,number], sale: false, featured: false, best: true  },
    { name: "Smoothing Gloss Serum",                    brand: "Sisley Paris",    price: [68,  115] as [number,number], sale: true,  featured: false, best: false },
    { name: "Volumising Mousse Extra Strong",           brand: "GHD",             price: [22,  35]  as [number,number], sale: false, featured: false, best: false },
    { name: "Overnight Hair Repair Treatment",          brand: "Augustinus Bader",price: [75,  120] as [number,number], sale: false, featured: false, best: false },
    { name: "Lightweight Hydrating Conditioner",        brand: "Tatcha",          price: [38,  62]  as [number,number], sale: false, featured: false, best: false },
  ];

  for (let i = 0; i < hairProducts.length; i++) {
    const p = hairProducts[i];
    await createProduct({
      name: p.name,
      brandName: p.brand,
      categoryId: beautySubMap["Hair Care"],
      priceRange: p.price,
      description: `${p.name} by ${p.brand} — professional-grade hair care trusted by stylists worldwide. Delivers salon-quality results at home with cutting-edge technology.`,
      specs: [
        { name: "Hair Type",  value: ["All","Fine","Thick","Curly"][rand(0,3)] },
        { name: "Volume",     value: `${rand(100, 300)}ml`                     },
        { name: "Sulfate Free", value: rand(0,1) ? "Yes" : "No"               },
      ],
      tags: ["hair", "haircare", slug(p.brand)],
      imgArr: beautyImages,
      imgIndex: i + 3,
      skuPrefix: "HRC",
      index: i + 1,
      isFeatured: p.featured,
      isBestSeller: p.best,
      isOnSale: p.sale,
    });
  }
  console.log("✓  Hair Care products (20)");

  // Body Care (20 products)
  const bodyProducts = [
    { name: "Body Crème Nourishing Ritual",            brand: "La Mer",          price: [150, 280] as [number,number], sale: false, featured: true,  best: true  },
    { name: "The Body Oil Golden Lustre",               brand: "La Mer",          price: [120, 220] as [number,number], sale: true,  featured: false, best: false },
    { name: "Exfoliating Body Scrub Sugar",             brand: "Tatcha",          price: [45,  80]  as [number,number], sale: false, featured: false, best: false },
    { name: "Wild Lychee Body Serum",                   brand: "Drunk Elephant",  price: [62,  108] as [number,number], sale: false, featured: false, best: true  },
    { name: "Whipped Body Butter Intense Moisture",     brand: "Augustinus Bader",price: [85,  145] as [number,number], sale: false, featured: false, best: false },
    { name: "Rice Polish Body Exfoliant",               brand: "Tatcha",          price: [48,  82]  as [number,number], sale: true,  featured: false, best: false },
    { name: "Firming Body Lotion Advanced",             brand: "Sisley Paris",    price: [95,  165] as [number,number], sale: false, featured: false, best: true  },
    { name: "Resurfacing Body Treatment",               brand: "Drunk Elephant",  price: [52,  88]  as [number,number], sale: false, featured: false, best: false },
    { name: "Luminous Body Oil Glow",                   brand: "Charlotte Tilbury",price: [48, 78]  as [number,number], sale: false, featured: true,  best: true  },
    { name: "Cooling Leg Gel Revive",                   brand: "Sisley Paris",    price: [68,  115] as [number,number], sale: false, featured: false, best: false },
    { name: "Stretch Mark Serum Prevention",            brand: "Augustinus Bader",price: [75,  130] as [number,number], sale: true,  featured: false, best: false },
    { name: "Satin Body Scrub Brightening",             brand: "La Mer",          price: [82,  145] as [number,number], sale: false, featured: false, best: false },
    { name: "Hydrating Hand Cream Rich",                brand: "La Mer",          price: [55,  95]  as [number,number], sale: false, featured: false, best: true  },
    { name: "Foot Cream Revitalising",                  brand: "Sisley Paris",    price: [48,  80]  as [number,number], sale: false, featured: false, best: false },
    { name: "Tanning Body Oil SPF 15",                  brand: "Charlotte Tilbury",price: [42, 70]  as [number,number], sale: true,  featured: false, best: false },
    { name: "Arnica Massage Oil Relaxing",              brand: "Tatcha",          price: [35,  62]  as [number,number], sale: false, featured: false, best: false },
    { name: "Vitamin E Body Butter Deep",               brand: "Drunk Elephant",  price: [45,  78]  as [number,number], sale: false, featured: false, best: false },
    { name: "Body Lotion Ultra-Hydrating SPF",          brand: "Augustinus Bader",price: [65,  110] as [number,number], sale: false, featured: false, best: false },
    { name: "Exfoliant Body Gel Fresh",                 brand: "Tatcha",          price: [42,  72]  as [number,number], sale: false, featured: false, best: false },
    { name: "Regenerating Dry Body Oil",                brand: "Sisley Paris",    price: [78,  135] as [number,number], sale: true,  featured: false, best: false },
  ];

  for (let i = 0; i < bodyProducts.length; i++) {
    const p = bodyProducts[i];
    await createProduct({
      name: p.name,
      brandName: p.brand,
      categoryId: beautySubMap["Body Care"],
      priceRange: p.price,
      description: `Indulge your skin with ${p.name} by ${p.brand}. A luxurious body ritual that nourishes, hydrates, and transforms skin texture with every application.`,
      specs: [
        { name: "Volume",      value: `${rand(100, 400)}ml`                },
        { name: "Skin Concern",value: ["Hydration","Firming","Brightening","Anti-Aging"][rand(0,3)] },
        { name: "Fragrance",   value: rand(0,1) ? "Fragranced" : "Fragrance-Free" },
      ],
      tags: ["body", "bodycare", slug(p.brand)],
      imgArr: beautyImages,
      imgIndex: i + 1,
      skuPrefix: "BDC",
      index: i + 1,
      isFeatured: p.featured,
      isBestSeller: p.best,
      isOnSale: p.sale,
    });
  }
  console.log("✓  Body Care products (20)");

  // Perfume (22 products)
  const perfumeProducts = [
    { name: "Aventus Eau de Parfum",                   brand: "Creed",           price: [295, 450] as [number,number], sale: false, featured: true,  best: true  },
    { name: "Silver Mountain Water Parfum",             brand: "Creed",           price: [275, 420] as [number,number], sale: false, featured: true,  best: false },
    { name: "Green Irish Tweed Parfum",                 brand: "Creed",           price: [280, 430] as [number,number], sale: true,  featured: false, best: true  },
    { name: "Peony & Blush Suede Cologne",             brand: "Jo Malone",       price: [145, 260] as [number,number], sale: false, featured: true,  best: true  },
    { name: "Wood Sage & Sea Salt Cologne",             brand: "Jo Malone",       price: [145, 250] as [number,number], sale: false, featured: false, best: false },
    { name: "English Pear & Freesia Cologne",           brand: "Jo Malone",       price: [145, 250] as [number,number], sale: true,  featured: false, best: false },
    { name: "Velvet Rose & Oud Intense",                brand: "Jo Malone",       price: [195, 340] as [number,number], sale: false, featured: false, best: true  },
    { name: "Replica Jazz Club Eau de Toilette",        brand: "Maison Margiela", price: [125, 215] as [number,number], sale: false, featured: true,  best: true  },
    { name: "Replica By the Fireplace",                 brand: "Maison Margiela", price: [125, 215] as [number,number], sale: false, featured: false, best: false },
    { name: "Replica Beach Walk Eau de Toilette",       brand: "Maison Margiela", price: [125, 215] as [number,number], sale: true,  featured: false, best: false },
    { name: "Replica Flower Market",                    brand: "Maison Margiela", price: [125, 210] as [number,number], sale: false, featured: false, best: false },
    { name: "Chanel No.5 Eau de Parfum",                brand: "Chanel Beauty",   price: [120, 345] as [number,number], sale: false, featured: true,  best: true  },
    { name: "Chanel Chance Eau Tendre",                 brand: "Chanel Beauty",   price: [108, 290] as [number,number], sale: true,  featured: false, best: false },
    { name: "Coco Mademoiselle Intense EDP",            brand: "Chanel Beauty",   price: [115, 310] as [number,number], sale: false, featured: false, best: true  },
    { name: "Miss Dior Blooming Bouquet",               brand: "Dior Beauty",     price: [88,  240] as [number,number], sale: false, featured: false, best: false },
    { name: "Sauvage Eau de Parfum",                    brand: "Dior Beauty",     price: [95,  265] as [number,number], sale: false, featured: true,  best: true  },
    { name: "J'adore L'Absolu Parfum",                  brand: "Dior Beauty",     price: [105, 390] as [number,number], sale: true,  featured: false, best: false },
    { name: "Tom Ford Black Orchid EDP",                brand: "Tom Ford Beauty", price: [145, 290] as [number,number], sale: false, featured: true,  best: true  },
    { name: "Tobacco Vanille Parfum",                   brand: "Tom Ford Beauty", price: [175, 380] as [number,number], sale: false, featured: false, best: false },
    { name: "Lost Cherry Eau de Parfum",                brand: "Tom Ford Beauty", price: [175, 375] as [number,number], sale: false, featured: false, best: true  },
    { name: "YSL Libre Eau de Parfum",                  brand: "YSL Beauty",      price: [88,  220] as [number,number], sale: true,  featured: false, best: false },
    { name: "Mon Paris Floral Eau de Parfum",           brand: "YSL Beauty",      price: [75,  195] as [number,number], sale: false, featured: false, best: false },
  ];

  for (let i = 0; i < perfumeProducts.length; i++) {
    const p = perfumeProducts[i];
    await createProduct({
      name: p.name,
      brandName: p.brand,
      categoryId: beautySubMap["Perfume"],
      priceRange: p.price,
      description: `${p.name} by ${p.brand} — an olfactive masterpiece crafted by world-renowned perfumers. A signature scent that captivates and endures throughout the day.`,
      specs: [
        { name: "Size",         value: `${[30, 50, 75, 100][rand(0,3)]}ml`          },
        { name: "Concentration",value: ["EDT","EDP","Parfum","Extrait"][rand(0,3)]   },
        { name: "Top Notes",    value: ["Bergamot","Rose","Jasmine","Oud"][rand(0,3)] },
        { name: "Base Notes",   value: ["Sandalwood","Musk","Amber","Vetiver"][rand(0,3)] },
      ],
      tags: ["perfume", "fragrance", slug(p.brand)],
      imgArr: beautyImages,
      imgIndex: i + 2,
      skuPrefix: "PFM",
      index: i + 1,
      isFeatured: p.featured,
      isBestSeller: p.best,
      isOnSale: p.sale,
    });
  }
  console.log("✓  Perfume products (22)");

  // Beauty Tools (25 products)
  const toolProducts = [
    { name: "LUNA 4 Face Cleansing Device",             brand: "FOREO",           price: [149, 220] as [number,number], sale: false, featured: true,  best: true  },
    { name: "UFO 3 Smart Mask Treatment",               brand: "FOREO",           price: [199, 280] as [number,number], sale: false, featured: true,  best: false },
    { name: "BEAR 2 Microcurrent Device",               brand: "FOREO",           price: [269, 360] as [number,number], sale: true,  featured: false, best: true  },
    { name: "IRIS 2 Eye Massager",                      brand: "FOREO",           price: [129, 190] as [number,number], sale: false, featured: false, best: false },
    { name: "ISSA 3 Toothbrush",                        brand: "FOREO",           price: [89,  140] as [number,number], sale: false, featured: false, best: false },
    { name: "Supersonic Nural Hair Dryer",              brand: "Dyson Beauty",    price: [480, 550] as [number,number], sale: false, featured: true,  best: true  },
    { name: "V15 Detect Cordless Vacuum",               brand: "Dyson Beauty",    price: [749, 850] as [number,number], sale: true,  featured: false, best: false },
    { name: "Pure Hot+Cool Purifying Fan",              brand: "Dyson Beauty",    price: [549, 650] as [number,number], sale: false, featured: false, best: false },
    { name: "Airblade Hand Dryer",                      brand: "Dyson Beauty",    price: [349, 420] as [number,number], sale: false, featured: false, best: false },
    { name: "Platinum+ Styler Pro",                     brand: "GHD",             price: [219, 280] as [number,number], sale: false, featured: false, best: true  },
    { name: "Curve Classic Wave Wand",                  brand: "GHD",             price: [179, 235] as [number,number], sale: false, featured: false, best: false },
    { name: "Rise Hot Brush",                           brand: "GHD",             price: [149, 195] as [number,number], sale: true,  featured: false, best: false },
    { name: "Groomer Kit Professional",                 brand: "GHD",             price: [89,  145] as [number,number], sale: false, featured: false, best: false },
    { name: "Microneedling Derma Roller 0.5mm",         brand: "FOREO",           price: [48,  85]  as [number,number], sale: false, featured: false, best: false },
    { name: "Facial Gua Sha Rose Quartz",               brand: "Tatcha",          price: [28,  55]  as [number,number], sale: false, featured: false, best: false },
    { name: "Jade Roller Face Massager",                brand: "Tatcha",          price: [25,  48]  as [number,number], sale: false, featured: false, best: false },
    { name: "LED Light Therapy Mask Pro",               brand: "FOREO",           price: [295, 420] as [number,number], sale: true,  featured: true,  best: true  },
    { name: "Eyelash Curler Professional",              brand: "Sisley Paris",    price: [28,  45]  as [number,number], sale: false, featured: false, best: false },
    { name: "Eyebrow Shaping Kit Complete",             brand: "Charlotte Tilbury",price: [35, 58]  as [number,number], sale: false, featured: false, best: false },
    { name: "Professional Brush Set 12pc",              brand: "Charlotte Tilbury",price: [95, 155]  as [number,number], sale: false, featured: false, best: true  },
    { name: "Foundation Blending Sponge Pack",          brand: "NARS",            price: [22,  38]  as [number,number], sale: false, featured: false, best: false },
    { name: "Cryo Facial Globe Set",                    brand: "FOREO",           price: [45,  78]  as [number,number], sale: false, featured: false, best: false },
    { name: "Contour Palette Pro Brush",                brand: "Charlotte Tilbury",price: [42, 68]  as [number,number], sale: true,  featured: false, best: false },
    { name: "Magnetic Lash Applicator",                 brand: "Charlotte Tilbury",price: [32, 52]  as [number,number], sale: false, featured: false, best: false },
    { name: "Dermaplaning Tool Kit",                    brand: "FOREO",           price: [38,  65]  as [number,number], sale: false, featured: false, best: false },
  ];

  for (let i = 0; i < toolProducts.length; i++) {
    const p = toolProducts[i];
    await createProduct({
      name: p.name,
      brandName: p.brand,
      categoryId: beautySubMap["Beauty Tools"],
      priceRange: p.price,
      description: `${p.name} by ${p.brand} — precision beauty technology engineered for professional results. Elevate your beauty ritual with this indispensable tool.`,
      specs: [
        { name: "Material",   value: ["Stainless Steel","Rose Quartz","Silicone","ABS"][rand(0,3)] },
        { name: "Warranty",   value: `${[1, 2, 3][rand(0,2)]} Year(s)` },
        { name: "Waterproof", value: rand(0,1) ? "Yes" : "No" },
      ],
      tags: ["tools", "beauty-tools", slug(p.brand)],
      imgArr: beautyImages,
      imgIndex: i + 4,
      skuPrefix: "BTL",
      index: i + 1,
      isFeatured: p.featured,
      isBestSeller: p.best,
      isOnSale: p.sale,
    });
  }
  console.log("✓  Beauty Tools products (25)");

  // ── TECH PRODUCTS (39) ────────────────────────────────────

  const techProductList = [
    // Headphones (6)
    { name: "WH-1000XM5 Noise Cancelling",     brand: "Sony",        cat: "Headphones",  price: [320, 399] as [number,number], sale: true,  featured: true,  best: true  },
    { name: "QuietComfort 45 Headphones",       brand: "Bose",        cat: "Headphones",  price: [249, 329] as [number,number], sale: false, featured: true,  best: true  },
    { name: "AirPods Max Spatial Audio",        brand: "Apple",       cat: "Headphones",  price: [449, 549] as [number,number], sale: false, featured: true,  best: true  },
    { name: "Momentum 4 Wireless ANC",          brand: "Sennheiser",  cat: "Headphones",  price: [279, 349] as [number,number], sale: false, featured: false, best: false },
    { name: "Beats Studio Pro ANC",             brand: "Beats",       cat: "Headphones",  price: [299, 349] as [number,number], sale: true,  featured: false, best: false },
    { name: "Evolve2 85 UC Wireless",           brand: "Jabra",       cat: "Headphones",  price: [369, 449] as [number,number], sale: false, featured: false, best: false },
    // Cameras (4)
    { name: "Alpha 7 IV Full-Frame Mirrorless", brand: "Sony",        cat: "Cameras",     price: [2198, 2799] as [number,number], sale: false, featured: true,  best: true  },
    { name: "Mavic 3 Pro Drone Camera",         brand: "DJI",         cat: "Cameras",     price: [1599, 2199] as [number,number], sale: false, featured: true,  best: false },
    { name: "Osmo Pocket 3 Camera",             brand: "DJI",         cat: "Cameras",     price: [319, 419]   as [number,number], sale: true,  featured: false, best: true  },
    { name: "ZV-E10 II Vlog Camera",            brand: "Sony",        cat: "Cameras",     price: [748, 948]   as [number,number], sale: false, featured: false, best: false },
    // Tablets (3)
    { name: "iPad Pro M4 13-inch",              brand: "Apple",       cat: "Tablets",     price: [1099, 1399] as [number,number], sale: false, featured: true,  best: true  },
    { name: "iPad Air M2 11-inch",              brand: "Apple",       cat: "Tablets",     price: [599, 799]   as [number,number], sale: false, featured: false, best: true  },
    { name: "Galaxy Tab S10 Ultra",             brand: "Samsung",     cat: "Tablets",     price: [1099, 1299] as [number,number], sale: true,  featured: false, best: false },
    // Gaming (4)
    { name: "Razer BlackShark V2 Pro",          brand: "Razer",       cat: "Gaming",      price: [149, 199]   as [number,number], sale: false, featured: false, best: true  },
    { name: "Razer Naga V2 Pro Gaming Mouse",   brand: "Razer",       cat: "Gaming",      price: [149, 199]   as [number,number], sale: true,  featured: false, best: false },
    { name: "Razer Huntsman V3 Pro Keyboard",   brand: "Razer",       cat: "Gaming",      price: [199, 259]   as [number,number], sale: false, featured: true,  best: true  },
    { name: "Razer Kishi Ultra Controller",     brand: "Razer",       cat: "Gaming",      price: [129, 179]   as [number,number], sale: false, featured: false, best: false },
    // Power Banks (3)
    { name: "Prime 20000mAh Power Bank",        brand: "Anker",       cat: "Power Banks", price: [55, 85]     as [number,number], sale: false, featured: false, best: true  },
    { name: "MagGo 10000 Wireless Powerbank",   brand: "Anker",       cat: "Power Banks", price: [65, 95]     as [number,number], sale: true,  featured: false, best: false },
    { name: "733 Power Bank GaN 65W",           brand: "Anker",       cat: "Power Banks", price: [79, 109]    as [number,number], sale: false, featured: false, best: false },
    // Smart Devices (3)
    { name: "Apple Watch Ultra 2",              brand: "Apple",       cat: "Wearables",   price: [799, 999]   as [number,number], sale: false, featured: true,  best: true  },
    { name: "Galaxy Watch 7 Pro",               brand: "Samsung",     cat: "Wearables",   price: [299, 449]   as [number,number], sale: true,  featured: false, best: false },
    { name: "Garmin Fenix 8 Solar",             brand: "Garmin",      cat: "Wearables",   price: [899, 1099]  as [number,number], sale: false, featured: true,  best: true  },
    // Smart Home (3)
    { name: "Hue Starter Kit White & Color",    brand: "Philips Hue", cat: "Smart Home",  price: [149, 199]   as [number,number], sale: false, featured: false, best: true  },
    { name: "Hue Gradient Lightstrip Plus",     brand: "Philips Hue", cat: "Smart Home",  price: [89, 129]    as [number,number], sale: true,  featured: false, best: false },
    { name: "Hue Sync Box 8K HDMI",             brand: "Philips Hue", cat: "Smart Home",  price: [249, 299]   as [number,number], sale: false, featured: false, best: false },
    // Keyboards (3)
    { name: "MX Keys S Wireless Keyboard",      brand: "Logitech",    cat: "Keyboards",   price: [99, 129]    as [number,number], sale: false, featured: false, best: true  },
    { name: "MX Mechanical Mini Wireless",      brand: "Logitech",    cat: "Keyboards",   price: [149, 199]   as [number,number], sale: true,  featured: false, best: false },
    { name: "MX Keys Mini for Business",        brand: "Logitech",    cat: "Keyboards",   price: [99, 129]    as [number,number], sale: false, featured: false, best: false },
    // Mouse (3)
    { name: "MX Master 3S Wireless Mouse",      brand: "Logitech",    cat: "Mouse",       price: [99, 119]    as [number,number], sale: false, featured: true,  best: true  },
    { name: "MX Anywhere 3S Compact Mouse",     brand: "Logitech",    cat: "Mouse",       price: [69, 89]     as [number,number], sale: false, featured: false, best: false },
    { name: "DeathAdder V3 Pro Mouse",          brand: "Razer",       cat: "Mouse",       price: [129, 159]   as [number,number], sale: true,  featured: false, best: true  },
    // Audio (3)
    { name: "WF-1000XM5 True Wireless",         brand: "Sony",        cat: "Audio",       price: [249, 299]   as [number,number], sale: false, featured: true,  best: true  },
    { name: "QuietComfort Earbuds II",           brand: "Bose",        cat: "Audio",       price: [249, 299]   as [number,number], sale: true,  featured: false, best: false },
    { name: "AirPods Pro 2nd Generation",       brand: "Apple",       cat: "Audio",       price: [219, 249]   as [number,number], sale: false, featured: true,  best: true  },
    // Accessories (3)
    { name: "MagSafe Charger 25W",              brand: "Apple",       cat: "Accessories", price: [39, 49]     as [number,number], sale: false, featured: false, best: false },
    { name: "736 Charging Station 4-in-1",      brand: "Anker",       cat: "Accessories", price: [79, 99]     as [number,number], sale: false, featured: false, best: true  },
    { name: "USB-C Hub 7-in-1 Pro",             brand: "Anker",       cat: "Accessories", price: [49, 69]     as [number,number], sale: true,  featured: false, best: false },
    // Smart Devices bonus (2)
    { name: "WH-1000XM6 Adaptive Sound",        brand: "Sony",        cat: "Headphones",  price: [349, 449]   as [number,number], sale: false, featured: true,  best: true  },
    { name: "Elite 85t ANC Earbuds",            brand: "Jabra",       cat: "Audio",       price: [179, 229]   as [number,number], sale: false, featured: false, best: false },
  ];

  for (let i = 0; i < techProductList.length; i++) {
    const p = techProductList[i];
    const catId = techSubMap[p.cat] ?? techCategory.id;
    await createProduct({
      name: p.name,
      brandName: p.brand,
      categoryId: catId,
      priceRange: p.price,
      description: `${p.name} by ${p.brand} — engineered for those who demand the best. Premium build quality, cutting-edge features, and exceptional performance that sets new standards.`,
      specs: [
        { name: "Connectivity", value: ["Bluetooth 5.3","USB-C","Wi-Fi 6","Wireless"][rand(0,3)] },
        { name: "Battery Life", value: `${rand(8, 40)} hours`                                     },
        { name: "Warranty",     value: "1 Year Manufacturer"                                      },
        { name: "Color",        value: ["Midnight Black","Platinum Silver","Space Gray","White"][rand(0,3)] },
      ],
      tags: ["tech", "electronics", slug(p.brand), slug(p.cat)],
      imgArr: techImages,
      imgIndex: i,
      skuPrefix: "TCH",
      index: i + 1,
      isFeatured: p.featured,
      isBestSeller: p.best,
      isOnSale: p.sale,
    });
  }
  console.log("✓  Tech products (39)");

  // ── 5. Coupons ─────────────────────────────────────────────
  await prisma.coupon.upsert({
    where: { code: "WELCOME15" },
    update: {},
    create: {
      code: "WELCOME15",
      type: "PERCENTAGE",
      value: 15,
      minOrderAmount: 50,
      usageLimit: 1000,
      perUserLimit: 1,
      description: "15% off your first order",
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "LUXE20" },
    update: {},
    create: {
      code: "LUXE20",
      type: "PERCENTAGE",
      value: 20,
      minOrderAmount: 150,
      maxDiscount: 100,
      usageLimit: 500,
      perUserLimit: 2,
      description: "20% off orders over $150",
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "FREESHIP" },
    update: {},
    create: {
      code: "FREESHIP",
      type: "FREE_SHIPPING",
      value: 0,
      minOrderAmount: 75,
      usageLimit: 2000,
      perUserLimit: 3,
      description: "Free shipping on orders over $75",
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "BEAUTY50" },
    update: {},
    create: {
      code: "BEAUTY50",
      type: "FIXED_AMOUNT",
      value: 50,
      minOrderAmount: 200,
      usageLimit: 100,
      perUserLimit: 1,
      description: "$50 off beauty orders over $200",
      isActive: true,
    },
  });

  console.log("✓  Coupons seeded");

  // ── 6. Flash Sale ──────────────────────────────────────────
  await prisma.flashSale.create({
    data: {
      name: "Summer Beauty Flash",
      discount: 25,
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h
      isActive: true,
    },
  });
  console.log("✓  Flash sale seeded");

  // ── 7. Site Settings ───────────────────────────────────────
  const settings = [
    { key: "site_name",               value: "Luxe Store",              type: "string"  },
    { key: "site_tagline",            value: "Luxury Beauty & Tech",    type: "string"  },
    { key: "currency",                value: "USD",                     type: "string"  },
    { key: "currency_symbol",         value: "$",                       type: "string"  },
    { key: "tax_rate",                value: "8.5",                     type: "number"  },
    { key: "shipping_free_threshold", value: "75",                      type: "number"  },
    { key: "shipping_flat_rate",      value: "9.99",                    type: "number"  },
    { key: "low_stock_threshold",     value: "5",                       type: "number"  },
    { key: "maintenance_mode",        value: "false",                   type: "boolean" },
    { key: "allow_guest_checkout",    value: "true",                    type: "boolean" },
    { key: "review_auto_approve",     value: "false",                   type: "boolean" },
    { key: "meta_title",              value: "Luxe Store | Premium Beauty & Tech", type: "string" },
    { key: "meta_description",        value: "Shop luxury beauty, skincare, cosmetics and premium tech. Free shipping on orders over $75.", type: "string" },
    { key: "contact_email",           value: "hello@luxestore.com",     type: "string"  },
    { key: "contact_phone",           value: "+1 (555) 000-0000",       type: "string"  },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log("✓  Site settings seeded");

  const productCount = await prisma.product.count();
  console.log(`\n✅  Seed complete! ${productCount} products in database.`);
}

main()
  .catch((e) => {
    console.error("❌  Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
