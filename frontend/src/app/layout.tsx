import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartContext";
import { AuthProvider } from "@/components/AuthContext";
import CartDrawer from "@/components/CartDrawer";
import PageTransition from "@/components/PageTransition";

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
      <body className={`${outfit.className} bg-background text-gray-900 antialiased`}>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="min-h-screen flex flex-col">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
            <CartDrawer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
