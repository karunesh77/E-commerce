import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrdersApi } from "../api/orders.api";

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrdersApi()
      .then((res) => setOrders(res.data.data.orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-xl font-bold text-gray-900">My Orders</h1>

      {loading ? (
        <p className="mt-6 text-sm text-gray-500">Loading...</p>
      ) : orders.length === 0 ? (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">You haven't placed any orders yet.</p>
          <Link to="/products" className="mt-4 inline-block rounded-full bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:shadow-sm"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  {" · "}
                  {order.items.length} item{order.items.length > 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">₹{order.pricing.total?.toLocaleString("en-IN")}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[order.status] || "bg-gray-100 text-gray-800"}`}>
                  {order.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
