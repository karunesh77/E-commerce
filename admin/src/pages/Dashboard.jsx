import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Package, ShoppingBag, IndianRupee, AlertTriangle } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { getDashboardStatsApi, getTopProductsApi, getInventoryStatusApi } from "../api/admin.api";
import StatCard from "../components/StatCard";

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStatsApi(), getTopProductsApi({ limit: 5 }), getInventoryStatusApi({ limit: 10 })])
      .then(([statsRes, topRes, invRes]) => {
        setStats(statsRes.data.data);
        setTopProducts(topRes.data.data);
        setInventory(invRes.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-sm text-gray-500">Loading dashboard...</div>;
  if (!stats) return <div className="p-8 text-sm text-gray-500">Could not load dashboard.</div>;

  const statusData = Object.entries(stats.ordersByStatus || {}).map(([status, count]) => ({
    status,
    count,
  }));

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats.totalUsers} icon={Users} accent="indigo" />
        <StatCard label="Total Products" value={stats.totalProducts} icon={Package} accent="green" />
        <StatCard label="Total Orders" value={stats.totalOrders} icon={ShoppingBag} accent="amber" />
        <StatCard
          label="Revenue (Delivered)"
          value={`₹${stats.totalRevenue?.toLocaleString("en-IN")}`}
          icon={IndianRupee}
          accent="indigo"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Orders by status chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900">Orders by Status</h2>
          {statusData.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No orders yet.</p>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900">Top Products (by reviews)</h2>
          {topProducts.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No products yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="truncate text-gray-700">{p.name}</span>
                  <span className="shrink-0 text-gray-500">
                    ⭐ {p.ratings || 0} ({p.numReviews || 0})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/orders" className="text-xs font-medium text-indigo-600 hover:underline">
              View all
            </Link>
          </div>
          {stats.recentOrders?.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No orders yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {stats.recentOrders?.map((order) => (
                <Link
                  key={order._id}
                  to={`/orders/${order._id}`}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-500">{order.user?.name || order.user?.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">₹{order.pricing?.total?.toLocaleString("en-IN")}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_STYLES[order.status] || "bg-gray-100 text-gray-800"}`}>
                      {order.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Inventory alerts */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Low / Out of Stock
          </h2>
          <div className="mt-4 space-y-2">
            {inventory?.outOfStockProducts?.map((p) => (
              <div key={p._id} className="flex items-center justify-between text-sm">
                <span className="truncate text-gray-700">{p.name}</span>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">Out of stock</span>
              </div>
            ))}
            {inventory?.lowStockProducts
              ?.filter((p) => p.stock > 0)
              .map((p) => (
                <div key={p._id} className="flex items-center justify-between text-sm">
                  <span className="truncate text-gray-700">{p.name}</span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">{p.stock} left</span>
                </div>
              ))}
            {inventory?.outOfStockProducts?.length === 0 && inventory?.lowStockProducts?.length === 0 && (
              <p className="text-sm text-gray-500">Stock levels look healthy.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
