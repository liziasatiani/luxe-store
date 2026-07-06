import Papa from "papaparse";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import type { StockStatus } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────
export interface ImportRow {
  name: string;
  brand?: string;
  category?: string;
  subcategory?: string;
  description?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stock?: number;
  sku?: string;
  barcode?: string;
  tags?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  featured?: boolean;
  sale?: boolean;
  newArrival?: boolean;
  images?: string; // comma-separated URLs
}

export interface ImportResult {
  succeeded: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

// ─── Parsers ─────────────────────────────────────────────────
export function parseCSV(text: string): ImportRow[] {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
  });
  return result.data.map(normalizeRow);
}

export function parseExcel(buffer: ArrayBuffer): ImportRow[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });
  return rows.map((r) =>
    normalizeRow(
      Object.fromEntries(
        Object.entries(r).map(([k, v]) => [
          k.toLowerCase().replace(/\s+/g, "_"),
          String(v),
        ])
      )
    )
  );
}

export function parseJSON(text: string): ImportRow[] {
  const data = JSON.parse(text);
  const arr = Array.isArray(data) ? data : data.products ?? [];
  return arr.map(normalizeRow);
}

function normalizeRow(r: Record<string, unknown>): ImportRow {
  const bool = (v: unknown) =>
    v === true || v === "true" || v === "1" || v === "yes";
  return {
    name: String(r.name ?? "").trim(),
    brand: String(r.brand ?? "").trim() || undefined,
    category: String(r.category ?? "").trim() || undefined,
    subcategory: String(r.subcategory ?? r.sub_category ?? "").trim() || undefined,
    description: String(r.description ?? "").trim() || undefined,
    price: parseFloat(String(r.price ?? "0")) || 0,
    comparePrice: r.compare_price ? parseFloat(String(r.compare_price)) : undefined,
    costPrice: r.cost_price ? parseFloat(String(r.cost_price)) : undefined,
    stock: r.stock !== undefined ? parseInt(String(r.stock)) : undefined,
    sku: String(r.sku ?? "").trim() || undefined,
    barcode: String(r.barcode ?? "").trim() || undefined,
    tags: String(r.tags ?? "").trim() || undefined,
    weight: r.weight ? parseFloat(String(r.weight)) : undefined,
    length: r.length ? parseFloat(String(r.length)) : undefined,
    width: r.width ? parseFloat(String(r.width)) : undefined,
    height: r.height ? parseFloat(String(r.height)) : undefined,
    featured: bool(r.featured),
    sale: bool(r.sale),
    newArrival: bool(r.new_arrival ?? r.newArrival),
    images: String(r.images ?? "").trim() || undefined,
  };
}

// ─── Importer ─────────────────────────────────────────────────
export async function importProducts(
  rows: ImportRow[],
  jobId?: string
): Promise<ImportResult> {
  const result: ImportResult = { succeeded: 0, failed: 0, errors: [] };

  // Cache lookups
  const categories = await prisma.category.findMany();
  const brands = await prisma.brand.findMany();

  const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c.id]));
  const catByName = Object.fromEntries(
    categories.map((c) => [c.name.toLowerCase(), c.id])
  );
  const brandByName = Object.fromEntries(
    brands.map((b) => [b.name.toLowerCase(), b.id])
  );

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      if (!row.name) throw new Error("Name is required");
      if (!row.price || row.price <= 0) throw new Error("Valid price required");

      // Resolve category
      const catKey = (row.subcategory ?? row.category ?? "").toLowerCase();
      const categoryId =
        catBySlug[slugify(catKey)] ??
        catByName[catKey] ??
        categories[0]?.id;
      if (!categoryId) throw new Error("No categories in database");

      // Resolve brand
      const brandKey = (row.brand ?? "").toLowerCase();
      let brandId: string | undefined =
        brandKey ? brandByName[brandKey] : undefined;

      if (brandKey && !brandId) {
        const nb = await prisma.brand.create({
          data: { name: row.brand!, slug: slugify(row.brand!) },
        });
        brandByName[brandKey] = nb.id;
        brandId = nb.id;
      }

      // Generate unique SKU
      const baseSku = row.sku ?? `IMP-${Date.now()}-${i}`;
      const existingSku = await prisma.product.findUnique({
        where: { sku: baseSku },
      });
      const finalSku = existingSku ? `${baseSku}-${i}` : baseSku;

      // Generate unique slug
      const baseSlug = slugify(row.name);
      const existingSlug = await prisma.product.findUnique({
        where: { slug: baseSlug },
      });
      const finalSlug = existingSlug ? `${baseSlug}-${i}` : baseSlug;

      const stockQty = row.stock ?? 100;
      const stockStatus: StockStatus =
        stockQty === 0 ? "OUT_OF_STOCK" : stockQty <= 5 ? "LOW_STOCK" : "IN_STOCK";

      await prisma.product.create({
        data: {
          name: row.name,
          slug: finalSlug,
          sku: finalSku,
          barcode: row.barcode,
          description: row.description,
          price: row.price,
          comparePrice: row.comparePrice ?? null,
          costPrice: row.costPrice ?? null,
          stock: stockQty,
          stockStatus,
          categoryId,
          brandId: brandId ?? null,
          weight: row.weight ?? null,
          length: row.length ?? null,
          width: row.width ?? null,
          height: row.height ?? null,
          isFeatured: row.featured ?? false,
          isOnSale: row.sale ?? false,
          isNewArrival: row.newArrival ?? true,
          tags: row.tags ? row.tags.split(",").map((t) => t.trim()) : [],
          images: row.images
            ? {
                create: row.images.split(",").map((url, idx) => ({
                  url: url.trim(),
                  isPrimary: idx === 0,
                  sortOrder: idx,
                })),
              }
            : undefined,
        },
      });

      result.succeeded++;

      if (jobId && (i + 1) % 10 === 0) {
        await prisma.importJob.update({
          where: { id: jobId },
          data: { processed: i + 1, succeeded: result.succeeded, failed: result.failed },
        });
      }
    } catch (err) {
      result.failed++;
      result.errors.push({
        row: i + 2,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  if (jobId) {
    await prisma.importJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        processed: rows.length,
        succeeded: result.succeeded,
        failed: result.failed,
        errors: result.errors,
      },
    });
  }

  return result;
}

// ─── Template generators ──────────────────────────────────────
export function generateCSVTemplate(): string {
  const headers = [
    "name","brand","category","subcategory","description","price",
    "compare_price","cost_price","stock","sku","barcode","tags",
    "weight","length","width","height","featured","sale","new_arrival","images",
  ];
  const example = [
    "Luxury Face Cream","La Mer","Beauty","Skincare",
    "A rich moisturising cream","120.00","180.00","60.00",
    "50","SKC-0001","1234567890","skincare,luxury,moisturiser",
    "50","","","","false","false","true",
    "https://example.com/img1.jpg,https://example.com/img2.jpg",
  ];
  return `${headers.join(",")}\n${example.join(",")}`;
}

export function generateExcelTemplate(): ArrayBuffer {
  const ws = XLSX.utils.aoa_to_sheet([
    [
      "name","brand","category","subcategory","description","price",
      "compare_price","cost_price","stock","sku","barcode","tags",
      "weight","length","width","height","featured","sale","new_arrival","images",
    ],
    [
      "Luxury Face Cream","La Mer","Beauty","Skincare",
      "A rich moisturising cream",120,180,60,50,"SKC-0001","1234567890",
      "skincare,luxury",50,"","","",false,false,true,
      "https://example.com/img1.jpg",
    ],
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Products");
  return XLSX.write(wb, { type: "array", bookType: "xlsx" });
}

export function generateJSONTemplate(): string {
  return JSON.stringify(
    {
      products: [
        {
          name: "Luxury Face Cream",
          brand: "La Mer",
          category: "Beauty",
          subcategory: "Skincare",
          description: "A rich moisturising cream",
          price: 120.0,
          compare_price: 180.0,
          cost_price: 60.0,
          stock: 50,
          sku: "SKC-0001",
          barcode: "1234567890",
          tags: "skincare,luxury,moisturiser",
          weight: 50,
          featured: false,
          sale: false,
          new_arrival: true,
          images: "https://example.com/img1.jpg,https://example.com/img2.jpg",
        },
      ],
    },
    null,
    2
  );
}
