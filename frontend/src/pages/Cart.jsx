import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Minus, Plus, Trash2 } from "lucide-react";
import { updateCartItem, removeCartItem } from "../store/slices/cartSlice";

export default function Cart() {
  const { items, summary, status } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <p className="text-gray-600">Login to view your cart.</p>
        <Link to="/login" className="mt-4 inline-block rounded-full bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Login
        </Link>
      </div>
    );
  }

  if (status === "loading" && items.length === 0) {
    return <div className="py-24 text-center text-sm text-gray-500">Loading cart...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <p className="text-gray-600">Your cart is empty.</p>
        <Link to="/products" className="mt-4 inline-block rounded-full bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-xl font-bold text-gray-900">Shopping Cart</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div key={item._id} className="flex gap-4 rounded-lg border border-gray-200 p-4">
              <Link to={`/products/${item.product.slug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded bg-gray-100">
                {item.product.image ? (
                  <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                ) : null}
              </Link>

              <div className="flex-1">
                <Link to={`/products/${item.product.slug}`} className="text-sm font-medium text-gray-900 hover:text-indigo-600">
                  {item.product.name}
                </Link>
                {(item.size || item.color) && (
                  <p className="mt-0.5 text-xs text-gray-500">
                    {item.size && `Size: ${item.size}`} {item.color && `Color: ${item.color}`}
                  </p>
                )}
                <p className="mt-1 text-sm font-semibold text-gray-900">₹{item.price?.toLocaleString("en-IN")}</p>

                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center rounded-md border border-gray-300">
                    <button
                      onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: Math.max(1, item.quantity - 1) }))}
                      className="p-1.5 text-gray-600 hover:text-gray-900"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() =>
                        dispatch(updateCartItem({ itemId: item._id, quantity: Math.min(item.product.stock, item.quantity + 1) }))
                      }
                      className="p-1.5 text-gray-600 hover:text-gray-900"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => dispatch(removeCartItem(item._id))}
                    className="text-gray-400 hover:text-red-600"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="text-sm font-semibold text-gray-900">₹{item.itemTotal?.toLocaleString("en-IN")}</div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="h-fit rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900">Order Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({summary.totalItems} items)</span>
              <span>₹{summary.subtotal?.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{summary.shipping === 0 ? "Free" : `₹${summary.shipping}`}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-semibold text-gray-900">
              <span>Total</span>
              <span>₹{summary.total?.toLocaleString("en-IN")}</span>
            </div>
          </div>
          <button
            onClick={() => navigate("/checkout")}
            className="mt-5 w-full rounded-md bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
