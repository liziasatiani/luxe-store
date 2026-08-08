import Image from "next/image";
import Link from "next/link";

export function EditorialPanels() {
  return (
    <div className="epanels">
      <Link href="/tech" className="epanel ep-tech">
        <div className="ep-bg">
          <Image
            src="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=900&q=80&auto=format"
            alt="Technology"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="ep-overlay" />
        <div className="ep-accent" />
        <div className="ep-content">
          <div className="ep-cat">Technology</div>
          <h3 className="ep-title">Precision.<br />Performance.<br />Power.</h3>
          <p className="ep-sub">From Sony&apos;s finest audio to Apple&apos;s most refined devices — technology that earns its place.</p>
          <span className="ep-link">Shop Technology</span>
        </div>
      </Link>

      <Link href="/beauty" className="epanel ep-beauty">
        <div className="ep-bg">
          <Image
            src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900&q=80&auto=format"
            alt="Beauty"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="ep-overlay" />
        <div className="ep-accent" />
        <div className="ep-content">
          <div className="ep-cat">Beauty</div>
          <h3 className="ep-title">Ritual.<br />Refinement.<br />Results.</h3>
          <p className="ep-sub">La Mer, Chanel, Charlotte Tilbury — beauty that treats itself as seriously as you do.</p>
          <span className="ep-link">Shop Beauty</span>
        </div>
      </Link>
    </div>
  );
}
