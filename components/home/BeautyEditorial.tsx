import Image from "next/image";
import Link from "next/link";

export function BeautyEditorial() {
  return (
    <div className="editorial">
      <div className="ed-img">
        <Image
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80&auto=format"
          alt="Beauty"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="ed-txt">
        <div className="ed-ey">Curated Beauty</div>
        <h2 className="ed-title">The finest edit<br />in <em>luxury beauty</em></h2>
        <p className="ed-desc">La Mer, Chanel, Charlotte Tilbury, Dyson — beauty that earns its place in your ritual. Sourced directly from authorized distributors and delivered to your door.</p>
        <Link href="/beauty" className="ed-link">Explore Beauty</Link>
      </div>
    </div>
  );
}
