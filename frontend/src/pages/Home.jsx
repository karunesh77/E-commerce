import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProductsApi } from "../api/products.api";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductsApi({ sort: "newest", limit: 8 })
      .then((res) => setProducts(res.data.data.products || res.data.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold sm:text-5xl">Shop the latest, delivered fast</h1>
          <p className="mt-4 text-lg text-indigo-100">
            Quality products, honest prices, secure checkout.
          </p>
          <Link
            to="/products"
            className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            Shop Now
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">New Arrivals</h2>
          <Link to="/products" className="text-sm font-medium text-indigo-600 hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-sm text-gray-500">No products yet — add some from the admin panel.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
