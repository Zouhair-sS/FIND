"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  fetchAdminProduct,
  fetchAdminMetadata,
  updateAdminProduct,
  addAdminConfiguration,
  deleteAdminConfiguration,
  createAdminVariant,
  updateAdminVariant,
  deleteAdminVariant,
  uploadAdminProductImage,
  deleteAdminProductImage,
  getImageUrl
} from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import ColorPickerField from "@/components/admin/ColorPickerField";
import BrandSelector from "@/components/admin/BrandSelector";
import CategorySelector from "@/components/admin/CategorySelector";
import CustomSelect from "@/components/admin/CustomSelect";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  MoreVertical,
  Settings,
  Eye,
  ChevronDown,
  ChevronUp,
  Edit,
  Loader2
} from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";

export default function AdminProductEditor() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [group, setGroup] = useState<any>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "configurations" | "images">("overview");
  const [expandedConfigs, setExpandedConfigs] = useState<Record<number, boolean>>({});

  // Modals state
  const [addConfigModal, setAddConfigModal] = useState(false);
  const [addVariantModal, setAddVariantModal] = useState<number | null>(null);
  const [newConfigData, setNewConfigData] = useState({ sku: '', price: '' });
  const [newVariantData, setNewVariantData] = useState({ sku: '', price: '', stock: '0', color: '', storage_gb: '', ram_gb: '', processor: '' });

  // Basic Info Form State
  const [formData, setFormData] = useState({
    name: "",
    brand_id: "",
    category_id: "",
    series_id: "",
    status: "draft",
    description: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const [prodRes, metaRes] = await Promise.all([
          fetchAdminProduct(id),
          fetchAdminMetadata(),
        ]);
        setGroup(prodRes);
        setMetadata(metaRes);
        setFormData({
          name: prodRes.name || "",
          brand_id: prodRes.brand_id?.toString() || "",
          category_id: prodRes.category_id?.toString() || "",
          series_id: prodRes.series_id?.toString() || "",
          status: prodRes.status || "draft",
          description: prodRes.description || "",
        });
        
        // Expand first config by default
        if (prodRes.configurations?.length > 0) {
          setExpandedConfigs({ [prodRes.configurations[0].id]: true });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleSaveBasicInfo = async () => {
    setSaving(true);
    try {
      if (!window.confirm("Updating these fields will affect all configurations for this product. Continue?")) {
        return;
      }
      const res = await updateAdminProduct(group.group_id, formData);
      alert(res.message || "Product updated");
    } catch (err) {
      console.error(err);
      alert("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const toggleConfig = (configId: number) => {
    setExpandedConfigs(prev => ({ ...prev, [configId]: !prev[configId] }));
  };

  const getVariantLabel = (v: any) => {
    const parts = [];
    if (v.processor) parts.push(v.processor);
    if (v.ram_gb) parts.push(`${v.ram_gb} GB RAM`);
    if (v.storage_gb) parts.push(v.storage_gb >= 1024 ? `${v.storage_gb/1024} TB` : `${v.storage_gb} GB`);
    if (v.screen_size) parts.push(`${v.screen_size}"`);
    if (v.color) parts.push(v.color);
    return parts.join(' · ') || 'Base Variant';
  };

  const getConfigLabel = (variants: any[]) => {
    if (!variants || variants.length === 0) return "Empty Configuration";
    const v = variants[0];
    const parts = [];
    if (v.processor) parts.push(v.processor);
    if (v.ram_gb) parts.push(`${v.ram_gb} GB RAM`);
    if (v.storage_gb) parts.push(v.storage_gb >= 1024 ? `${v.storage_gb/1024} TB` : `${v.storage_gb} GB`);
    return parts.join(' · ') || 'Standard Configuration';
  };

  const handleDeleteVariant = async (variantId: number) => {
    if (!window.confirm("Delete this variant?")) return;
    try {
      await deleteAdminVariant(variantId);
      // reload
      const prodRes = await fetchAdminProduct(id);
      setGroup(prodRes);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, configId: number) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      await uploadAdminProductImage(configId, file);
      const prodRes = await fetchAdminProduct(id);
      setGroup(prodRes);
    } catch (err) {
      console.error(err);
      alert("Failed to upload image");
    }
    e.target.value = ''; // reset input
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await deleteAdminProductImage(imageId);
      const prodRes = await fetchAdminProduct(id);
      setGroup(prodRes);
    } catch (err) {
      console.error(err);
      alert("Failed to delete image");
    }
  };

  const handleCreateConfig = async () => {
    if (!newConfigData.sku || !newConfigData.price) return;
    try {
      await addAdminConfiguration(group.group_id, {
        sku: newConfigData.sku,
        variants: [{ sku: newConfigData.sku, price: Number(newConfigData.price), stock_quantity: 0 }]
      });
      const prodRes = await fetchAdminProduct(id);
      setGroup(prodRes);
      setAddConfigModal(false);
      setNewConfigData({ sku: '', price: '' });
    } catch (err) {
      alert("Failed to create configuration");
    }
  };

  const handleCreateVariant = async () => {
    if (!addVariantModal || !newVariantData.sku || !newVariantData.price) return;
    try {
      await createAdminVariant(addVariantModal, {
        sku: newVariantData.sku,
        price: Number(newVariantData.price),
        stock_quantity: Number(newVariantData.stock),
        color: newVariantData.color,
        storage_gb: newVariantData.storage_gb ? Number(newVariantData.storage_gb) : null,
        ram_gb: newVariantData.ram_gb ? Number(newVariantData.ram_gb) : null,
        processor: newVariantData.processor,
      });
      const prodRes = await fetchAdminProduct(id);
      setGroup(prodRes);
      setAddVariantModal(null);
      setNewVariantData({ sku: '', price: '', stock: '0', color: '', storage_gb: '', ram_gb: '', processor: '' });
    } catch (err) {
      alert("Failed to create variant");
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading editor...</div>;
  if (!group) return <div className="p-12 text-center text-red-500">Failed to load product.</div>;

  // Derive Preview Data
  const previewConfig = group.configurations?.[0];
  const previewVariant = previewConfig?.variants?.[0];
  const previewImage = previewConfig?.images?.[0];
  const allColors = [...new Set(previewConfig?.variants?.map((v:any) => v.color).filter(Boolean))] as string[];

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
            <p className="text-[13px] text-gray-500 mt-0.5">{group.configurations?.length} Configurations • {group.configurations?.reduce((acc: number, c:any) => acc + c.variants.length, 0)} Variants</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-gray-200">
            {(['overview', 'configurations', 'images'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-[14px] font-medium capitalize transition-colors relative ${
                  activeTab === tab ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-gray-900 rounded-t" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Product Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                    <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Category</label>
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
                      placeholder="None"
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

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={handleSaveBasicInfo}
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Overview'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'configurations' && (
              <div className="space-y-4">
                {group.configurations?.map((config: any) => {
                  const minPrice = config.variants?.length ? Math.min(...config.variants.map((v:any) => v.price)) : 0;
                  const totalStock = config.variants?.reduce((sum:number, v:any) => sum + v.stock_quantity, 0) || 0;
                  const isExpanded = expandedConfigs[config.id];

                  return (
                    <div key={config.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                      {/* Config Header */}
                      <div 
                        onClick={() => toggleConfig(config.id)}
                        className="px-5 py-4 bg-gray-50/50 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <h3 className="text-[14px] font-bold text-gray-900">{getConfigLabel(config.variants)}</h3>
                          <p className="text-[12px] text-gray-500 mt-1">Starting at {formatPrice(minPrice)} MAD • {totalStock} units in stock</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[12px] font-medium text-gray-400">{config.variants?.length} variants</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </div>

                      {/* Variants Table */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 p-4">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="text-[11px] text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                <th className="pb-3 font-medium">Variant</th>
                                <th className="pb-3 font-medium">Price (MAD)</th>
                                <th className="pb-3 font-medium">Stock</th>
                                <th className="pb-3 font-medium">SKU</th>
                                <th className="pb-3 font-medium text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {config.variants?.map((v: any) => (
                                <tr key={v.id} className="hover:bg-gray-50/30">
                                  <td className="py-3 pr-4">
                                    <span className="text-[13px] font-medium text-gray-900">{getVariantLabel(v)}</span>
                                  </td>
                                  <td className="py-3 pr-4">
                                    <span className="text-[13px] text-gray-600">{Number(v.price).toLocaleString()}</span>
                                  </td>
                                  <td className="py-3 pr-4">
                                    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[12px] font-medium ${
                                      v.stock_quantity > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                      {v.stock_quantity}
                                    </span>
                                  </td>
                                  <td className="py-3 pr-4">
                                    <span className="text-[12px] font-mono text-gray-500">{v.sku}</span>
                                  </td>
                                  <td className="py-3 text-right">
                                    <button className="text-gray-400 hover:text-primary transition-colors p-1" title="Edit (Coming Soon)">
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteVariant(v.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1 ml-1" title="Delete">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <button 
                              onClick={() => setAddVariantModal(config.id)}
                              className="text-[13px] font-medium text-primary hover:text-primary-hover inline-flex items-center gap-1.5 transition-colors"
                            >
                              <Plus className="w-4 h-4" /> Add Variant
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                <button 
                  onClick={() => setAddConfigModal(true)}
                  className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-[13px] font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Configuration
                </button>
              </div>
            )}

            {activeTab === 'images' && (
              <div className="space-y-8">
                {group.configurations?.map((config: any) => (
                  <div key={config.id}>
                    <h3 className="text-[14px] font-bold text-gray-900 mb-4">{getConfigLabel(config.variants)}</h3>
                    {config.images?.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {config.images.map((img: any) => (
                          <div key={img.id} className="relative aspect-square border border-gray-200 rounded-lg overflow-hidden group bg-gray-50">
                            <Image unoptimized src={getImageUrl(img.url)} alt="" fill className="object-contain p-2" sizes="200px" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                              <div className="flex justify-end">
                                <button 
                                  onClick={() => handleDeleteImage(img.id)}
                                  className="w-7 h-7 bg-white/20 hover:bg-red-500 rounded text-white flex items-center justify-center transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <span className="text-[10px] font-medium text-white bg-black/50 px-1.5 py-0.5 rounded w-fit">Order: {img.sort_order}</span>
                            </div>
                          </div>
                        ))}
                        <label className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                          <ImageIcon className="w-6 h-6 mb-2" />
                          <span className="text-[12px] font-medium">Add Image</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, config.id)} />
                        </label>
                      </div>
                    ) : (
                      <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl text-center">
                        <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                        <p className="text-[13px] font-medium text-gray-900 mb-1">No images uploaded</p>
                        <p className="text-[12px] text-gray-500 mb-4">Upload images for this configuration</p>
                        <label className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-[12px] font-medium hover:bg-gray-50 transition-colors cursor-pointer">
                          <Plus className="w-3.5 h-3.5" /> Upload Image
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, config.id)} />
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Storefront Preview Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 sticky top-8">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-5 flex items-center gap-2">
              <Eye className="w-3.5 h-3.5" /> Storefront Preview
            </h3>
            
            <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/30">
              <div className="aspect-square bg-white rounded-lg border border-gray-100 mb-4 relative overflow-hidden flex items-center justify-center">
                {previewImage ? (
                  <Image unoptimized src={getImageUrl(previewImage.url)} alt="" fill className="object-contain p-4" sizes="250px" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-200" />
                )}
              </div>
              
              <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">{group.brand?.name}</p>
              <h4 className="text-[15px] font-bold text-gray-900 leading-tight mb-2">{group.name}</h4>
              
              {previewVariant && (
                <p className="text-[18px] font-bold text-gray-900 mb-4">
                  {Number(previewVariant.price).toLocaleString()} <span className="text-[12px] font-normal text-gray-500 tracking-wide">MAD</span>
                </p>
              )}

              {allColors.length > 0 && (
                <div className="mb-4">
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2">Colors</p>
                  <div className="flex gap-2">
                    {allColors.map(color => {
                      let hex = '#ccc';
                      if (color.startsWith('#')) {
                        hex = color;
                      } else if (color.toLowerCase() === 'black' || color.toLowerCase() === 'space black') {
                        hex = '#000';
                      } else if (color.toLowerCase() === 'silver') {
                        hex = '#e3e4e5';
                      } else if (color.toLowerCase() === 'white' || color.toLowerCase() === 'starlight') {
                        hex = '#f4f4f4';
                      }
                      
                      return (
                        <div key={color} className="w-6 h-6 rounded-full border border-gray-200" title={color} style={{ backgroundColor: hex }} />
                      );
                    })}
                  </div>
                </div>
              )}

              {group.configurations?.length > 1 && (
                <div>
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2">Configurations</p>
                  <div className="flex flex-wrap gap-2">
                    {group.configurations.map((c:any) => (
                      <span key={c.id} className="px-2 py-1 bg-white border border-gray-200 rounded text-[11px] font-medium text-gray-700">
                        {getConfigLabel(c.variants)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <button className="w-full mt-6 py-2.5 bg-gray-900 text-white rounded-lg text-[13px] font-medium opacity-80 cursor-default">
                Add to cart
              </button>
            </div>
            <p className="text-[11px] text-center text-gray-400 mt-4 leading-relaxed">
              This is a simplified preview of how the customer sees the grouped configurations.
            </p>
          </div>
        </div>
      </div>

      {/* Add Configuration Modal */}
      {addConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-gray-900">Add Configuration</h3>
              <button onClick={() => setAddConfigModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Base SKU</label>
                <input
                  type="text"
                  value={newConfigData.sku}
                  onChange={(e) => setNewConfigData({...newConfigData, sku: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                  placeholder="e.g. SAM-S26U-256GB"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Price (MAD)</label>
                <input
                  type="number"
                  value={newConfigData.price}
                  onChange={(e) => setNewConfigData({...newConfigData, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button onClick={() => setAddConfigModal(false)} className="px-4 py-2 text-[13px] font-medium text-gray-600 hover:text-gray-900">Cancel</button>
              <button onClick={handleCreateConfig} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-[13px] font-medium hover:bg-gray-800">Add Configuration</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Variant Modal */}
      {addVariantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-gray-900">Add Variant</h3>
              <button onClick={() => setAddVariantModal(null)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">SKU</label>
                <input type="text" value={newVariantData.sku} onChange={(e) => setNewVariantData({...newVariantData, sku: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] font-mono" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Price (MAD)</label>
                <input type="number" value={newVariantData.price} onChange={(e) => setNewVariantData({...newVariantData, price: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px]" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Stock</label>
                <input type="number" value={newVariantData.stock} onChange={(e) => setNewVariantData({...newVariantData, stock: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px]" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Color</label>
                <ColorPickerField 
                  value={newVariantData.color} 
                  onChange={(val) => setNewVariantData({...newVariantData, color: val})} 
                />
              </div>
              <div className="col-span-2 border-t border-gray-100 pt-3 mt-1">
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-3">Tech Specs</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Storage (GB)</label>
                    <input type="number" value={newVariantData.storage_gb} onChange={(e) => setNewVariantData({...newVariantData, storage_gb: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">RAM (GB)</label>
                    <input type="number" value={newVariantData.ram_gb} onChange={(e) => setNewVariantData({...newVariantData, ram_gb: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Processor</label>
                    <input type="text" value={newVariantData.processor} onChange={(e) => setNewVariantData({...newVariantData, processor: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px]" />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button onClick={() => setAddVariantModal(null)} className="px-4 py-2 text-[13px] font-medium text-gray-600 hover:text-gray-900">Cancel</button>
              <button onClick={handleCreateVariant} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-[13px] font-medium hover:bg-gray-800">Add Variant</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
