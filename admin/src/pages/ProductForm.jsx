import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import {
  getProductByIdApi,
  createProductApi,
  updateProductApi,
  uploadProductImagesApi,
  deleteProductImageApi,
} from "../api/products.api";
import { getCategoriesApi } from "../api/categories.api";
import PageHeader from "../components/PageHeader";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  discountPrice: "",
  stock: "",
  brand: "",
  category: "",
  isFeatured: false,
};

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getCategoriesApi({ activeOnly: true }).then((res) => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    getProductByIdApi(id).then((res) => {
      const p = res.data.data;
      setFormData({
        name: p.name || "",
        description: p.description || "",
        price: p.price ?? "",
        discountPrice: p.discountPrice ?? "",
        stock: p.stock ?? "",
        brand: p.brand || "",
        category: p.category?._id || p.category || "",
        isFeatured: p.isFeatured || false,
      });
      setImages(p.images || []);
    });
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const buildPayload = () => ({
    name: formData.name,
    description: formData.description,
    price: Number(formData.price),
    discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
    stock: Number(formData.stock),
    brand: formData.brand || undefined,
    category: formData.category || undefined,
    isFeatured: formData.isFeatured,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await updateProductApi(id, buildPayload());
        toast.success("Product updated");
        navigate("/products");
      } else {
        const res = await createProductApi(buildPayload());
        const newId = res.data.data._id;
        if (pendingFiles.length > 0) {
          const fd = new FormData();
          pendingFiles.forEach((f) => fd.append("images", f));
          await uploadProductImagesApi(newId, fd);
        }
        toast.success("Product created");
        navigate("/products");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save product");
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (isEdit) {
      setUploading(true);
      try {
        const fd = new FormData();
        files.forEach((f) => fd.append("images", f));
        const res = await uploadProductImagesApi(id, fd);
        setImages(res.data.data);
        toast.success("Images uploaded");
      } catch (err) {
        toast.error(err.response?.data?.message || "Upload failed");
      } finally {
        setUploading(false);
      }
    } else {
      setPendingFiles((prev) => [...prev, ...files]);
    }
    e.target.value = "";
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await deleteProductImageApi(id, imageId);
      setImages((prev) => prev.filter((img) => img._id !== imageId && img.public_id !== imageId));
      toast.success("Image removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not remove image");
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <PageHeader title={isEdit ? "Edit Product" : "Add Product"} />

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            name="name" required value={formData.name} onChange={handleChange}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description" required rows={4} value={formData.description} onChange={handleChange}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
            <input
              type="number" name="price" required min="0" value={formData.price} onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Discount Price (₹)</label>
            <input
              type="number" name="discountPrice" min="0" value={formData.discountPrice} onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock</label>
            <input
              type="number" name="stock" required min="0" value={formData.stock} onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Brand</label>
            <input
              name="brand" value={formData.brand} onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              name="category" value={formData.category} onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} />
          Featured product
        </label>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Images</label>
          <div className="mt-2 flex flex-wrap gap-3">
            {(isEdit ? images : pendingFiles.map((f) => ({ url: URL.createObjectURL(f), _local: true }))).map((img, i) => (
              <div key={img._id || img.public_id || i} className="relative h-20 w-20 overflow-hidden rounded border border-gray-200">
                <img src={img.url} alt="" className="h-full w-full object-cover" />
                {isEdit && (
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img._id || img.public_id)}
                    className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <input
            type="file" accept="image/*" multiple onChange={handleFileSelect} disabled={uploading}
            className="mt-3 text-sm text-gray-600"
          />
          {uploading && <p className="mt-1 text-xs text-gray-500">Uploading...</p>}
          {!isEdit && <p className="mt-1 text-xs text-gray-400">Images upload after the product is created.</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit" disabled={saving}
            className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
          </button>
          <button
            type="button" onClick={() => navigate("/products")}
            className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
