import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getCouponByIdApi, createCouponApi, updateCouponApi } from "../api/coupons.api";
import PageHeader from "../components/PageHeader";

const emptyForm = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  maxDiscount: "",
  minOrderValue: "0",
  maxUsageCount: "",
  maxUsagePerUser: "1",
  validFrom: "",
  validTill: "",
  isActive: true,
};

const toDateInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : "");

export default function CouponForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    getCouponByIdApi(id).then((res) => {
      const c = res.data.data;
      setFormData({
        code: c.code,
        description: c.description || "",
        discountType: c.discountType,
        discountValue: c.discountValue,
        maxDiscount: c.maxDiscount ?? "",
        minOrderValue: c.minOrderValue ?? "0",
        maxUsageCount: c.maxUsageCount ?? "",
        maxUsagePerUser: c.maxUsagePerUser ?? "1",
        validFrom: toDateInput(c.validFrom),
        validTill: toDateInput(c.validTill),
        isActive: c.isActive,
      });
    });
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const buildPayload = () => ({
    code: formData.code.toUpperCase(),
    description: formData.description || undefined,
    discountType: formData.discountType,
    discountValue: Number(formData.discountValue),
    maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
    minOrderValue: Number(formData.minOrderValue) || 0,
    maxUsageCount: formData.maxUsageCount ? Number(formData.maxUsageCount) : undefined,
    maxUsagePerUser: Number(formData.maxUsagePerUser) || 1,
    validFrom: new Date(formData.validFrom).toISOString(),
    validTill: new Date(formData.validTill).toISOString(),
    isActive: formData.isActive,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await updateCouponApi(id, buildPayload());
        toast.success("Coupon updated");
      } else {
        await createCouponApi(buildPayload());
        toast.success("Coupon created");
      }
      navigate("/coupons");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save coupon");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <PageHeader title={isEdit ? "Edit Coupon" : "Add Coupon"} />

      <form onSubmit={handleSubmit} className="mt-6 max-w-lg space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Coupon Code</label>
          <input
            name="code" required value={formData.code} onChange={handleChange}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm uppercase"
            placeholder="e.g. WELCOME50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <input
            name="description" value={formData.description} onChange={handleChange}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Discount Type</label>
            <select
              name="discountType" value={formData.discountType} onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed (₹)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Discount Value</label>
            <input
              type="number" name="discountValue" required min="0" value={formData.discountValue} onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        {formData.discountType === "percentage" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Discount Cap (₹, optional)</label>
            <input
              type="number" name="maxDiscount" min="0" value={formData.maxDiscount} onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Min Order Value (₹)</label>
            <input
              type="number" name="minOrderValue" min="0" value={formData.minOrderValue} onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Usage / User</label>
            <input
              type="number" name="maxUsagePerUser" min="1" value={formData.maxUsagePerUser} onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Total Usage Limit (optional)</label>
          <input
            type="number" name="maxUsageCount" min="1" value={formData.maxUsageCount} onChange={handleChange}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Unlimited if left blank"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Valid From</label>
            <input
              type="date" name="validFrom" required value={formData.validFrom} onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Valid Till</label>
            <input
              type="date" name="validTill" required value={formData.validTill} onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
          Active
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="submit" disabled={saving}
            className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : isEdit ? "Update Coupon" : "Create Coupon"}
          </button>
          <button
            type="button" onClick={() => navigate("/coupons")}
            className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
