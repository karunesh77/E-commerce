import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { getProductsApi, deleteProductApi } from "../api/products.api";
import PageHeader from "../components/PageHeader";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadProducts = () => {
    setLoading(true);
    getProductsApi({ q: search, page, limit: 15 })
      .then((res) => {
        const data = res.data.data;
        setProducts(data.products || data);
        if (data.pagination) setPagination(data.pagination);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(loadProducts, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadProducts();
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteProductApi(id);
      toast.success("Product deleted");
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete product");
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <PageHeader
        title="Products"
        action={
          <Link
            to="/products/new"
            className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        }
      />

      <form onSubmit={handleSearch} className="mt-4 max-w-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </form>

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No products found.</td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="flex items-center gap-3 px-4 py-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-gray-100">
                      {p.images?.[0]?.url && <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <span className="max-w-xs truncate font-medium text-gray-900">{p.name}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.brand || "-"}</td>
                  <td className="px-4 py-3 text-gray-900">₹{p.price?.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <span className={p.stock === 0 ? "font-medium text-red-600" : "text-gray-700"}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.ratings > 0 ? `${p.ratings} (${p.numReviews})` : "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link to={`/products/${p._id}/edit`} className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-indigo-600">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button onClick={() => handleDelete(p._id, p.name)} className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.pages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-8 w-8 rounded text-sm ${
                p === page ? "bg-indigo-600 text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
