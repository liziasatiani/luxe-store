import { z } from "zod";

/** Emails are stored and compared in canonical lowercase form. */
const email = z
  .string()
  .trim()
  .toLowerCase()
  .email("Invalid email address");

/**
 * bcrypt silently truncates input past 72 bytes, so anything longer is both
 * misleading and a cheap way to burn CPU. Cap it explicitly.
 */
const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/[0-9]/, "Must contain a number");

/** Prisma cuid — used wherever an id arrives from an untrusted client. */
const id = z.string().min(1).max(64);

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const addressSchema = z.object({
  label: z.string().min(1).max(50),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  company: z.string().max(200).optional(),
  line1: z.string().min(1, "Address is required").max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  postalCode: z.string().min(1, "Postal code is required").max(20),
  country: z.string().default("US"),
  phone: z.string().max(32).optional(),
  isDefault: z.boolean().default(false),
});

export const checkoutSchema = z.object({
  addressId: z.string().optional(),
  newAddress: addressSchema.optional(),
  paymentMethod: z.enum(["STRIPE", "CASH_ON_DELIVERY", "BANK_TRANSFER"]),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(300),
  sku: z.string().min(1, "SKU is required").max(100),
  barcode: z.string().max(100).optional(),
  description: z.string().max(10000).optional(),
  shortDescription: z.string().max(500).optional(),
  howToUse: z.string().max(5000).optional().nullable(),
  ingredients: z.string().max(10000).optional().nullable(),
  inTheBox: z.string().max(5000).optional().nullable(),
  price: z.coerce.number().positive("Price must be positive"),
  comparePrice: z.coerce.number().optional().nullable(),
  costPrice: z.coerce.number().optional().nullable(),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().optional().nullable(),
  stock: z.coerce.number().int().min(0),
  lowStockAt: z.coerce.number().int().min(0).default(5),
  weight: z.coerce.number().optional().nullable(),
  weightUnit: z.string().default("g"),
  length: z.coerce.number().optional().nullable(),
  width: z.coerce.number().optional().nullable(),
  height: z.coerce.number().optional().nullable(),
  dimUnit: z.string().default("cm"),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(true),
  isOnSale: z.boolean().default(false),
  isActive: z.boolean().default(true),
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().max(500).optional(),
  tags: z.array(z.string()).default([]),
});

export const reviewSchema = z.object({
  productId: id,
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(200).optional(),
  body: z
    .string()
    .trim()
    .min(10, "Review must be at least 10 characters")
    .max(5000, "Review is too long"),
});

export const couponSchema = z.object({
  code: z.string().min(1).toUpperCase(),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]),
  value: z.coerce.number().min(0),
  minOrderAmount: z.coerce.number().optional().nullable(),
  maxDiscount: z.coerce.number().optional().nullable(),
  usageLimit: z.coerce.number().int().optional().nullable(),
  perUserLimit: z.coerce.number().int().default(1),
  isActive: z.boolean().default(true),
  startsAt: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  description: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email,
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message is too long"),
});

export const newsletterSchema = z.object({ email });

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().trim().max(32).optional().nullable(),
  image: z.string().url().optional().nullable(),
});

/**
 * A line item as supplied by the client. Only `productId` and `quantity` are
 * trusted — price is always re-derived from the database server-side, and the
 * quantity bounds stop negative values from inverting the order total or
 * incrementing stock via `decrement`.
 */
export const cartLineSchema = z.object({
  productId: id,
  variantId: id.nullish(),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").max(99),
});

export const cartLinesSchema = z
  .array(cartLineSchema)
  .min(1, "Cart is empty")
  .max(100, "Too many items in cart");

export const shippingSnapshotSchema = z.object({
  shippingName: z.string().trim().min(1).max(200),
  shippingLine1: z.string().trim().min(1).max(200),
  shippingLine2: z.string().trim().max(200).nullish(),
  shippingCity: z.string().trim().min(1).max(100),
  shippingState: z.string().trim().min(1).max(100),
  shippingPostal: z.string().trim().min(1).max(32),
  shippingCountry: z.string().trim().min(1).max(64).default("US"),
  shippingPhone: z.string().trim().max(32).nullish(),
});

export const guestInfoSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  email,
  phone: z.string().trim().max(32).nullish(),
});

const orderBaseSchema = z.object({
  paymentMethod: z
    .enum(["STRIPE", "CASH_ON_DELIVERY", "BANK_TRANSFER"])
    .default("CASH_ON_DELIVERY"),
  couponCode: z.string().trim().max(64).nullish(),
  notes: z.string().trim().max(2000).nullish(),
  cartItems: cartLinesSchema,
});

export const createOrderSchema = z.discriminatedUnion("guest", [
  orderBaseSchema.extend({
    guest: z.literal(true),
    guestInfo: guestInfoSchema,
    shippingSnapshot: shippingSnapshotSchema,
  }),
  orderBaseSchema.extend({
    guest: z.literal(false).default(false),
    addressId: id,
  }),
]);

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type CartLineInput = z.infer<typeof cartLineSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
