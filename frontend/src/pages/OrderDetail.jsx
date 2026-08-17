import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getOrderByIdApi, cancelOrderApi } from "../api/orders.api";

const CANCELLABLE = ["pending", "confirmed"];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [reason, setReason] = useState("");

  const loadOrder = () => {
    getOrderByIdApi(id)
      .then((res) => setOrder(res.data.data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  };

  useEffect(loadOrder, [id]);

  const handleCancel = async (e) => {
    e.preventDefault();
    setCancelling(true);
    try {
      await cancelOrderApi(id, { reason });
      toast.success("Order cancelled");
      setShowCancelForm(false);
      loadOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not cancel order");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="py-24 text-center text-sm text-gray-500">Loading...</div>;
  if (!order) return <div className="py-24 text-center text-sm text-gray-500">Order not found.</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/orders" className="text-sm text-indigo-600 hover:underline">
        ← Back to orders
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</h1>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-800">{order.status}</span>
      </div>

      {/* Timeline */}
      <div className="mt-6 space-y-3 rounded-lg border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-900">Order Timeline</h2>
        {order.statusTimeline?.map((t, i) => (
          <div key={i} className="flex items-start gap-3 text-sm">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
            <div>
              <p className="font-medium capitalize text-gray-900">{t.status}</p>
              {t.message && <p className="text-xs text-gray-500">{t.message}</p>}
              <p className="text-xs text-gray-400">{new Date(t.timestamp).toLocaleString("en-IN")}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Items */}
      <div className="mt-6 space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">Items</h2>
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded bg-gray-100">
              {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
            </div>
            <div className="flex-1 text-sm">
              <p className="font-medium text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
          </div>
        ))}
      </div>

      {/* Address + pricing */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 p-4 text-sm">
          <h2 className="font-semibold text-gray-900">Shipping Address</h2>
          <p className="mt-2 text-gray-600">
            {order.shippingAddress.name}<br />
            {order.shippingAddress.street}<br />
            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}<br />
            Phone: {order.shippingAddress.phone}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4 text-sm">
          <h2 className="font-semibold text-gray-900">Payment</h2>
          <p className="mt-2 text-gray-600 capitalize">Method: {order.payment.method}</p>
          <p className="text-gray-600 capitalize">Status: {order.payment.status}</p>
          <div className="mt-3 space-y-1 border-t border-gray-100 pt-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span><span>₹{order.pricing.subtotal?.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span><span>{order.pricing.shipping === 0 ? "Free" : `₹${order.pricing.shipping}`}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900">
              <span>Total</span><span>₹{order.pricing.total?.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>

      {CANCELLABLE.includes(order.status) && (
        <div className="mt-6">
          {!showCancelForm ? (
            <button
              onClick={() => setShowCancelForm(true)}
              className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Cancel Order
            </button>
          ) : (
            <form onSubmit={handleCancel} className="space-y-3 rounded-lg border border-red-200 p-4">
              <label className="block text-sm font-medium text-gray-700">Reason for cancellation</label>
              <textarea
                required
                minLength={5}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={cancelling}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {cancelling ? "Cancelling..." : "Confirm Cancel"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCancelForm(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Nevermind
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
