import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/components/CartContext";
import { AuthProvider } from "@/components/AuthContext";
import CartDrawer from "@/components/CartDrawer";
import PageTransition from "@/components/PageTransition";
import Script from "next/script";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AlyaPay Showcase Store",
  description: "A premium electronics store showcasing AlyaPay integration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script src="https://cdn.alyapay.com/js/alya-placement.js" strategy="afterInteractive" />
      </head>
      <body className={`${outfit.className} bg-background text-gray-900 antialiased`}>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="min-h-screen flex flex-col">
              <PageTransition>{children}</PageTransition>
            </main>
            <CartDrawer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
