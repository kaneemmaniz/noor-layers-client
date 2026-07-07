import { useState, useEffect } from "react";
import { categoriesAPI } from "../../api";
import toast from "react-hot-toast";
import "./Admin.css";

const EMPTY_FORM = { name: "", slug: "" };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoriesAPI.getAll();
      const cats = Array.isArray(response.data) ? response.data : [];
      setCategories(cats);
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    
    // Auto-generate slug when name changes
    if (name === "name") {
      updated.slug = generateSlug(value);
    }
    
    setForm(updated);
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Category name is required";
    if (form.name.trim().length < 2) errs.name = "Name must be at least 2 characters";
    if (!form.slug.trim()) errs.slug = "Slug is required";
    
    // Check duplicate name (case-insensitive)
    const duplicate = categories.find(
      c => c.name.toLowerCase() === form.name.trim().toLowerCase() && c.id !== editingId
    );
    if (duplicate) errs.name = "Category name already exists";
    
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading(editingId ? "Updating category..." : "Creating category...");

    try {
      const data = {
        Name: form.name.trim(),
        Slug: form.slug.trim(),
      };

      if (editingId) {
        await categoriesAPI.update(editingId, data);
        toast.dismiss(loadingToast);
        toast.success("Category updated! ✨");
      } else {
        await categoriesAPI.create(data);
        toast.dismiss(loadingToast);
        toast.success("Category created! 🎉");
      }

      setForm(EMPTY_FORM);
      setEditingId(null);
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error("Save error:", err.response?.data);
      const msg = err.response?.data?.message
        || err.response?.data?.detail
        || "Failed to save category";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setForm({
      name: category.name || "",
      slug: category.slug || "",
    });
    setEditingId(category.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, name) => {
  toast((t) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "4px" }}>
      <div>
        <strong style={{ fontSize: "15px" }}>Delete "{name}"?</strong>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#666" }}>
          ⚠️ Products in this category may be affected.
        </p>
      </div>
      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
        <button
          onClick={() => toast.dismiss(t.id)}
          style={{
            padding: "6px 14px",
            border: "1px solid #ddd",
            background: "white",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          Cancel
        </button>
        <button
          onClick={async () => {
            toast.dismiss(t.id);
            
            // Optimistic update
            setCategories(prev => prev.filter(c => c.id !== id));
            const deleteToast = toast.loading(`Deleting "${name}"...`);
            
            try {
              await categoriesAPI.delete(id);
              toast.dismiss(deleteToast);
              toast.success(`"${name}" deleted`);
            } catch (err) {
              toast.dismiss(deleteToast);
              console.error("Delete error:", err.response?.data);
              fetchCategories(); // Restore
              const msg = err.response?.data?.detail 
                || "Cannot delete (may have products attached)";
              toast.error(msg);
            }
          }}
          style={{
            padding: "6px 14px",
            border: "none",
            background: "#dc3545",
            color: "white",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  ), { duration: 10000 });
};

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setErrors({});
  };

  return (
    <div className="nl-admin-page">
      <div className="container">
        {/* Header */}
        <div className="nl-admin-header">
          <div>
            <h1 className="nl-admin-title">Categories</h1>
            <p className="nl-admin-subtitle">Organize your product catalog</p>
          </div>
          {!showForm && (
            <button className="btn nl-btn" onClick={() => setShowForm(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18" style={{ marginRight: "8px" }}>
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add New Category
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="nl-admin-stats">
          <div className="nl-stat-card">
            <div className="nl-stat-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="22" height="22">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
            </div>
            <div>
              <div className="nl-stat-card__val">{categories.length}</div>
              <div className="nl-stat-card__label">Total Categories</div>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="nl-admin-form-card">
            <div className="nl-admin-form-head">
              <h2>{editingId ? "Edit Category" : "Add New Category"}</h2>
              <button className="nl-admin-close" onClick={handleCancel} type="button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="nl-form-label">Category Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g., Kaftans"
                    className={`nl-form-input ${errors.name ? 'error' : ''}`}
                  />
                  {errors.name && <span className="nl-form-error">{errors.name}</span>}
                </div>

                <div className="col-12 col-md-6">
                  <label className="nl-form-label">
                    Slug * 
                    <small style={{ fontWeight: "normal", color: "#888", marginLeft: "8px" }}>
                      (URL-friendly, auto-generated)
                    </small>
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    placeholder="e.g., kaftans"
                    className={`nl-form-input ${errors.slug ? 'error' : ''}`}
                  />
                  {errors.slug && <span className="nl-form-error">{errors.slug}</span>}
                </div>
              </div>

              <div className="nl-admin-form-actions">
                <button type="button" className="btn nl-btn-outline" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn nl-btn" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="nl-spinner" />
                      {editingId ? "Updating..." : "Creating..."}
                    </>
                  ) : editingId ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories Table */}
        <div className="nl-admin-products">
          <h2 className="nl-admin-products__title">All Categories</h2>

          {loading ? (
            <div className="nl-admin-loading">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="nl-admin-empty">
              <p>No categories yet. Add your first category to get started!</p>
            </div>
          ) : (
            <div className="nl-admin-table">
              <div className="nl-admin-table__head" style={{ gridTemplateColumns: "1fr 1fr 1fr auto" }}>
                <div>Name</div>
                <div>Slug</div>
                <div>Created</div>
                <div>Actions</div>
              </div>

              {categories.map((category) => (
                <div 
                  key={category.id} 
                  className="nl-admin-row"
                  style={{ gridTemplateColumns: "1fr 1fr 1fr auto" }}
                >
                  <div className="nl-admin-row__name" style={{ fontWeight: 600 }}>
                    {category.name}
                  </div>
                  <div style={{ color: "#888", fontFamily: "monospace", fontSize: "13px" }}>
                    {category.slug || "—"}
                  </div>
                  <div style={{ color: "#666", fontSize: "13px" }}>
                    {category.createdAt 
                      ? new Date(category.createdAt).toLocaleDateString() 
                      : "—"}
                  </div>
                  <div className="nl-admin-row__actions">
                    <button
                      className="nl-icon-btn nl-icon-btn--edit"
                      onClick={() => handleEdit(category)}
                      title="Edit"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      className="nl-icon-btn nl-icon-btn--delete"
                      onClick={() => handleDelete(category.id, category.name)}
                      title="Delete"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}