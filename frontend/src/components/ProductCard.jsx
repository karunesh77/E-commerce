import { Link } from "react-router-dom";
import { Star } from "lucide-react";

export default function ProductCard({ product }) {
  const image = product.images?.[0]?.url;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const outOfStock = product.stock <= 0;

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-lg border border-gray-200 transition hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
            No image
          </div>
        )}
        {outOfStock && (
          <span className="absolute left-2 top-2 rounded bg-gray-900/80 px-2 py-0.5 text-xs font-medium text-white">
            Out of stock
          </span>
        )}
        {hasDiscount && !outOfStock && (
          <span className="absolute left-2 top-2 rounded bg-red-600 px-2 py-0.5 text-xs font-medium text-white">
            {Math.round(100 - (product.discountPrice / product.price) * 100)}% OFF
          </span>
        )}
      </div>
      <div className="p-3">
        {product.brand && <p className="text-xs text-gray-500">{product.brand}</p>}
        <h3 className="mt-0.5 truncate text-sm font-medium text-gray-900">{product.name}</h3>

        <div className="mt-1 flex items-center gap-1.5">
          <span className="text-sm font-semibold text-gray-900">₹{displayPrice?.toLocaleString("en-IN")}</span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">₹{product.price?.toLocaleString("en-IN")}</span>
          )}
        </div>

        {product.ratings > 0 && (
          <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span>{product.ratings}</span>
            <span>({product.numReviews})</span>
          </div>
        )}
      </div>
    </Link>
  );
}
