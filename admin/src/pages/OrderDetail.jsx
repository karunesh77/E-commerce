import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getOrderByIdApi, updateOrderStatusApi } from "../api/orders.api";

const STATUS_OPTIONS = ["confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState("");
  const [message, setMessage] = useState("");
  const [updating, setUpdating] = useState(false);

  const loadOrder = () => {
    getOrderByIdApi(id)
      .then((res) => {
        setOrder(res.data.data);
        setNewStatus(res.data.data.status);
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  };

  useEffect(loadOrder, [id]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await updateOrderStatusApi(id, { status: newStatus, message });
      toast.success("Order status updated");
      setMessage("");
      loadOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8 text-sm text-gray-500">Loading...</div>;
  if (!order) return <div className="p-8 text-sm text-gray-500">Order not found.</div>;

  return (
    <div className="p-6 sm:p-8">
      <Link to="/orders" className="text-sm text-indigo-600 hover:underline">← Back to orders</Link>

      <div className="mt-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</h1>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-800">{order.status}</span>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Customer: {order.user?.name} ({order.user?.email})
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-gray-900">Items</h2>
            <div className="mt-3 space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-gray-100">
                    {item.image && <img src={item.image} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-gray-900">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-gray-900">Timeline</h2>
            <div className="mt-3 space-y-2">
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
          </div>
        </div>

        <div className="space-y-6">
          {/* Update status */}
          <form onSubmit={handleUpdateStatus} className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-gray-900">Update Status</h2>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Note (optional)"
              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="submit" disabled={updating}
              className="mt-3 w-full rounded-md bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {updating ? "Updating..." : "Update Status"}
            </button>
          </form>

          {/* Address */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
            <h2 className="font-semibold text-gray-900">Shipping Address</h2>
            <p className="mt-2 text-gray-600">
              {order.shippingAddress.name}<br />
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}<br />
              Phone: {order.shippingAddress.phone}
            </p>
          </div>

          {/* Pricing */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
            <h2 className="font-semibold text-gray-900">Payment</h2>
            <p className="mt-2 capitalize text-gray-600">Method: {order.payment.method}</p>
            <p className="capitalize text-gray-600">Status: {order.payment.status}</p>
            <div className="mt-3 space-y-1 border-t border-gray-100 pt-2">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{order.pricing.subtotal?.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.pricing.shipping === 0 ? "Free" : `₹${order.pricing.shipping}`}</span></div>
              <div className="flex justify-between font-semibold text-gray-900"><span>Total</span><span>₹{order.pricing.total?.toLocaleString("en-IN")}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
