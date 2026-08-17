"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchAdminMetadata, createAdminProduct } from "@/lib/api";
import ColorPickerField from "@/components/admin/ColorPickerField";
import BrandSelector from "@/components/admin/BrandSelector";
import CategorySelector from "@/components/admin/CategorySelector";
import CustomSelect from "@/components/admin/CustomSelect";
import Link from "next/link";
import { ArrowLeft, Save, ChevronRight, Package, Loader2 } from "lucide-react";

export default function NewProductWizard() {
  const router = useRouter();
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    brand_id: "",
    category_id: "",
    series_id: "",
    description: "",
    status: "draft",
    sku: "",
    variants: [{
      sku: "",
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
      const payload = {
        ...formData,
        variants: formData.variants.map(v => ({
          ...v,
          price: Number(v.price) || 0,
          stock_quantity: Number(v.stock_quantity) || 0,
          storage_gb: v.storage_gb ? Number(v.storage_gb) : null,
          ram_gb: v.ram_gb ? Number(v.ram_gb) : null,
          screen_size: v.screen_size ? Number(v.screen_size) : null,
        }))
      };
      const res = await createAdminProduct(payload);
      router.push(`/admin/products/${res.id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create product");
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-[800px] mx-auto pb-32">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Step {step} of 2</p>
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
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Base SKU</label>
                <input
                  type="text"
                  placeholder="e.g. SAM-S26U-256GB"
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                />
              </div>
              
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Brand</label>
                <BrandSelector 
                  value={formData.brand_id} 
                  onChange={(val) => setFormData({...formData, brand_id: String(val)})} 
                  brands={metadata?.brands || []} 
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                <CategorySelector 
                  value={formData.category_id} 
                  onChange={(val) => setFormData({...formData, category_id: String(val)})} 
                  categories={metadata?.categories || []} 
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Series</label>
                <CustomSelect
                  value={formData.series_id}
                  onChange={(val) => setFormData({...formData, series_id: String(val)})}
                  placeholder="None (Standalone Product)"
                  options={(metadata?.series || [])
                    .filter((s:any) => !formData.brand_id || s.brand_id == formData.brand_id)
                    .map((s:any) => ({ value: s.id, label: s.name }))}
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Status</label>
                <CustomSelect
                  value={formData.status}
                  onChange={(val) => setFormData({...formData, status: String(val)})}
                  placeholder="Select Status"
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'draft', label: 'Draft' },
                    { value: 'archived', label: 'Archived' }
                  ]}
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!formData.name || !formData.brand_id || !formData.category_id}
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-[13px] font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
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
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Variant SKU <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.variants[0].sku}
                  onChange={(e) => setFormData({
                    ...formData, 
                    variants: [{ ...formData.variants[0], sku: e.target.value }]
                  })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono bg-white"
                />
              </div>
              
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

              <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
                <p className="text-[12px] font-medium text-gray-700 mb-4">Tech Specs (Optional)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1.5">Storage (GB)</label>
                    <input
                      type="number"
                      value={formData.variants[0].storage_gb}
                      onChange={(e) => setFormData({
                        ...formData, 
                        variants: [{ ...formData.variants[0], storage_gb: e.target.value }]
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1.5">RAM (GB)</label>
                    <input
                      type="number"
                      value={formData.variants[0].ram_gb}
                      onChange={(e) => setFormData({
                        ...formData, 
                        variants: [{ ...formData.variants[0], ram_gb: e.target.value }]
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1.5">Processor</label>
                    <input
                      type="text"
                      placeholder="e.g. M4 Pro"
                      value={formData.variants[0].processor}
                      onChange={(e) => setFormData({
                        ...formData, 
                        variants: [{ ...formData.variants[0], processor: e.target.value }]
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] bg-white"
                    />
                  </div>
                </div>
              </div>
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
                disabled={saving || !formData.variants[0].sku || !formData.variants[0].price}
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
