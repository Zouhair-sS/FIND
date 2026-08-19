"use client";

import { useEffect, useState, useRef } from "react";
import { fetchAdminProfile, updateAdminProfile, getImageUrl } from "@/lib/api";
import { motion } from "framer-motion";
import { User, Mail, Lock, Camera, Save, Loader2 } from "lucide-react";

export default function AdminProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchAdminProfile()
      .then((data) => {
        setProfile(data);
        setFormData({ name: data.name || "", email: data.email || "", password: "" });
        if (data.profile_picture) {
          setImagePreview(getImageUrl(data.profile_picture));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      if (formData.password) {
        data.append("password", formData.password);
      }
      if (selectedFile) {
        data.append("profile_picture", selectedFile);
      }

      const response = await updateAdminProfile(data);
      setSuccessMsg("Profile updated successfully!");
      
      // Update local profile with response
      setProfile(response.user);
      if (response.user.profile_picture) {
        setImagePreview(getImageUrl(response.user.profile_picture));
      }
      setFormData(prev => ({ ...prev, password: "" })); // clear password
      setSelectedFile(null); // clear selected file since it's uploaded
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-[60vh]">
        <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[800px]">
      <div className="mb-8">
        <h1 className="text-[22px] font-bold text-gray-900 tracking-[-0.03em]">Profile Settings</h1>
        <p className="text-[13px] text-gray-500 mt-1">Manage your account details and profile picture</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 lg:p-8"
      >
        {successMsg && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[13px] rounded-lg">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-700 text-[13px] rounded-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div className="flex flex-col items-center gap-3">
              <div 
                onClick={handleImageClick}
                className="w-24 h-24 rounded-full border-4 border-white shadow-md relative group cursor-pointer overflow-hidden bg-gray-50 flex items-center justify-center"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-gray-300" />
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
              <span className="text-[11px] text-gray-400 font-medium">Click to change</span>
            </div>
            
            <div className="flex-1 space-y-4 w-full">
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-[15px] w-[15px] text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full pl-9 pr-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-[15px] w-[15px] text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full pl-9 pr-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-[15px] w-[15px] text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full pl-9 pr-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="Leave blank to keep current"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
