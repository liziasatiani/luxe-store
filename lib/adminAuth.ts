import { auth } from "@/lib/auth";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"] as const;

export async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  return ADMIN_ROLES.includes(role as typeof ADMIN_ROLES[number]) ? session : null;
}
