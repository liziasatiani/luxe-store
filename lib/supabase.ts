import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Browser client (public)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server client (admin, bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Storage helpers
export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "products";

export async function uploadProductImage(
  file: File | Buffer,
  path: string,
  contentType = "image/jpeg"
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      contentType,
      upsert: true,
      cacheControl: "3600",
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: urlData } = supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function deleteProductImage(path: string): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .remove([path]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}

export function getPublicUrl(path: string): string {
  const { data } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
