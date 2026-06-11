"use client";
import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useWishlistStore } from "@/store";

export function WishlistSync() {
  const { status } = useSession();
  const { ids, toggle } = useWishlistStore();
  const synced = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || synced.current) return;
    synced.current = true;

    const snapshot = [...new Set(ids)];

    fetch("/api/wishlist/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: snapshot }),
    })
      .then(r => r.json())
      .then(d => {
        if (!d.success) return;
        const mergedIds: string[] = d.data.ids;
        const localSet = new Set(snapshot);
        for (const id of mergedIds) {
          if (!localSet.has(id)) toggle(id);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]); // ids intentionally excluded — snapshot captures value at auth time

  return null;
}
