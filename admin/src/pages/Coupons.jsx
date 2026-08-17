import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { getCouponsApi, deleteCouponApi } from "../api/coupons.api";
import PageHeader from "../components/PageHeader";

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadCoupons = () => {
    setLoading(true);
    getCouponsApi({ page })
      .then((res) => {
        setCoupons(res.data.data.coupons);
        setPagination(res.data.data.pagination);
      })
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  };

  useEffect(loadCoupons, [page]);

  const handleDelete = async (id, code) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      await deleteCouponApi(id);
      toast.success("Coupon deleted");
      loadCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete coupon");
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <PageHeader
        title="Coupons"
        action={
          <Link
            to="/coupons/new"
            className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> Add Coupon
          </Link>
        }
      />

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Min Order</th>
              <th className="px-4 py-3">Usage</th>
              <th className="px-4 py-3">Valid Till</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No coupons yet.</td></tr>
            ) : (
              coupons.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-medium text-gray-900">{c.code}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {c.discountType === "percentage" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                  </td>
                  <td className="px-4 py-3 text-gray-600">₹{c.minOrderValue || 0}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.usedCount || 0}{c.maxUsageCount ? ` / ${c.maxUsageCount}` : ""}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.validTill ? new Date(c.validTill).toLocaleDateString("en-IN") : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link to={`/coupons/${c._id}/edit`} className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-indigo-600">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button onClick={() => handleDelete(c._id, c.code)} className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600">
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
