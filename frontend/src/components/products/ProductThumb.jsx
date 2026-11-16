import { useState } from "react";
import { Footprints, Headphones, House, Package, Shirt } from "lucide-react";

// Category-tinted icon art: shown when a product has no image_url or its image fails to load.
const STYLES = {
  footwear: { Icon: Footprints, bg: "from-sky-100 to-indigo-200 dark:from-sky-500/20 dark:to-indigo-500/30", fg: "text-indigo-500 dark:text-indigo-300" },
  electronics: { Icon: Headphones, bg: "from-violet-100 to-fuchsia-200 dark:from-violet-500/20 dark:to-fuchsia-500/30", fg: "text-violet-500 dark:text-violet-300" },
  apparel: { Icon: Shirt, bg: "from-amber-100 to-rose-200 dark:from-amber-500/20 dark:to-rose-500/30", fg: "text-rose-500 dark:text-rose-300" },
  home: { Icon: House, bg: "from-emerald-100 to-teal-200 dark:from-emerald-500/20 dark:to-teal-500/30", fg: "text-emerald-600 dark:text-emerald-300" },
};
const FALLBACK = { Icon: Package, bg: "from-slate-100 to-slate-200 dark:from-slate-700/40 dark:to-slate-600/40", fg: "text-slate-500 dark:text-slate-300" };

// Studio cut-outs on white (DummyJSON) look best contained; lifestyle photos (Unsplash) fill the frame.
function isCutout(url) {
  try {
    return new URL(url).hostname.endsWith("dummyjson.com");
  } catch {
    return false;
  }
}

/**
 * Fixed-ratio product image. Size/ratio comes from `className` (e.g. "aspect-[4/3] w-full").
 * Falls back to the category icon if there's no image or it fails to load (e.g. offline).
 */
export default function ProductThumb({ product, className = "", iconClassName = "h-10 w-10" }) {
  const [status, setStatus] = useState("loading"); // loading | loaded | error
  const { Icon, bg, fg } = STYLES[product.category] ?? FALLBACK;
  const showImage = product.image_url && status !== "error";

  if (!showImage) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br ${bg} ${className}`} aria-hidden="true">
        <Icon className={`${iconClassName} ${fg}`} strokeWidth={1.5} />
      </div>
    );
  }

  const cutout = isCutout(product.image_url);
  return (
    <div
      className={`relative overflow-hidden ${
        cutout
          ? "bg-gradient-to-b from-white to-slate-50 dark:from-slate-100 dark:to-slate-200"
          : "bg-slate-100 dark:bg-slate-700/50"
      } ${className}`}
    >
      {status === "loading" && (
        <div className="absolute inset-0 animate-pulse bg-slate-200/70 dark:bg-slate-600/40" aria-hidden="true" />
      )}
      <img
        src={product.image_url}
        alt={product.name}
        loading="lazy"
        decoding="async"
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${
          cutout ? "object-contain p-3 mix-blend-multiply" : "object-cover"
        } ${status === "loaded" ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
