import Image from "next/image";
import Link from "next/link";

export function EditorialPanels() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      {/* Tech panel */}
      <div className="relative min-h-[520px] group cursor-pointer overflow-hidden flex items-end" style={{ padding: "56px 64px" }}>
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=900&q=80&auto=format"
            alt="Technology"
            fill
            className="object-cover object-center"
            style={{ filter: "brightness(0.25)" }}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(0deg,rgba(7,9,15,.9) 0%,transparent 65%)" }} />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: "linear-gradient(135deg,rgba(0,229,255,.15) 0%,transparent 60%)" }}
        />
        <div className="relative z-10">
          <p className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-3.5" style={{ color: "#C9A44A" }}>Technology</p>
          <h3 className="font-display font-bold text-white leading-[1.05] tracking-[-0.02em] mb-3"
            style={{ fontSize: "clamp(30px,3.5vw,52px)" }}>
            Precision.<br />Performance.<br />Power.
          </h3>
          <p className="text-[13px] leading-[1.6] mb-7 max-w-[320px]" style={{ color: "rgba(239,233,218,0.55)" }}>
            From Sony&apos;s finest audio to Apple&apos;s most refined devices — technology that earns its place.
          </p>
          <Link href="/tech"
            className="inline-flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.14em] uppercase pb-1 transition-colors group-hover:opacity-100"
            style={{ color: "#C9A44A", borderBottom: "1px solid rgba(201,164,74,0.4)" }}>
            Shop Technology →
          </Link>
        </div>
      </div>

      {/* Beauty panel */}
      <div className="relative min-h-[520px] group cursor-pointer overflow-hidden flex items-end" style={{ padding: "56px 64px" }}>
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900&q=80&auto=format"
            alt="Beauty"
            fill
            className="object-cover object-center"
            style={{ filter: "brightness(0.25)" }}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(0deg,rgba(7,9,15,.9) 0%,transparent 65%)" }} />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: "linear-gradient(135deg,rgba(255,51,102,.15) 0%,transparent 60%)" }}
        />
        <div className="relative z-10">
          <p className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-3.5" style={{ color: "#C9A44A" }}>Beauty</p>
          <h3 className="font-display font-bold text-white leading-[1.05] tracking-[-0.02em] mb-3"
            style={{ fontSize: "clamp(30px,3.5vw,52px)" }}>
            Ritual.<br />Refinement.<br />Results.
          </h3>
          <p className="text-[13px] leading-[1.6] mb-7 max-w-[320px]" style={{ color: "rgba(239,233,218,0.55)" }}>
            La Mer, Chanel, Charlotte Tilbury — beauty that treats itself as seriously as you do.
          </p>
          <Link href="/beauty"
            className="inline-flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.14em] uppercase pb-1 transition-colors"
            style={{ color: "#C9A44A", borderBottom: "1px solid rgba(201,164,74,0.4)" }}>
            Shop Beauty →
          </Link>
        </div>
      </div>
    </div>
  );
}
