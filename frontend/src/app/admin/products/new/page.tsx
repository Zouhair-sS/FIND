"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetchAdminMetadata, createAdminProduct } from "@/lib/api";
import ColorPickerField from "@/components/admin/ColorPickerField";
import BrandSelector from "@/components/admin/BrandSelector";
import CategorySelector from "@/components/admin/CategorySelector";
import CustomSelect from "@/components/admin/CustomSelect";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { useToast } from "@/components/admin/Toast";
import Link from "next/link";
import { ArrowLeft, Save, Package, Loader2, Upload, X, Plus, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

export default function NewProductWizard() {
  const router = useRouter();
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subcategoryVisible, setSubcategoryVisible] = useState(false);
  const { success, error: showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      id: "var-1",
      price: "",
      stock_quantity: "0",
      color: "",
      storage_gb: "",
      ram_gb: "",
      processor: "",
      screen_size: "",
      image_index: null as number | null,
    }]
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    fetchAdminMetadata().then(res => {
      setMetadata(res);
      setLoading(false);
    });
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, {
        id: `var-${Date.now()}`,
        price: prev.variants[0].price,
        stock_quantity: "0",
        color: "",
        storage_gb: "",
        ram_gb: "",
        processor: "",
        screen_size: "",
        image_index: null,
      }]
    }));
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      newVariants[index] = { ...newVariants[index], [field]: value };
      return { ...prev, variants: newVariants };
    });
  };

  const handleCreate = async (status: string) => {
    setSaving(true);
    try {
      const category = metadata?.categories?.find((c: any) => c.id == formData.category_id)?.name || 'CAT';
      const brand = metadata?.brands?.find((b: any) => b.id == formData.brand_id)?.name || 'BRND';
      const catPrefix = category.substring(0, 3).toUpperCase();
      const brandPrefix = brand.substring(0, 3).toUpperCase();
      const randStr = Math.random().toString(36).substring(2, 6).toUpperCase();
      const baseSku = `${brandPrefix}-${catPrefix}-${randStr}`;

      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("brand_id", formData.brand_id);
      fd.append("category_id", formData.category_id);
      if (formData.series_id) fd.append("series_id", formData.series_id);
      fd.append("description", formData.description);
      fd.append("status", status);
      fd.append("sku", baseSku);

      formData.variants.forEach((v, i) => {
        fd.append(`variants[${i}][sku]`, `${baseSku}-V${i + 1}`);
        fd.append(`variants[${i}][price]`, String(Number(v.price) || 0));
        fd.append(`variants[${i}][stock_quantity]`, String(Number(v.stock_quantity) || 0));
        if (v.color) fd.append(`variants[${i}][color]`, v.color);
        if (v.storage_gb) fd.append(`variants[${i}][storage_gb]`, v.storage_gb);
        if (v.ram_gb) fd.append(`variants[${i}][ram_gb]`, v.ram_gb);
        if (v.processor) fd.append(`variants[${i}][processor]`, v.processor);
        if (v.screen_size) fd.append(`variants[${i}][screen_size]`, v.screen_size);
        if (v.image_index !== null && v.image_index !== undefined) {
          fd.append(`variants[${i}][image_index]`, String(v.image_index));
        }
      });

      images.forEach((img) => {
        fd.append("images[]", img);
      });

      const res = await createAdminProduct(fd);
      success(`Product ${status === 'active' ? 'published' : 'saved as draft'} successfully!`);
      router.push(`/admin/products/${res.id}`);
    } catch (err) {
      console.error(err);
      showError("Failed to create product");
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  const allCategories: any[] = metadata?.categories || [];
  const allowedCategories = ['Laptops', 'Smartphones', 'Monitors', 'Accessories'];
  const topLevelCategories = allCategories.filter((c: any) => allowedCategories.includes(c.name));
  const selectedCategory = allCategories.find((c: any) => c.id == formData.category_id);
  const selectedCategoryName = selectedCategory?.name;
  const isAccessories = selectedCategoryName === 'Accessories';

  const accessoriesCategory = allCategories.find((c: any) => c.name === 'Accessories');
  const subcategories: any[] = accessoriesCategory?.children || [];

  let allowedBrands: any[] = [];
  if (isAccessories) {
    allowedBrands = [];
  } else if (selectedCategory?.parent_id === accessoriesCategory?.id) {
    allowedBrands = selectedCategory?.brands || [];
  } else if (selectedCategory) {
    allowedBrands = selectedCategory?.brands || [];
  }

  const filteredBrands = allowedBrands;
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

  const isLaptop = selectedCategoryName?.toLowerCase().includes('laptop') || false;
  const isPhone = selectedCategoryName?.toLowerCase().includes('smartphone') || selectedCategoryName?.toLowerCase() === 'smartphones' || false;
  const showSpecs = isLaptop || isPhone;

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto pb-32">
      <ConfirmModal
        {...modalConfig}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-[12px] text-gray-500 font-medium mb-1">
              <Link href="/admin/products" className="hover:text-gray-900 transition-colors">Products</Link>
              <span>/</span>
              <span>New product</span>
            </div>
            <h1 className="text-[22px] font-bold text-gray-900 tracking-[-0.03em]">Add product</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleCreate('draft')}
            disabled={saving || !formData.name || !formData.brand_id || !formData.category_id || !formData.variants[0].price}
            className="px-4 py-2 border border-gray-200 bg-white text-gray-700 text-[13px] font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Save as draft
          </button>
          <button
            onClick={() => handleCreate('active')}
            disabled={saving || !formData.name || !formData.brand_id || !formData.category_id || !formData.variants[0].price}
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2 rounded-lg text-[13px] font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column (Main Form) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Basic Information */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <h2 className="text-[14px] font-semibold text-gray-900 mb-5">Basic information</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Product name</label>
                <input
                  type="text"
                  placeholder="e.g. Samsung Galaxy S26 Ultra"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Category</label>
                  <CategorySelector
                    value={isAccessories ? formData.category_id : (selectedCategory?.parent_id === accessoriesCategory?.id ? String(accessoriesCategory?.id || '') : formData.category_id)}
                    onChange={handleCategoryChange}
                    categories={topLevelCategories}
                  />
                </div>
                
                {/* Subcategory */}
                {(isAccessories || selectedCategory?.parent_id === accessoriesCategory?.id) ? (
                  <div>
                    <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Subcategory</label>
                    <CustomSelect
                      value={selectedCategory?.parent_id === accessoriesCategory?.id ? formData.category_id : ""}
                      onChange={handleSubcategoryChange}
                      placeholder="Select subcategory..."
                      options={subcategories.map((s: any) => ({ value: s.id, label: s.name }))}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Brand</label>
                    <BrandSelector
                      value={formData.brand_id}
                      onChange={(val) => setFormData({ ...formData, brand_id: String(val), series_id: "" })}
                      brands={filteredBrands}
                    />
                  </div>
                )}
              </div>

              {/* Brand for accessories subcategory, or Series */}
              <div className="grid grid-cols-2 gap-5">
                {(isAccessories || selectedCategory?.parent_id === accessoriesCategory?.id) && filteredBrands.length > 0 && (
                  <div>
                    <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Brand</label>
                    <BrandSelector
                      value={formData.brand_id}
                      onChange={(val) => setFormData({ ...formData, brand_id: String(val), series_id: "" })}
                      brands={filteredBrands}
                    />
                  </div>
                )}

                {showSeries && (
                  <div>
                    <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Series</label>
                    <CustomSelect
                      value={formData.series_id}
                      onChange={(val) => setFormData({ ...formData, series_id: String(val) })}
                      placeholder="None (Standalone Product)"
                      options={filteredSeries.map((s: any) => ({ value: s.id, label: s.name }))}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short product description"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Configuration (Default Variant) */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <h2 className="text-[14px] font-semibold text-gray-900 mb-5">Configuration</h2>
            
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Price</label>
                <input
                  type="number"
                  placeholder="e.g. 4498"
                  value={formData.variants[0].price}
                  onChange={(e) => updateVariant(0, 'price', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Stock</label>
                <input
                  type="number"
                  placeholder="18"
                  value={formData.variants[0].stock_quantity}
                  onChange={(e) => updateVariant(0, 'stock_quantity', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Base color</label>
                <ColorPickerField
                  value={formData.variants[0].color}
                  onChange={(val) => updateVariant(0, 'color', val)}
                />
              </div>
            </div>
          </div>

          {/* Specifications */}
          {showSpecs && (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[14px] font-semibold text-gray-900">Specifications</h2>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-[11px] font-medium text-gray-600">
                    {isLaptop ? 'Laptop' : 'Smartphone'}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 mb-5">Fields adapt automatically to the selected category.</p>
              
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Storage</label>
                  <CustomSelect
                    value={formData.variants[0].storage_gb || ""}
                    onChange={(val) => updateVariant(0, 'storage_gb', String(val))}
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
                      <label className="block text-[12px] font-medium text-gray-700 mb-1.5">RAM</label>
                      <CustomSelect
                        value={formData.variants[0].ram_gb || ""}
                        onChange={(val) => updateVariant(0, 'ram_gb', String(val))}
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
                      <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Screen size</label>
                      <CustomSelect
                        value={formData.variants[0].screen_size || ""}
                        onChange={(val) => updateVariant(0, 'screen_size', String(val))}
                        options={[
                          { value: "13", label: '13"' },
                          { value: "13.6", label: '13.6"' },
                          { value: "14", label: '14"' },
                          { value: "15", label: '15"' },
                          { value: "16", label: '16"' }
                        ]}
                        placeholder="Select screen size"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Processor</label>
                      <input
                        type="text"
                        placeholder="e.g. M4 Pro"
                        value={formData.variants[0].processor || ""}
                        onChange={(e) => updateVariant(0, 'processor', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Image Gallery */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <h2 className="text-[14px] font-semibold text-gray-900 mb-5">Image gallery</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <Upload className="w-6 h-6 mb-2" />
                <span className="text-[11px] font-medium">Upload</span>
              </button>
              <input 
                type="file" 
                multiple 
                accept="image/*"
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              
              {imagePreviews.map((preview, index) => (
                <div key={index} className="aspect-square rounded-xl border border-gray-200 relative overflow-hidden group">
                  <Image src={preview} alt="" fill className="object-contain p-2" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => removeImage(index)}
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white backdrop-blur-sm transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Placeholders for empty slots */}
              {Array.from({ length: Math.max(0, 3 - imagePreviews.length) }).map((_, i) => (
                <div key={`placeholder-${i}`} className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-gray-200" />
                </div>
              ))}
            </div>
          </div>
          
        </div>

        {/* Right Column (Variants) */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 sticky top-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[14px] font-semibold text-gray-900">Variants</h2>
              <button 
                onClick={addVariant}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add variant
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.variants.map((variant, index) => (
                <div key={variant.id} className="p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-5 h-5 rounded-full shadow-sm border border-black/10"
                        style={{ backgroundColor: variant.color ? (
                          // Find the hex color from the value since variant.color stores the name (e.g. "Space Black")
                          (() => {
                            const ALL_COLORS = [
                              { name: 'Black', hex: '#000000' }, { name: 'White', hex: '#ffffff' }, { name: 'Navy', hex: '#1a2238' }, { name: 'Pink', hex: '#f3d1d6' }, { name: 'Teal', hex: '#008080' }, { name: 'Ultramarine', hex: '#120a8f' }, { name: 'Intense Blue', hex: '#234e70' }, { name: 'Orange', hex: '#e37424' }, { name: 'Jade', hex: '#8b9c90' }, { name: 'Moonstone', hex: '#e3e0d8' }, { name: 'Violet', hex: '#a89eb6' }, { name: 'Cloud White', hex: '#f8f8f8' }, { name: 'Light Gold', hex: '#e8d8c8' }, { name: 'Lavender', hex: '#c9c2d6' }, { name: 'Mist Blue', hex: '#a8bccc' }, { name: 'Sage', hex: '#9ea996' },
                              { name: 'Space Black', hex: '#2e2e2e' }, { name: 'Silver', hex: '#e3e4e5' }, { name: 'Starlight', hex: '#f0e4d3' }, { name: 'Midnight', hex: '#1c1f24' }, { name: 'Sky Blue', hex: '#b0c4de' },
                              { name: 'Titanium Gray', hex: '#878681' }, { name: 'Titanium Violet', hex: '#5b5666' }, { name: 'Titanium Black', hex: '#3b3b3b' }, { name: 'Titanium Gold', hex: '#cfba9e' }, { name: 'Titanium Silver Blue', hex: '#8ea2b3' }, { name: 'Titanium White Silver', hex: '#e8e8e8' }, { name: 'Cobalt Violet', hex: '#483d8b' }, { name: 'Pink Gold', hex: '#f0dfdb' }, { name: 'Silver Shadow', hex: '#b2b6b9' },
                              { name: 'Obsidian', hex: '#222222' }, { name: 'Porcelain', hex: '#f4f4f0' }, { name: 'Hazel', hex: '#4f5550' }, { name: 'Rose', hex: '#f1d6d2' }, { name: 'Aloe', hex: '#d4e1d1' }, { name: 'Peony', hex: '#e8b8c5' }, { name: 'Wintergreen', hex: '#b8c9c0' }
                            ];
                            return ALL_COLORS.find(c => c.name.toLowerCase() === variant.color.toLowerCase())?.hex || '#fff';
                          })()
                        ) : '#fff' }}
                      />
                      <span className="text-[12px] font-semibold text-gray-900">Variant {index + 1}</span>
                    </div>
                    {index > 0 && (
                      <button 
                        onClick={() => removeVariant(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1">Price</label>
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) => updateVariant(index, 'price', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-[12px] focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1">Stock</label>
                      <input
                        type="number"
                        value={variant.stock_quantity}
                        onChange={(e) => updateVariant(index, 'stock_quantity', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-[12px] focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  
                  {showSpecs && (
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-1">Storage</label>
                        <CustomSelect
                          value={variant.storage_gb}
                          onChange={(val) => updateVariant(index, 'storage_gb', String(val))}
                          className="!h-[34px] !px-2 !py-1 !rounded text-[12px]"
                          options={[
                            { value: "64", label: "64 GB" },
                            { value: "128", label: "128 GB" },
                            { value: "256", label: "256 GB" },
                            { value: "512", label: "512 GB" },
                            { value: "1000", label: "1 TB" },
                            { value: "2000", label: "2 TB" },
                            { value: "4000", label: "4 TB" }
                          ]}
                          placeholder="Select..."
                        />
                      </div>
                      {isLaptop && (
                        <div>
                          <label className="block text-[10px] font-medium text-gray-500 mb-1">RAM</label>
                          <CustomSelect
                            value={variant.ram_gb}
                            onChange={(val) => updateVariant(index, 'ram_gb', String(val))}
                            className="!h-[34px] !px-2 !py-1 !rounded text-[12px]"
                            options={[
                              { value: "8", label: "8 GB" },
                              { value: "16", label: "16 GB" },
                              { value: "24", label: "24 GB" },
                              { value: "32", label: "32 GB" },
                              { value: "64", label: "64 GB" },
                              { value: "128", label: "128 GB" }
                            ]}
                            placeholder="Select..."
                          />
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">Color</label>
                    <ColorPickerField
                      value={variant.color}
                      onChange={(val) => updateVariant(index, 'color', val)}
                    />
                  </div>

                  {imagePreviews.length > 0 && (
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1">Assigned Image</label>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {imagePreviews.map((preview, imgIndex) => (
                          <button
                            key={imgIndex}
                            onClick={() => updateVariant(index, 'image_index', variant.image_index === imgIndex ? null : imgIndex)}
                            className={`relative w-10 h-10 rounded-md border-2 flex-shrink-0 overflow-hidden transition-all ${
                              variant.image_index === imgIndex ? 'border-primary' : 'border-transparent hover:border-gray-300'
                            }`}
                            title={`Assign Image ${imgIndex + 1}`}
                          >
                            <Image src={preview} alt="" fill className="object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
          </div>
        </div>
        
      </div>
    </div>
  );
}
