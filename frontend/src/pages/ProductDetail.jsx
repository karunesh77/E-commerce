import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Star, Heart, Minus, Plus } from "lucide-react";
import { getProductBySlugApi, getProductReviewsApi, addReviewApi } from "../api/products.api";
import { addToWishlistApi, removeFromWishlistApi, checkWishlistApi } from "../api/wishlist.api";
import { addToCart } from "../store/slices/cartSlice";

export default function ProductDetail() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    getProductBySlugApi(slug)
      .then((res) => {
        const p = res.data.data;
        setProduct(p);
        return getProductReviewsApi(p._id);
      })
      .then((res) => setReviews(res.data.data.reviews))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!product || !user) return;
    checkWishlistApi(product._id).then((res) => setInWishlist(res.data.data.isInWishlist));
  }, [product, user]);

  const handleAddToCart = () => {
    if (!user) return navigate("/login");
    dispatch(addToCart({ productId: product._id, quantity }));
  };

  const toggleWishlist = async () => {
    if (!user) return navigate("/login");
    try {
      if (inWishlist) {
        await removeFromWishlistApi(product._id);
        setInWishlist(false);
        toast.success("Removed from wishlist");
      } else {
        await addToWishlistApi(product._id);
        setInWishlist(true);
        toast.success("Added to wishlist");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    setSubmittingReview(true);
    try {
      const res = await addReviewApi(product._id, reviewForm);
      setReviews((prev) => [res.data.data, ...prev]);
      setReviewForm({ rating: 5, comment: "" });
      toast.success("Review added");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="py-24 text-center text-sm text-gray-500">Loading...</div>;
  if (!product) return <div className="py-24 text-center text-sm text-gray-500">Product not found.</div>;

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const outOfStock = product.stock <= 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Images */}
        <div>
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
            {product.images?.[activeImage]?.url ? (
              <img src={product.images[activeImage].url} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">No image</div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img.public_id || i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded border ${i === activeImage ? "border-indigo-600" : "border-gray-200"}`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.brand && <p className="text-sm text-gray-500">{product.brand}</p>}
          <h1 className="mt-1 text-2xl font-bold text-gray-900">{product.name}</h1>

          {product.ratings > 0 && (
            <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{product.ratings}</span>
              <span>({product.numReviews} reviews)</span>
            </div>
          )}

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">₹{displayPrice?.toLocaleString("en-IN")}</span>
            {hasDiscount && (
              <span className="text-lg text-gray-400 line-through">₹{product.price?.toLocaleString("en-IN")}</span>
            )}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-gray-600">{product.description}</p>

          <p className="mt-4 text-sm">
            {outOfStock ? (
              <span className="font-medium text-red-600">Out of stock</span>
            ) : (
              <span className="font-medium text-green-600">In stock ({product.stock} available)</span>
            )}
          </p>

          {!outOfStock && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center rounded-md border border-gray-300">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-2 text-gray-600 hover:text-gray-900">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="flex-1 rounded-md bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add to Cart
            </button>
            <button
              onClick={toggleWishlist}
              className="rounded-md border border-gray-300 p-3 hover:bg-gray-50"
              aria-label="Toggle wishlist"
            >
              <Heart className={`h-5 w-5 ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16 border-t border-gray-200 pt-10">
        <h2 className="text-lg font-bold text-gray-900">Reviews ({reviews.length})</h2>

        {user && (
          <form onSubmit={handleReviewSubmit} className="mt-4 max-w-lg space-y-3 rounded-lg border border-gray-200 p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Rating</label>
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm((p) => ({ ...p, rating: Number(e.target.value) }))}
                className="mt-1 rounded border border-gray-300 px-2 py-1 text-sm"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} star{r > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Comment</label>
              <textarea
                required
                minLength={10}
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
                rows={3}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                placeholder="Share your experience with this product..."
              />
            </div>
            <button
              type="submit"
              disabled={submittingReview}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
            <p className="text-xs text-gray-400">Only customers who purchased and received this product can review.</p>
          </form>
        )}

        <div className="mt-6 space-y-6">
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500">No reviews yet.</p>
          ) : (
            reviews.map((r) => (
              <div key={r._id} className="border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{r.user?.name}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-600">{r.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
