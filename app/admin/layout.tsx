import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(role ?? "")) {
    redirect("/login?redirect=/admin");
  }

  return (
    <div className="flex min-h-screen bg-surface-50 dark:bg-surface-950">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-auto pt-14 md:pt-0">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
