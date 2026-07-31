export function PressBar() {
  const outlets = ["Vogue", "Elle", "Forbes", "Allure", "Harper's Bazaar", "WWD", "Refinery29"];
  return (
    <div className="border-y border-black/8 dark:border-white/8 bg-white dark:bg-black py-4 overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8 sm:gap-12 overflow-x-auto no-scrollbar">
          <span className="text-[9px] tracking-[0.22em] uppercase text-black/55 dark:text-white/55 whitespace-nowrap shrink-0">
            As seen in
          </span>
          {outlets.map((name) => (
            <span
              key={name}
              className="text-[13px] font-light tracking-[0.1em] text-black/50 dark:text-white/50 whitespace-nowrap shrink-0 hover:text-black/75 dark:hover:text-white/75 transition-colors"
              style={{ fontVariant: "small-caps" }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
