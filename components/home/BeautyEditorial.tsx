import Image from "next/image";
import Link from "next/link";

export function BeautyEditorial() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2" style={{ borderTop: "1px solid rgba(239,233,218,0.08)", borderBottom: "1px solid rgba(239,233,218,0.08)" }}>
      <div className="overflow-hidden aspect-[4/3] relative" style={{ background: "#0D1220" }}>
        <Image
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80&auto=format"
          alt="Curated Beauty"
          fill
          className="object-cover object-center transition-transform duration-[900ms] group-hover:scale-[1.03]"
          style={{ filter: "saturate(0.8) brightness(0.9)" }}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="flex flex-col justify-center" style={{ padding: "80px 72px" }}>
        <p className="text-[9px] font-semibold tracking-[0.22em] uppercase mb-7" style={{ color: "#C9A44A" }}>Curated Beauty</p>
        <h2 className="font-display font-bold leading-[1.05] tracking-[-0.02em] mb-5"
          style={{ fontSize: "clamp(32px,3.5vw,52px)", color: "#EFE9DA" }}>
          The finest edit<br />in <em className="italic" style={{ color: "#C9A44A" }}>luxury beauty</em>
        </h2>
        <p className="text-[14px] leading-[1.75] mb-9 max-w-[380px]" style={{ color: "rgba(239,233,218,0.55)" }}>
          La Mer, Chanel, Charlotte Tilbury, Dyson — beauty that earns its place in your ritual. Sourced directly from authorized distributors and delivered to your door.
        </p>
        <Link href="/beauty"
          className="inline-flex items-center gap-2.5 text-[10px] font-medium tracking-[0.14em] uppercase pb-1 transition-opacity hover:opacity-70"
          style={{ color: "#C9A44A", borderBottom: "1px solid rgba(201,164,74,0.35)" }}>
          Explore Beauty →
        </Link>
      </div>
    </div>
  );
}
