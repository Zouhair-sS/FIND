"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchAdminMetadata, createAdminProduct } from "@/lib/api";
import ColorPickerField from "@/components/admin/ColorPickerField";
import BrandSelector from "@/components/admin/BrandSelector";
import CategorySelector from "@/components/admin/CategorySelector";
import CustomSelect from "@/components/admin/CustomSelect";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { useToast } from "@/components/admin/Toast";
import Link from "next/link";
import { ArrowLeft, Save, ChevronRight, Package, Loader2 } from "lucide-react";



export default function NewProductWizard() {
  const router = useRouter();
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [subcategoryVisible, setSubcategoryVisible] = useState(false);
  const { success, error: showError } = useToast();
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isAlert?: boolean;
    variant?: "danger" | "warning" | "info" | "success";
    onConfirm?: () => void;
  }>({ isOpen: false, title: "", message: "" });

  const [formData, setFormData] = useState({
    name: "",
    brand_id: "",
    category_id: "",
    series_id: "",
    description: "",
    variants: [{
      price: "",
      stock_quantity: "0",
      color: "",
      storage_gb: "",
      ram_gb: "",
      processor: "",
      screen_size: "",
    }]
  });

  useEffect(() => {
    fetchAdminMetadata().then(res => {
      setMetadata(res);
      setLoading(false);
    });
  }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      const category = metadata?.categories?.find((c: any) => c.id == formData.category_id)?.name || 'CAT';
      const brand = metadata?.brands?.find((b: any) => b.id == formData.brand_id)?.name || 'BRND';
      const catPrefix = category.substring(0, 3).toUpperCase();
      const brandPrefix = brand.substring(0, 3).toUpperCase();
      const randStr = Math.random().toString(36).substring(2, 6).toUpperCase();
      const baseSku = `${brandPrefix}-${catPrefix}-${randStr}`;

      const payload = {
        ...formData,
        status: "active",
        sku: baseSku,
        variants: formData.variants.map((v, i) => ({
          ...v,
          sku: `${baseSku}-V${i + 1}`,
          price: Number(v.price) || 0,
          stock_quantity: Number(v.stock_quantity) || 0,
          storage_gb: v.storage_gb ? Number(v.storage_gb) : null,
          ram_gb: v.ram_gb ? Number(v.ram_gb) : null,
          screen_size: v.screen_size ? Number(v.screen_size) : null,
        }))
      };
      const res = await createAdminProduct(payload);
      success("Product created successfully! You can now add variants and images.");
      router.push(`/admin/products/${res.id}`);
    } catch (err) {
      console.error(err);
      showError("Failed to create product");
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  // Compute derived state for display
  const allCategories: any[] = metadata?.categories || [];
  const allowedCategories = ['Laptops', 'Smartphones', 'Monitors', 'Accessories'];
  const topLevelCategories = allCategories.filter((c: any) => allowedCategories.includes(c.name));
  const selectedCategory = allCategories.find((c: any) => c.id == formData.category_id);
  const selectedCategoryName = selectedCategory?.name;
  const isAccessories = selectedCategoryName === 'Accessories';

  // Subcategories come from the metadata children of Accessories
  const accessoriesCategory = allCategories.find((c: any) => c.name === 'Accessories');
  const subcategories: any[] = accessoriesCategory?.children || [];
  const selectedSubcategoryName = allCategories.find((c: any) => c.id == formData.category_id && c.parent_id === accessoriesCategory?.id)?.name;

  // Determine allowed brands from the selected category or subcategory
  let allowedBrands: any[] = [];
  if (isAccessories) {
    // Accessories itself selected - brand list stays empty until subcategory chosen
    allowedBrands = [];
  } else if (selectedCategory?.parent_id === accessoriesCategory?.id) {
    // A subcategory is selected (e.g. Headphones & Earbuds under Accessories)
    allowedBrands = selectedCategory?.brands || [];
  } else if (selectedCategory) {
    // A regular category is selected
    allowedBrands = selectedCategory?.brands || [];
  }

  const filteredBrands = allowedBrands;

  // Filter series by brand + actual category selected
  const filteredSeries = (metadata?.series || []).filter((s: any) =>
    s.brand_id == formData.brand_id &&
    s.category_id == formData.category_id
  );
  const showSeries = filteredSeries.length > 0;

  const handleCategoryChange = (val: string | number) => {
    const cat = allCategories.find((c: any) => c.id == val);
    const isAcc = cat?.name === 'Accessories';
    setSubcategoryVisible(isAcc);
    setFormData({ ...formData, category_id: String(val), brand_id: "", series_id: "" });
  };

  const handleSubcategoryChange = (val: string | number) => {
    setFormData({ ...formData, category_id: String(val), brand_id: "", series_id: "" });
  };

  return (
    <div className="p-6 lg:p-8 max-w-[800px] mx-auto pb-32">
      <ConfirmModal
        {...modalConfig}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 tracking-[-0.03em]">Add New Product</h1>
          <p className="text-[13px] text-gray-500 mt-1">Configure product details and initial variants</p>
        </div>
      </div>

      {/* Step Progress Bar */}
      <div className="mb-8 flex items-center justify-center">
        <div className="flex items-center w-full max-w-sm">
          <div className={`flex flex-col items-center gap-2 flex-1 relative z-10`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-colors duration-300 ${step >= 1 ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-gray-100 text-gray-400"
              }`}>1</div>
            <span className={`text-[11px] font-semibold ${step >= 1 ? "text-gray-900" : "text-gray-400"}`}>Basic Info</span>
          </div>
          <div className={`flex-1 h-1 mx-2 rounded-full transition-colors duration-500 ${step >= 2 ? "bg-primary" : "bg-gray-100"
            }`} />
          <div className={`flex flex-col items-center gap-2 flex-1 relative z-10`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-colors duration-300 ${step >= 2 ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-gray-100 text-gray-400"
              }`}>2</div>
            <span className={`text-[11px] font-semibold ${step >= 2 ? "text-gray-900" : "text-gray-400"}`}>Configuration</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8">

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-[15px] font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" /> Basic Information
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Product Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Samsung Galaxy S26 Ultra"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Step 1: Category */}
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                <CategorySelector
                  value={isAccessories ? formData.category_id : (selectedCategory?.parent_id === accessoriesCategory?.id ? String(accessoriesCategory?.id || '') : formData.category_id)}
                  onChange={handleCategoryChange}
                  categories={topLevelCategories}
                />
              </div>

              {/* Subcategory - appears only for Accessories */}
              {(isAccessories || selectedCategory?.parent_id === accessoriesCategory?.id) && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Subcategory <span className="text-red-500">*</span></label>
                  <CustomSelect
                    value={selectedCategory?.parent_id === accessoriesCategory?.id ? formData.category_id : ""}
                    onChange={handleSubcategoryChange}
                    placeholder="Select subcategory..."
                    options={subcategories.map((s: any) => ({ value: s.id, label: s.name }))}
                  />
                </div>
              )}

              {/* Step 2: Brand - only shown when brands are available */}
              {filteredBrands.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Brand <span className="text-red-500">*</span></label>
                  <BrandSelector
                    value={formData.brand_id}
                    onChange={(val) => setFormData({ ...formData, brand_id: String(val), series_id: "" })}
                    brands={filteredBrands}
                  />
                </div>
              )}

              {/* Step 3: Series - only shown when brand+category combo has series */}
              {showSeries && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Series</label>
                  <CustomSelect
                    value={formData.series_id}
                    onChange={(val) => setFormData({ ...formData, series_id: String(val) })}
                    placeholder="None (Standalone Product)"
                    options={filteredSeries.map((s: any) => ({ value: s.id, label: s.name }))}
                  />
                </div>
              )}

              <div className="col-span-2">
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!formData.name || !formData.brand_id || !formData.category_id}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-300 ${formData.name && formData.brand_id && formData.category_id
                  ? "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 hover:-translate-y-0.5"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-[15px] font-bold text-gray-900 mb-6">Initial Configuration</h2>
            <p className="text-[13px] text-gray-500 mb-6 -mt-4">Define the first variant for this product. You can add more configurations, colors, and images after creation.</p>

            <div className="grid grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Price (MAD) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={formData.variants[0].price}
                  onChange={(e) => setFormData({
                    ...formData,
                    variants: [{ ...formData.variants[0], price: e.target.value }]
                  })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Initial Stock</label>
                <input
                  type="number"
                  value={formData.variants[0].stock_quantity}
                  onChange={(e) => setFormData({
                    ...formData,
                    variants: [{ ...formData.variants[0], stock_quantity: e.target.value }]
                  })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Color</label>
                <ColorPickerField
                  value={formData.variants[0].color}
                  onChange={(val) => setFormData({
                    ...formData,
                    variants: [{ ...formData.variants[0], color: val }]
                  })}
                />
              </div>

              {(() => {
                const cat = metadata?.categories?.find((c: any) => String(c.id) === String(formData.category_id));
                const catName = cat?.name?.toLowerCase() || "";
                const isLaptop = catName.includes('laptop');
                const isPhone = catName.includes('smartphone') || catName === 'smartphones';
                if (!isLaptop && !isPhone) return null;

                return (
                  <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
                    <p className="text-[12px] font-medium text-gray-700 mb-4">Tech Specs (Optional)</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-medium text-gray-500 mb-1.5">Storage</label>
                        <CustomSelect
                          value={formData.variants[0].storage_gb || ""}
                          onChange={(val) => setFormData({
                            ...formData,
                            variants: [{ ...formData.variants[0], storage_gb: String(val) }]
                          })}
                          options={[
                            { value: "64", label: "64 GB" },
                            { value: "128", label: "128 GB" },
                            { value: "256", label: "256 GB" },
                            { value: "512", label: "512 GB" },
                            { value: "1000", label: "1 TB" },
                            { value: "2000", label: "2 TB" },
                            { value: "4000", label: "4 TB" }
                          ]}
                          placeholder="Select storage"
                        />
                      </div>
                      {isLaptop && (
                        <>
                          <div>
                            <label className="block text-[11px] font-medium text-gray-500 mb-1.5">RAM</label>
                            <CustomSelect
                              value={formData.variants[0].ram_gb || ""}
                              onChange={(val) => setFormData({
                                ...formData,
                                variants: [{ ...formData.variants[0], ram_gb: String(val) }]
                              })}
                              options={[
                                { value: "8", label: "8 GB" },
                                { value: "16", label: "16 GB" },
                                { value: "24", label: "24 GB" },
                                { value: "32", label: "32 GB" },
                                { value: "64", label: "64 GB" },
                                { value: "128", label: "128 GB" }
                              ]}
                              placeholder="Select RAM"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-gray-500 mb-1.5">Screen Size</label>
                            <CustomSelect
                              value={formData.variants[0].screen_size || ""}
                              onChange={(val) => setFormData({
                                ...formData,
                                variants: [{ ...formData.variants[0], screen_size: String(val) }]
                              })}
                              options={[
                                { value: "13", label: '13"' },
                                { value: "13.3", label: '13.3"' },
                                { value: "13.6", label: '13.6"' },
                                { value: "14", label: '14"' },
                                { value: "14.2", label: '14.2"' },
                                { value: "15", label: '15"' },
                                { value: "15.3", label: '15.3"' },
                                { value: "15.6", label: '15.6"' },
                                { value: "16", label: '16"' },
                                { value: "16.2", label: '16.2"' },
                                { value: "17", label: '17"' },
                                { value: "17.3", label: '17.3"' },
                                { value: "18", label: '18"' }
                              ]}
                              placeholder="Select screen size"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-gray-500 mb-1.5">Processor</label>
                            <input
                              type="text"
                              placeholder="e.g. M4 Pro"
                              value={formData.variants[0].processor || ""}
                              onChange={(e) => setFormData({
                                ...formData,
                                variants: [{ ...formData.variants[0], processor: e.target.value }]
                              })}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={saving || !formData.variants[0].price}
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-[13px] font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
