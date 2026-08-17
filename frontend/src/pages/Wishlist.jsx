import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getWishlistApi, removeFromWishlistApi } from "../api/wishlist.api";
import ProductCard from "../components/ProductCard";

export default function Wishlist() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWishlistApi()
      .then((res) => setProducts(res.data.data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlistApi(productId);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      toast.success("Removed from wishlist");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not remove");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-xl font-bold text-gray-900">My Wishlist</h1>

      {loading ? (
        <p className="mt-6 text-sm text-gray-500">Loading...</p>
      ) : products.length === 0 ? (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">Your wishlist is empty.</p>
          <Link to="/products" className="mt-4 inline-block rounded-full bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <div key={product._id} className="relative">
              <ProductCard product={product} />
              <button
                onClick={() => handleRemove(product._id)}
                className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-red-600 shadow hover:bg-white"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
