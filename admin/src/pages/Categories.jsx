import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { getCategoriesApi, createCategoryApi, updateCategoryApi, deleteCategoryApi } from "../api/categories.api";
import PageHeader from "../components/PageHeader";

const emptyForm = { name: "", description: "", parent: "", isActive: true };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadCategories = () => {
    setLoading(true);
    getCategoriesApi()
      .then((res) => setCategories(res.data.data))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  };

  useEffect(loadCategories, []);

  const openCreateForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setImageFile(null);
    setShowForm(true);
  };

  const openEditForm = (cat) => {
    setEditingId(cat._id);
    setFormData({
      name: cat.name,
      description: cat.description || "",
      parent: cat.parent?._id || "",
      isActive: cat.isActive,
    });
    setImageFile(null);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("description", formData.description);
      fd.append("parent", formData.parent);
      fd.append("isActive", formData.isActive);
      if (imageFile) fd.append("image", imageFile);

      if (editingId) {
        await updateCategoryApi(editingId, fd);
        toast.success("Category updated");
      } else {
        await createCategoryApi(fd);
        toast.success("Category created");
      }
      setShowForm(false);
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await deleteCategoryApi(id);
      toast.success("Category deleted");
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete category");
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <PageHeader
        title="Categories"
        action={
          <button
            onClick={openCreateForm}
            className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> Add Category
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 max-w-lg space-y-3 rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">{editingId ? "Edit Category" : "New Category"}</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>

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
              name="description" rows={2} value={formData.description} onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Parent Category</label>
            <select
              name="parent" value={formData.parent} onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">None (top-level)</option>
              {categories
                .filter((c) => c._id !== editingId)
                .map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="mt-1 text-sm text-gray-600" />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
            Active
          </label>

          <button
            type="submit" disabled={saving}
            className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : editingId ? "Update" : "Create"}
          </button>
        </form>
      )}

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Parent</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No categories yet.</td></tr>
            ) : (
              categories.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="flex items-center gap-3 px-4 py-3 font-medium text-gray-900">
                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-gray-100">
                      {c.image?.url && <img src={c.image.url} alt="" className="h-full w-full object-cover" />}
                    </div>
                    {c.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.parent?.name || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditForm(c)} className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-indigo-600">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(c._id, c.name)} className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600">
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
    </div>
  );
}
