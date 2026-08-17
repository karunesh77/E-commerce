import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllOrdersApi } from "../api/orders.api";
import PageHeader from "../components/PageHeader";

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const STATUSES = ["", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAllOrdersApi({ status: status || undefined, page })
      .then((res) => {
        setOrders(res.data.data.orders);
        setPagination(res.data.data.pagination);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [status, page]);

  return (
    <div className="p-6 sm:p-8">
      <PageHeader title="Orders" />

      <div className="mt-4 flex gap-2">
        {STATUSES.map((s) => (
          <button
            key={s || "all"}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
              status === s ? "bg-indigo-600 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No orders found.</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o._id} className="cursor-pointer hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link to={`/orders/${o._id}`} className="font-medium text-indigo-600 hover:underline">
                      #{o._id.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{o.user?.name || o.user?.email}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">₹{o.pricing?.total?.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{o.payment?.method} · {o.payment?.status}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[o.status] || "bg-gray-100 text-gray-800"}`}>
                      {o.status}
                    </span>
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
