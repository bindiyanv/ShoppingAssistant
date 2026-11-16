import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard.jsx";

function Arrow({ dir, onClick }) {
  const left = dir === "left";
  const Icon = left ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={left ? "Scroll products left" : "Scroll products right"}
      className={`absolute top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-lg backdrop-blur transition hover:scale-110 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:flex dark:border-slate-600 dark:bg-slate-800/95 dark:text-slate-200 dark:hover:text-indigo-300 ${
        left ? "-left-2" : "-right-2"
      }`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

export default function ProductCarousel({ products }) {
  const trackRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update, products]);

  function scroll(dir) {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <div className="relative animate-fade-in-up [animation-delay:120ms] motion-reduce:animate-none">
      {canLeft && <Arrow dir="left" onClick={() => scroll(-1)} />}
      <div
        ref={trackRef}
        onScroll={update}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-1 pb-3 pt-1"
      >
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} bestMatch={i === 0} />
        ))}
      </div>
      {canRight && <Arrow dir="right" onClick={() => scroll(1)} />}
    </div>
  );
}
