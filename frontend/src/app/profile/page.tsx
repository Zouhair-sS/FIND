"use client";

import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import PageTransition from "@/components/PageTransition";
import { updateUserProfile, updateUserPassword, getImageUrl } from "@/lib/api";
import Image from "next/image";
import { Camera } from "lucide-react";

export default function ProfilePage() {
  const { user, isAuthenticated, loading, refreshUser } = useAuth();
  const router = useRouter();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current_password: "", password: "", password_confirmation: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name, email: user.email });
      setProfilePicPreview(user.profile_picture ? getImageUrl(user.profile_picture) : null);
    }
  }, [user]);

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
      setIsEditingProfile(true); // Auto enter edit mode if they change pic
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError("");
    setProfileSuccess("");
    try {
      const formData = new FormData();
      formData.append("name", profileForm.name);
      formData.append("email", profileForm.email);
      if (profilePicFile) {
        formData.append("profile_picture", profilePicFile);
      }

      await updateUserProfile(formData);
      await refreshUser();
      setProfileSuccess("Profile updated successfully!");
      setIsEditingProfile(false);
      setProfilePicFile(null);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || err.response?.data?.error || "Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");
    try {
      await updateUserPassword(passwordForm);
      setPasswordSuccess("Password updated successfully!");
      setIsChangingPassword(false);
      setPasswordForm({ current_password: "", password: "", password_confirmation: "" });
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || err.response?.data?.error || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="flex-1 min-h-screen bg-background p-6 md:p-12">
        <div className="max-w-4xl mx-auto bg-card rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
          
          <div className="space-y-8">
            <div className="flex items-center gap-6 pb-8 border-b border-gray-100">
              <div 
                className="relative w-24 h-24 rounded-full overflow-hidden bg-primary flex items-center justify-center text-white text-3xl font-bold group cursor-pointer border-2 border-white shadow-md"
                onClick={() => fileInputRef.current?.click()}
              >
                {profilePicPreview ? (
                  <Image src={profilePicPreview} alt="Profile" fill className="object-cover" unoptimized />
                ) : (
                  <span>{user?.name.charAt(0)}</span>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleProfilePicChange} 
                className="hidden" 
                accept="image/*" 
              />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{user?.name}</h2>
                <p className="text-gray-500">{user?.email}</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-medium text-primary hover:text-primary-hover mt-1 inline-block"
                >
                  Change Picture
                </button>
              </div>
            </div>

            {profileSuccess && <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm">{profileSuccess}</div>}
            {passwordSuccess && <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm">{passwordSuccess}</div>}

            {!isEditingProfile && !isChangingPassword && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-400 mb-1">Full Name</h3>
                    <p className="font-medium text-gray-900">{user?.name}</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-400 mb-1">Email Address</h3>
                    <p className="font-medium text-gray-900">{user?.email}</p>
                  </div>
                </div>
                
                <div className="pt-4 flex flex-wrap gap-4">
                  <button 
                    onClick={() => { setIsEditingProfile(true); setProfileSuccess(""); setPasswordSuccess(""); }}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors shadow-sm"
                  >
                    Edit Profile
                  </button>
                  <button 
                    onClick={() => { setIsChangingPassword(true); setProfileSuccess(""); setPasswordSuccess(""); }}
                    className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Change Password
                  </button>
                </div>
              </>
            )}

            {isEditingProfile && (
              <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Profile</h3>
                {profileError && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{profileError}</div>}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    required
                  />
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button 
                    type="submit" 
                    disabled={profileLoading}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors disabled:opacity-70"
                  >
                    {profileLoading ? "Saving..." : "Save Changes"}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfilePicFile(null);
                      setProfilePicPreview(user?.profile_picture ? getImageUrl(user.profile_picture) : null);
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {isChangingPassword && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Change Password</h3>
                {passwordError && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{passwordError}</div>}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input 
                    type="password" 
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input 
                    type="password" 
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm({...passwordForm, password: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={passwordForm.password_confirmation}
                    onChange={(e) => setPasswordForm({...passwordForm, password_confirmation: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    required
                    minLength={8}
                  />
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button 
                    type="submit" 
                    disabled={passwordLoading}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors disabled:opacity-70"
                  >
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsChangingPassword(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </PageTransition>
  );
}
