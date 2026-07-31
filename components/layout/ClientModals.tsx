"use client";
import dynamic from "next/dynamic";

const SearchModal = dynamic(() => import("@/components/search/SearchModal").then(m => ({ default: m.SearchModal })), { ssr: false });
const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer").then(m => ({ default: m.CartDrawer })), { ssr: false });
const ExitIntentCapture = dynamic(() => import("@/components/ui/ExitIntentCapture").then(m => ({ default: m.ExitIntentCapture })), { ssr: false });

export function ClientModals() {
  return (
    <>
      <SearchModal />
      <CartDrawer />
      <ExitIntentCapture />
    </>
  );
}
