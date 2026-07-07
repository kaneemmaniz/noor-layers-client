import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { productsAPI, categoriesAPI } from "../../api";
import toast from "react-hot-toast";
import "./Admin.css";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  stockQuantity: "",
  categoryId: "",
  isAvailable: true,
  frontImage: null,
  backImage: null,
  sideImage: null,
};

export default function AdminProducts() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const sideRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      const cats = Array.isArray(response.data) ? response.data : [];
      console.log("📁 Categories loaded:", cats);
      setCategories(cats);
    } catch (err) {
      console.error("Failed to load categories:", err);
      toast.error("Failed to load categories");
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getAll({ page: 1, pageSize: 100 });
      setProducts(response.data?.items || []);
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be smaller than 5MB");
        return;
      }
      
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      
      setForm({ ...form, [name]: file });
      if (errors[name]) setErrors({ ...errors, [name]: "" });
    }
  };

  const handleRemoveFile = (fieldName) => {
    setForm({ ...form, [fieldName]: null });
    if (fieldName === "frontImage" && frontRef.current) frontRef.current.value = "";
    if (fieldName === "backImage" && backRef.current) backRef.current.value = "";
    if (fieldName === "sideImage" && sideRef.current) sideRef.current.value = "";
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Product name is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (!form.price || Number(form.price) <= 0) errs.price = "Valid price is required";
    if (!form.stockQuantity || Number(form.stockQuantity) < 0) errs.stockQuantity = "Stock is required";
    if (!form.categoryId.trim()) errs.categoryId = "Category is required";
    if (!editingId && !(form.frontImage instanceof File)) errs.frontImage = "Front image is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("Please fix the errors in the form");
      return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading(editingId ? "Updating product..." : "Creating product...");
    
    try {
      // Step 1: Create/Update product (PascalCase for backend)
      const productData = {
        Name: form.name.trim(),
        Description: form.description.trim(),
        Price: Number(form.price),
        StockQuantity: Number(form.stockQuantity),
        CategoryId: form.categoryId,
        IsAvailable: form.isAvailable,
      };

      console.log("📝 Saving product:", productData);

      let productId;
      if (editingId) {
        await productsAPI.update(editingId, productData);
        productId = editingId;
        console.log("✅ Product updated:", productId);
      } else {
        const response = await productsAPI.create(productData);
        productId = response.data?.id || response.data?.data?.id;
        console.log("✅ Product created:", productId);
      }

      // Step 2: Upload images if any new files selected
      const hasNewImages = form.frontImage instanceof File 
        || form.backImage instanceof File 
        || form.sideImage instanceof File;
      
      if (hasNewImages && productId) {
        toast.dismiss(loadingToast);
        const uploadToast = toast.loading("Uploading images...");
        
        console.log("🖼️ Uploading images...");
        const imgData = new FormData();
        if (form.frontImage instanceof File) imgData.append("FrontImage", form.frontImage);
        if (form.backImage instanceof File) imgData.append("BackImage", form.backImage);
        if (form.sideImage instanceof File) imgData.append("SideImage", form.sideImage);
        
        await productsAPI.uploadImages(productId, imgData);
        console.log("✅ Images uploaded!");
        toast.dismiss(uploadToast);
      } else {
        toast.dismiss(loadingToast);
      }

      toast.success(editingId ? "Product updated! ✨" : "Product created! 🎉");

setForm(EMPTY_FORM);
setEditingId(null);
setShowForm(false);

// Small delay to ensure backend has committed the write
await new Promise(resolve => setTimeout(resolve, 500));
await fetchProducts();
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error("❌ Save error:", err.response?.data || err);
      const msg = err.response?.data?.message
        || err.response?.data?.title
        || err.response?.data?.detail
        || err.message
        || "Failed to save product";
      toast.error(typeof msg === "string" ? msg : "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
  // Backend returns category ID in 'category' field
  const productCategoryId = product.categoryId || product.category;
  const matchingCategory = categories.find(c => c.id === productCategoryId);
  
  setForm({
    name: product.name || "",
    description: product.description || "",
    price: product.originalPrice || product.finalPrice || product.price || "",
    stockQuantity: product.stockQuantity || "",
    categoryId: matchingCategory?.id || productCategoryId || "",
    isAvailable: product.isAvailable !== false,
    frontImage: product.frontImageUrl || null,
    backImage: product.backImageUrl || null,
    sideImage: product.sideImageUrl || null,
  });
  setEditingId(product.id);
  setShowForm(true);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

  const handleDelete = async (id, name) => {
  // Custom toast confirmation (no ugly browser popup!)
  toast((t) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "4px" }}>
      <div>
        <strong style={{ fontSize: "15px" }}>Delete "{name}"?</strong>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#666" }}>
          This action cannot be undone.
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
            
            // Optimistic update - remove immediately from UI
            setProducts(prev => prev.filter(p => p.id !== id));
            const deleteToast = toast.loading(`Deleting "${name}"...`);
            
            try {
              await productsAPI.delete(id);
              toast.dismiss(deleteToast);
              toast.success(`"${name}" deleted`);
            } catch (err) {
              toast.dismiss(deleteToast);
              console.error("Delete error:", err.response?.data);
              // Revert if failed - restore product to list
              fetchProducts();
              const msg = err.response?.data?.detail || "Failed to delete";
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
  ), { duration: 10000 }); // Auto-dismiss after 10 seconds
};

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setErrors({});
  };

  const getPreviewUrl = (fileOrUrl) => {
    if (!fileOrUrl) return null;
    if (fileOrUrl instanceof File) return URL.createObjectURL(fileOrUrl);
    if (typeof fileOrUrl === "string") return fileOrUrl;
    return null;
  };

  // Helper: Get category name from ID
  const getCategoryName = (product) => {
  // Backend returns categoryId in 'category' field
  const categoryId = product.categoryId || product.category;
  const cat = categories.find(c => c.id === categoryId);
  return cat?.name || "—";
};

  const FileUploader = ({ name, label, required, fileRef, error }) => {
    const file = form[name];
    const previewUrl = getPreviewUrl(file);
    const inputId = `file-${name}`;

    return (
      <div className={`nl-file-upload ${error ? 'error' : ''} ${previewUrl ? 'has-file' : ''}`}>
        <label htmlFor={inputId} className="nl-file-upload__label">
          {previewUrl ? (
            <>
              <img src={previewUrl} alt={label} className="nl-file-upload__preview" />
              <button
                type="button"
                className="nl-file-upload__remove"
                onClick={(e) => {
                  e.preventDefault();
                  handleRemoveFile(name);
                }}
                title="Remove image"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <div className="nl-file-upload__overlay">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
                  <path d="M21 19a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h3l2-3h4l2 3h3a2 2 0 012 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <span>Change Image</span>
              </div>
            </>
          ) : (
            <div className="nl-file-upload__empty">
              <div className="nl-file-upload__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <div className="nl-file-upload__text">
                <strong>{label}</strong>
                {required && <span className="nl-file-upload__required">*</span>}
                <small>Click to upload</small>
                <small className="nl-file-upload__hint">PNG, JPG up to 5MB</small>
              </div>
            </div>
          )}
        </label>
        <input
          ref={fileRef}
          id={inputId}
          type="file"
          name={name}
          accept="image/*"
          onChange={handleFileChange}
          className="nl-file-upload__input"
        />
        {error && <span className="nl-form-error">{error}</span>}
      </div>
    );
  };

  return (
    <div className="nl-admin-page">
      <div className="container">
        <div className="nl-admin-header">
          <div>
            <h1 className="nl-admin-title">Products</h1>
            <p className="nl-admin-subtitle">Manage your store's product catalog</p>
          </div>
          {!showForm && (
  <div style={{ display: "flex", gap: "8px" }}>
    <button 
      className="btn nl-btn-outline" 
      onClick={fetchProducts}
      title="Refresh"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <polyline points="23 4 23 10 17 10"/>
        <polyline points="1 20 1 14 7 14"/>
        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
      </svg>
    </button>
    <button 
      className="btn nl-btn" 
      onClick={() => setShowForm(true)}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18" style={{ marginRight: "8px" }}>
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      Add New Product
    </button>
  </div>
)}
        </div>

        <div className="nl-admin-stats">
          <div className="nl-stat-card">
            <div className="nl-stat-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="22" height="22">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              </svg>
            </div>
            <div>
              <div className="nl-stat-card__val">{products.length}</div>
              <div className="nl-stat-card__label">Total Products</div>
            </div>
          </div>

          <div className="nl-stat-card">
            <div className="nl-stat-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="22" height="22">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div>
              <div className="nl-stat-card__val">
                {products.filter(p => p.isAvailable).length}
              </div>
              <div className="nl-stat-card__label">Available</div>
            </div>
          </div>

          <div className="nl-stat-card">
            <div className="nl-stat-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="22" height="22">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div>
              <div className="nl-stat-card__val">
                {products.filter(p => (p.stockQuantity || 0) <= 5).length}
              </div>
              <div className="nl-stat-card__label">Low Stock</div>
            </div>
          </div>

          <div className="nl-stat-card">
            <div className="nl-stat-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="22" height="22">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
            </div>
            <div>
              <div className="nl-stat-card__val">
                ₦{products.reduce((sum, p) => sum + ((p.finalPrice || 0) * (p.stockQuantity || 0)), 0).toLocaleString()}
              </div>
              <div className="nl-stat-card__label">Inventory Value</div>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="nl-admin-form-card">
            <div className="nl-admin-form-head">
              <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>
              <button className="nl-admin-close" onClick={handleCancel} type="button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12 col-md-8">
                  <label className="nl-form-label">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g., Premium Chiffon Hijab"
                    className={`nl-form-input ${errors.name ? 'error' : ''}`}
                  />
                  {errors.name && <span className="nl-form-error">{errors.name}</span>}
                </div>

                <div className="col-12 col-md-4">
                  <label className="nl-form-label">Category *</label>
                  <select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                    className={`nl-form-input ${errors.categoryId ? 'error' : ''}`}
                  >
                    <option value="">Select category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.categoryId && <span className="nl-form-error">{errors.categoryId}</span>}
                  {categories.length === 0 && (
                    <small style={{ color: "#c00" }}>⚠️ No categories loaded</small>
                  )}
                </div>

                <div className="col-12">
                  <label className="nl-form-label">Description *</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe the product, materials, fit, etc."
                    rows="4"
                    className={`nl-form-input ${errors.description ? 'error' : ''}`}
                  />
                  {errors.description && <span className="nl-form-error">{errors.description}</span>}
                </div>

                <div className="col-12 col-md-4">
                  <label className="nl-form-label">Price (₦) *</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    step="100"
                    className={`nl-form-input ${errors.price ? 'error' : ''}`}
                  />
                  {errors.price && <span className="nl-form-error">{errors.price}</span>}
                </div>

                <div className="col-12 col-md-4">
                  <label className="nl-form-label">Stock Quantity *</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={form.stockQuantity}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    className={`nl-form-input ${errors.stockQuantity ? 'error' : ''}`}
                  />
                  {errors.stockQuantity && <span className="nl-form-error">{errors.stockQuantity}</span>}
                </div>

                <div className="col-12 col-md-4 d-flex align-items-end">
                  <label className="nl-toggle">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={form.isAvailable}
                      onChange={handleChange}
                    />
                    <span className="nl-toggle__slider" />
                    <span className="nl-toggle__label">
                      {form.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </label>
                </div>

                <div className="col-12">
                  <h3 className="nl-form-section-title">Product Images</h3>
                  <p className="nl-form-hint">
                    📸 Upload up to 3 images. Front image is required. Max 5MB each.
                  </p>
                </div>

                <div className="col-12 col-md-4">
                  <FileUploader
                    name="frontImage"
                    label="Front View"
                    required
                    fileRef={frontRef}
                    error={errors.frontImage}
                  />
                </div>

                <div className="col-12 col-md-4">
                  <FileUploader
                    name="backImage"
                    label="Back View"
                    fileRef={backRef}
                  />
                </div>

                <div className="col-12 col-md-4">
                  <FileUploader
                    name="sideImage"
                    label="Side View"
                    fileRef={sideRef}
                  />
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
                  ) : editingId ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="nl-admin-products">
          <h2 className="nl-admin-products__title">All Products</h2>

          {loading ? (
            <div className="nl-admin-loading">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="nl-admin-empty">
              <p>No products yet. Add your first product to get started!</p>
            </div>
          ) : (
            <div className="nl-admin-table">
              <div className="nl-admin-table__head">
                <div>Image</div>
                <div>Product</div>
                <div>Category</div>
                <div>Price</div>
                <div>Stock</div>
                <div>Status</div>
                <div>Actions</div>
              </div>

              {products.map((product) => (
                <div key={product.id} className="nl-admin-row">
                  <div className="nl-admin-row__img">
                    <img
                      src={product.frontImageUrl || "/product1.png"}
                      alt={product.name}
                      onError={(e) => { e.target.src = "/product1.png"; }}
                    />
                  </div>
                  <div>
                    <div className="nl-admin-row__name">{product.name}</div>
                    <div className="nl-admin-row__desc">{product.description}</div>
                  </div>
                  <div>{getCategoryName(product)}</div>
                  <div className="nl-admin-row__price">
                    ₦{Number(product.finalPrice || product.originalPrice || 0).toLocaleString()}
                  </div>
                  <div>
                    <span className={`nl-stock ${(product.stockQuantity || 0) <= 5 ? 'low' : ''}`}>
                      {product.stockQuantity || 0}
                    </span>
                  </div>
                  <div>
                    <span className={`nl-status ${product.isAvailable ? 'active' : 'inactive'}`}>
                      {product.isAvailable ? "Active" : "Hidden"}
                    </span>
                  </div>
                  <div className="nl-admin-row__actions">
                    <button
                      className="nl-icon-btn nl-icon-btn--edit"
                      onClick={() => handleEdit(product)}
                      title="Edit"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      className="nl-icon-btn nl-icon-btn--delete"
                      onClick={() => handleDelete(product.id, product.name)}
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