"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register({ first_name: firstName, last_name: lastName, email, password });
      router.push("/cart"); 
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-background flex items-center justify-center p-4 md:p-8">
      <div className="bg-card w-full max-w-6xl rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-primary/5 overflow-hidden flex flex-col-reverse lg:flex-row">
        
        {/* Left: Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h1 className="text-4xl font-bold text-primary mb-2">Sign Up</h1>
            <p className="text-gray-500 mb-10">
              Let&apos;s start your wonderful journey with FIND.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 text-sm text-red-600 bg-red-50 rounded-2xl">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900 ml-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-900 placeholder:text-gray-400"
                    placeholder="Jane"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900 ml-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-900 placeholder:text-gray-400"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900 ml-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2 relative">
                <label className="block text-sm font-semibold text-gray-900 ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-5 pr-12 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-900 placeholder:text-gray-400"
                    placeholder="mysecretpassword"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <ul className="text-xs text-gray-400 mt-2 ml-2 space-y-1">
                  <li>• Least 8 characters</li>
                  <li>• Least one number (0-9) or a symbol</li>
                  <li>• Lowercase (a-z) and uppercase (A-Z)</li>
                </ul>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-colors disabled:opacity-50 shadow-md shadow-primary/20"
                >
                  {loading ? "Creating..." : "Sign Up"}
                </button>
                <button
                  type="button"
                  className="w-16 h-[56px] flex items-center justify-center bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </button>
              </div>

              <p className="text-sm text-gray-600 font-medium text-center mt-6">
                Already have an account?{" "}
                <Link href="/login" className="text-gray-900 font-bold hover:text-primary transition-colors">
                  Log in.
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Right: Image */}
        <div className="w-full lg:w-1/2 relative min-h-[400px] lg:min-h-full bg-gray-50 flex items-center justify-center p-8">
          {/* A large subtle shape behind the image just for flair */}
          <div className="absolute inset-0 overflow-hidden rounded-tr-[2rem] md:rounded-tr-[3rem] lg:rounded-br-[3rem]">
             <div className="absolute top-[-10%] right-[-10%] w-[120%] h-[120%] bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl mix-blend-multiply" />
          </div>
          
          <div className="relative w-full max-w-lg aspect-square">
            <Image 
              src="/images/UI/SignUp Image.png" 
              alt="Sign Up"
              fill
              className="object-contain drop-shadow-2xl z-10"
              priority
            />
          </div>

          <div className="absolute bottom-12 left-12 right-12 text-center z-20">
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-3 bg-white/80 backdrop-blur-sm p-4 rounded-3xl inline-block shadow-lg border border-white">
              HELLO! NEW HERE?<br/>BECOME A MEMBER NOW.
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
