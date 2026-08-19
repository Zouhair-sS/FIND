"use client";

import { useEffect, useState, useRef } from "react";
import { fetchAdminBrands, createAdminBrand, updateAdminBrand, deleteAdminBrand, getImageUrl } from "@/lib/api";
import { Layers, Plus, Search, Edit, Trash2, CheckSquare, X, Check, Image as ImageIcon } from "lucide-react";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { AnimatePresence, motion } from "framer-motion";

function BrandModal({
  isOpen,
  onClose,
  onSave,
  brand,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData) => Promise<void>;
  brand: any;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(brand?.name || "");
      setSlug(brand?.slug || "");
      setImageFile(null);
      setImagePreview(brand?.image_url ? getImageUrl(brand.image_url) : null);
      setError("");
    }
  }, [isOpen, brand]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      setError("Name and slug are required.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("slug", slug);
      if (imageFile) {
        formData.append("image", imageFile);
      }
      
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save brand.");
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
            {brand ? "Edit Brand" : "Add Brand"}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 text-[13px] rounded-lg">{error}</div>}
          
          <div className="flex flex-col items-center mb-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all overflow-hidden relative group"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Brand" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <ImageIcon className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-medium uppercase tracking-wider">Logo</span>
                </div>
              )}
              {imagePreview && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-[11px] font-medium">Change</span>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

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
              placeholder="e.g. Apple"
            />
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

export default function AdminBrands() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const loadBrands = () => {
    setLoading(true);
    fetchAdminBrands()
      .then((data) => {
        setBrands(data || []);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleSave = async (data: FormData) => {
    if (editingBrand) {
      await updateAdminBrand(editingBrand.id, data);
    } else {
      await createAdminBrand(data);
    }
    loadBrands();
  };

  const handleDelete = async () => {
    if (isBulkDelete) {
      try {
        const ids = Array.from(selectedIds);
        for (const id of ids) {
          await deleteAdminBrand(id);
        }
        setBrands(brands.filter(c => !selectedIds.has(c.id)));
        setSelectedIds(new Set());
        setSelectionMode(false);
      } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.message || "Failed to delete some brands.");
      }
    } else if (deletingId) {
      try {
        await deleteAdminBrand(deletingId);
        setBrands(brands.filter(c => c.id !== deletingId));
      } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.message || "Failed to delete brand");
      }
    }
    setConfirmOpen(false);
  };

  const filtered = search 
    ? brands.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()))
    : brands;

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
            <Layers className="w-6 h-6 text-primary" />
            Brands
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">
            Manage your product brands and logos.
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
                  setEditingBrand(null);
                  setModalOpen(true);
                }}
                className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-[13px] font-semibold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
              >
                <Plus className="w-4 h-4" />
                Add Brand
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
              placeholder="Search brands..."
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
                <Layers className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-[14px] font-medium text-gray-900">No brands found</p>
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
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-y border-gray-100 w-16">Logo</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-y border-gray-100">Name</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-y border-gray-100">Slug</th>
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
                      <div className="w-10 h-10 rounded-lg border border-gray-100 bg-white flex items-center justify-center overflow-hidden">
                        {cat.image_url ? (
                          <img src={getImageUrl(cat.image_url)} alt={cat.name} className="w-full h-full object-contain p-1" />
                        ) : (
                          <span className="text-[12px] font-bold text-gray-400">{cat.name.substring(0, 1).toUpperCase()}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] font-semibold text-gray-900">{cat.name}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] text-gray-500 font-mono bg-gray-100 inline-block px-2 py-0.5 rounded">{cat.slug}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setEditingBrand(cat);
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
          <BrandModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onSave={handleSave}
            brand={editingBrand}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title={isBulkDelete ? "Delete Selected Brands" : "Delete Brand"}
        message={isBulkDelete ? `Are you sure you want to delete ${selectedIds.size} selected brands? This action cannot be undone.` : "Are you sure you want to delete this brand? This action cannot be undone."}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
