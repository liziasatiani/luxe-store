export function PressBar() {
  const signals = [
    "Free 30-Day Returns",
    "100% Authentic",
    "Secure Checkout",
    "Free Shipping Over ₾200",
    "Authorized Distributors Only",
    "Customer Support 7 Days",
  ];
  return (
    <div className="border-y border-black/8 dark:border-white/8 bg-white dark:bg-black py-4 overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-10 overflow-x-auto no-scrollbar">
          {signals.map((text) => (
            <span
              key={text}
              className="text-[10px] tracking-[0.14em] uppercase text-black/45 dark:text-white/45 whitespace-nowrap shrink-0"
            >
              · {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
