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
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-colors disabled:opacity-50 shadow-md shadow-primary/20"
                >
                  {loading ? "Creating..." : "Sign Up"}
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
