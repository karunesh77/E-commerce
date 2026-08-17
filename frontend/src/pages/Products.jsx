import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProductsApi } from "../api/products.api";
import { getCategoriesApi } from "../api/categories.api";
import ProductCard from "../components/ProductCard";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page")) || 1;
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  useEffect(() => {
    getCategoriesApi({ activeOnly: true }).then((res) => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { q, category, sort, page, limit: 12 };
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    getProductsApi(params)
      .then((res) => {
        const data = res.data.data;
        setProducts(data.products || data);
        if (data.pagination) setPagination(data.pagination);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [q, category, sort, page, minPrice, maxPrice]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page"); // filter change hone pe page 1 pe reset
    setSearchParams(next);
  };

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", p);
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-xl font-bold text-gray-900">
        {q ? `Search results for "${q}"` : "All Products"}
      </h1>

      <div className="mt-6 flex flex-col gap-8 md:flex-row">
        {/* Filters sidebar */}
        <aside className="w-full shrink-0 md:w-56">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Category</h3>
              <div className="mt-2 space-y-1">
                <button
                  onClick={() => updateParam("category", "")}
                  className={`block text-sm ${!category ? "font-semibold text-indigo-600" : "text-gray-600 hover:text-gray-900"}`}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => updateParam("category", c._id)}
                    className={`block text-sm ${category === c._id ? "font-semibold text-indigo-600" : "text-gray-600 hover:text-gray-900"}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900">Price Range</h3>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  defaultValue={minPrice}
                  onBlur={(e) => updateParam("minPrice", e.target.value)}
                  className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  defaultValue={maxPrice}
                  onBlur={(e) => updateParam("maxPrice", e.target.value)}
                  className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">{pagination.total} products</p>
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">No products found.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`h-8 w-8 rounded text-sm ${
                        p === pagination.page
                          ? "bg-indigo-600 text-white"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
