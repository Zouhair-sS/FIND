"use client";

import { useEffect, useState } from "react";
import { fetchAdminCategories, createAdminCategory, updateAdminCategory, deleteAdminCategory, fetchAdminBrands } from "@/lib/api";
import { FolderTree, Plus, Search, Edit, Trash2, CheckSquare, X, Check } from "lucide-react";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { AnimatePresence, motion } from "framer-motion";

function CategoryModal({
  isOpen,
  onClose,
  onSave,
  category,
  categories,
  brands,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; slug: string; parent_id?: number | null, brand_ids?: number[] }) => Promise<void>;
  category: any;
  categories: any[];
  brands: any[];
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<number | "">("");
  const [brandIds, setBrandIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(category?.name || "");
      setSlug(category?.slug || "");
      setParentId(category?.parent_id || "");
      setBrandIds(category?.brands?.map((b: any) => b.id) || []);
      setError("");
    }
  }, [isOpen, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      setError("Name and slug are required.");
      return;
    }
    setLoading(true);
    try {
      await onSave({ 
        name, 
        slug, 
        parent_id: parentId === "" ? null : Number(parentId),
        brand_ids: brandIds
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save category.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {category ? "Edit Category" : "Add Category"}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 text-[13px] rounded-lg">{error}</div>}
          
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
              }}
              className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="e.g. Smart Home"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Parent Category (Optional)</label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
            >
              <option value="">None</option>
              {categories.filter((c: any) => !c.parent_id && c.id !== category?.id).map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-2">Allowed Brands (Optional)</label>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50/50">
              {brands.map(brand => (
                <label key={brand.id} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={brandIds.includes(brand.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setBrandIds([...brandIds, brand.id]);
                      } else {
                        setBrandIds(brandIds.filter(id => id !== brand.id));
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-[13px] text-gray-700 group-hover:text-gray-900">{brand.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-[13px] font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const loadCategories = () => {
    setLoading(true);
    Promise.all([fetchAdminCategories(), fetchAdminBrands()])
      .then(([cats, brnds]) => {
        setCategories(cats || []);
        setBrands(brnds || []);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSave = async (data: { name: string; slug: string; brand_ids?: number[] }) => {
    if (editingCategory) {
      await updateAdminCategory(editingCategory.id, data);
    } else {
      await createAdminCategory(data);
    }
    loadCategories();
  };

  const handleDelete = async () => {
    if (isBulkDelete) {
      try {
        const ids = Array.from(selectedIds);
        for (const id of ids) {
          await deleteAdminCategory(id);
        }
        setCategories(categories.filter(c => !selectedIds.has(c.id)));
        setSelectedIds(new Set());
        setSelectionMode(false);
      } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.message || "Failed to delete some categories.");
      }
    } else if (deletingId) {
      try {
        await deleteAdminCategory(deletingId);
        setCategories(categories.filter(c => c.id !== deletingId));
      } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.message || "Failed to delete category");
      }
    }
    setConfirmOpen(false);
  };

  const buildTree = (cats: any[]) => {
    const map = new Map();
    cats.forEach(c => map.set(c.id, { ...c, children: [] }));
    const tree: any[] = [];
    map.forEach(c => {
      if (c.parent_id && map.has(c.parent_id)) {
        map.get(c.parent_id).children.push(c);
      } else {
        tree.push(c);
      }
    });
    
    const display: any[] = [];
    const flatten = (nodes: any[], level = 0) => {
      nodes.forEach(n => {
        display.push({ ...n, level });
        if (n.children && n.children.length > 0) {
          flatten(n.children, level + 1);
        }
      });
    };
    flatten(tree);
    return display;
  };

  const filtered = search 
    ? categories.filter(c => c.name?.toLowerCase().includes(search.toLowerCase())).map(c => ({...c, level: 0}))
    : buildTree(categories);

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(c => c.id)));
    }
  };

  const toggleSelect = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 tracking-[-0.03em] flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-primary" />
            Categories
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">
            Manage your product categories and subcategories.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectionMode ? (
            <>
              <button 
                onClick={() => {
                  setSelectionMode(false);
                  setSelectedIds(new Set());
                }}
                className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-[13px] font-semibold hover:bg-gray-200 transition-all shadow-sm"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (selectedIds.size === 0) return;
                  setIsBulkDelete(true);
                  setConfirmOpen(true);
                }}
                disabled={selectedIds.size === 0}
                className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-[13px] font-semibold hover:bg-red-700 transition-all shadow-sm disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected ({selectedIds.size})
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setSelectionMode(true)}
                className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-[13px] font-semibold hover:bg-gray-200 transition-all shadow-sm"
              >
                <CheckSquare className="w-4 h-4" />
                Select
              </button>
              <button 
                onClick={() => {
                  setEditingCategory(null);
                  setModalOpen(true);
                }}
                className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-[13px] font-semibold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 flex items-center justify-center h-40">
              <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                <FolderTree className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-[14px] font-medium text-gray-900">No categories found</p>
              <p className="text-[13px] text-gray-500 mt-1">Try adjusting your search or create a new one.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  {selectionMode && (
                    <th className="px-5 py-3.5 w-[50px] border-y border-gray-100">
                      <button 
                        onClick={toggleSelectAll}
                        className={`w-4 h-4 rounded flex items-center justify-center transition-colors border ${selectedIds.size === filtered.length && filtered.length > 0 ? 'bg-primary border-primary text-white' : 'border-gray-300 hover:border-primary'}`}
                      >
                        {selectedIds.size === filtered.length && filtered.length > 0 && <Check className="w-3 h-3" />}
                      </button>
                    </th>
                  )}
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-y border-gray-100">Name</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-y border-gray-100">Slug</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-y border-gray-100">Products</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-y border-gray-100">Brands</th>
                  <th className="px-5 py-3.5 border-y border-gray-100"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence initial={false}>
                  {filtered.map((cat) => (
                    <motion.tr 
                      key={cat.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      {selectionMode && (
                        <td className="px-5 py-3.5">
                          <button 
                            onClick={() => toggleSelect(cat.id)}
                            className={`w-4 h-4 rounded flex items-center justify-center transition-colors border ${selectedIds.has(cat.id) ? 'bg-primary border-primary text-white' : 'border-gray-300 hover:border-primary'}`}
                          >
                            {selectedIds.has(cat.id) && <Check className="w-3 h-3" />}
                          </button>
                        </td>
                      )}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2" style={{ paddingLeft: cat.level ? `${cat.level * 1.5}rem` : '0' }}>
                        {cat.level > 0 && <span className="w-3 h-[1px] bg-gray-300 inline-block"></span>}
                        <p className="text-[13px] font-semibold text-gray-900">{cat.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] text-gray-500 font-mono bg-gray-100 inline-block px-2 py-0.5 rounded">{cat.slug}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[13px] font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded-md">
                        {cat.products_count || 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[13px] font-medium text-gray-900 bg-primary/10 text-primary px-2 py-1 rounded-md">
                        {cat.brands?.length || 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setEditingCategory(cat);
                            setModalOpen(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded transition-colors" 
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setIsBulkDelete(false);
                            setDeletingId(cat.id);
                            setConfirmOpen(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" 
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <CategoryModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onSave={handleSave}
            category={editingCategory}
            categories={categories}
            brands={brands}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title={isBulkDelete ? "Delete Selected Categories" : "Delete Category"}
        message={isBulkDelete ? `Are you sure you want to delete ${selectedIds.size} selected categories? This action cannot be undone.` : "Are you sure you want to delete this category? This action cannot be undone."}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
