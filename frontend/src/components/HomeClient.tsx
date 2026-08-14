"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { Laptop, Smartphone, Monitor, Headphones, ArrowRight, ShieldCheck, Zap, TrendingUp, CheckCircle2, ShoppingBag } from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  laptops: Laptop,
  smartphones: Smartphone,
  monitors: Monitor,
  accessories: Headphones,
};

const fadeInUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const HERO_IMAGES = [
  "/images/products/home page components/Moments with beats.jpg",
  "/images/products/home page components/Happy with Her New MacBook Air _ Sleek, Modern & Ultra-Portable Laptop.jpg",
  "/images/products/home page components/Galaxy Z Flip4 5G_ o smartphone que dita tendência.jpg",
];

export default function HomeClient({ products, categories }: { products: any, categories: any }) {
  const getDiverseProducts = (items: any[]) => {
    if (!items) return [];
    const diverse: any[] = [];
    const seenNames = new Set();
    for (const p of items) {
      if (!seenNames.has(p.name)) {
        seenNames.add(p.name);
        diverse.push(p);
      }
      if (diverse.length === 4) break;
    }
    if (diverse.length < 4) {
      for (const p of items) {
        if (!diverse.find(d => d.id === p.id)) {
          diverse.push(p);
        }
        if (diverse.length === 4) break;
      }
    }
    return diverse;
  };

  const featured = getDiverseProducts(products?.data);
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="bg-white overflow-hidden">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-50"
        style={{ scaleX }}
      />

      {/* 01 — HERO */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gray-50 border-b border-gray-100">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0 opacity-40">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], x: [0, 20, 0], y: [0, -20, 0] }} 
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} 
            className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
          ></motion.div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1], x: [0, -30, 0], y: [0, 20, 0] }} 
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }} 
            className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
          ></motion.div>
          <motion.div 
            animate={{ scale: [1, 1.1, 1], x: [0, 20, 0], y: [0, 20, 0] }} 
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 4 }} 
            className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
          ></motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full z-10 grid md:grid-cols-2 gap-12 items-center pt-20 pb-16">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col gap-6"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700 shadow-sm text-xs font-semibold uppercase tracking-wider w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Live AlyaPay Demo Store
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1]">
              BUY THE TECH <br className="hidden md:block"/>YOU LOVE. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-2 block md:inline">
                PAY SMARTER 
              </span>
              <br className="hidden md:block"/>
              <span className="inline-flex items-center gap-x-4 lg:gap-x-5 mt-1 md:mt-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  WITH
                </span>
                <Image src="/images/AlyaPay Icon/alyaIcon-dark.svg" alt="AlyaPay" width={220} height={60} className="h-[0.75em] w-auto object-contain translate-y-1.5 ml-1" />
              </span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-600 max-w-lg leading-relaxed">
              Experience a real e-commerce journey powered by AlyaPay. Discover premium products and see how frictionless checkout drives higher conversion.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link
                href="/products"
                className="px-8 py-4 bg-gray-900 text-white text-base font-medium rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Explore the Store <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => {
                  document.getElementById('start-demo')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 bg-white border border-gray-200 text-gray-900 text-base font-medium rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                See How AlyaPay Works
              </button>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full aspect-[4/3] md:aspect-square flex justify-center items-center"
          >
            <div className="relative w-full h-full max-w-lg max-h-lg rounded-2xl shadow-2xl bg-white border border-gray-100 p-4">
               <AnimatePresence initial={false}>
                 <motion.div
                   key={heroImageIndex}
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   transition={{ duration: 1, ease: "easeInOut" }}
                   className="absolute inset-4 z-0 overflow-hidden rounded-xl"
                 >
                   <Image
                     src={HERO_IMAGES[heroImageIndex]}
                     alt="Premium Tech Ecosystem"
                     fill
                     className="object-cover"
                     priority
                   />
                 </motion.div>
               </AnimatePresence>
              {/* Floating Element to simulate AlyaPay payment success */}
              <motion.div 
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute -bottom-4 -left-4 md:-left-8 bg-white/95 backdrop-blur-md py-3 px-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3 z-20"
              >
                <div className="flex items-center justify-center">
                  <Image src="/images/AlyaPay Icon/alyaIcon-dark.svg" alt="AlyaPay" width={60} height={18} className="h-4 w-auto object-contain" />
                </div>
                <div className="border-l border-gray-200 pl-3">
                  <p className="text-[13px] font-bold text-gray-900 leading-tight mb-0.5">Payment Successful</p>
                  <p className="text-[11px] text-gray-500 font-medium leading-tight">Processed securely by AlyaPay</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* RETAILERS MARQUEE */}
      <section className="border-y border-gray-100 bg-white py-12 overflow-hidden">
        <div className="text-center mb-10">
          <h2 className="text-sm font-bold text-gray-400 tracking-[0.25em] uppercase">Built for Morocco&apos;s leading retailers.</h2>
        </div>
        <div className="relative flex w-full flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
          <div className="flex w-max animate-marquee items-center gap-24 pr-24 hover:[animation-play-state:paused]">
            {[
              { src: "/images/LOGOS/Retailers/Virquin Logo.png", alt: "Virgin Megastore" },
              { src: "/images/LOGOS/Retailers/Decathlon logo.svg", alt: "Decathlon" },
              { src: "/images/LOGOS/Retailers/Kitea logo.png", alt: "Kitea" },
              { src: "/images/LOGOS/Retailers/Electroplanet logo.png", alt: "Electroplanet" },
              { src: "/images/LOGOS/Retailers/Jacadi logo.jpeg", alt: "Jacadi" },
              { src: "/images/LOGOS/Retailers/Virquin Logo.png", alt: "Virgin Megastore" },
              { src: "/images/LOGOS/Retailers/Decathlon logo.svg", alt: "Decathlon" },
              { src: "/images/LOGOS/Retailers/Kitea logo.png", alt: "Kitea" },
              { src: "/images/LOGOS/Retailers/Electroplanet logo.png", alt: "Electroplanet" },
              { src: "/images/LOGOS/Retailers/Jacadi logo.jpeg", alt: "Jacadi" },
            ].map((logo, i) => (
              <div key={i} className="relative h-12 w-36 flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                <Image src={logo.src} alt={logo.alt} fill className="object-contain" />
              </div>
            ))}
          </div>
          <div className="flex w-max animate-marquee items-center gap-24 pr-24 hover:[animation-play-state:paused]" aria-hidden="true">
            {[
              { src: "/images/LOGOS/Retailers/Virquin Logo.png", alt: "Virgin Megastore" },
              { src: "/images/LOGOS/Retailers/Decathlon logo.svg", alt: "Decathlon" },
              { src: "/images/LOGOS/Retailers/Kitea logo.png", alt: "Kitea" },
              { src: "/images/LOGOS/Retailers/Electroplanet logo.png", alt: "Electroplanet" },
              { src: "/images/LOGOS/Retailers/Jacadi logo.jpeg", alt: "Jacadi" },
              { src: "/images/LOGOS/Retailers/Virquin Logo.png", alt: "Virgin Megastore" },
              { src: "/images/LOGOS/Retailers/Decathlon logo.svg", alt: "Decathlon" },
              { src: "/images/LOGOS/Retailers/Kitea logo.png", alt: "Kitea" },
              { src: "/images/LOGOS/Retailers/Electroplanet logo.png", alt: "Electroplanet" },
              { src: "/images/LOGOS/Retailers/Jacadi logo.jpeg", alt: "Jacadi" },
            ].map((logo, i) => (
              <div key={i} className="relative h-12 w-36 flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                <Image src={logo.src} alt={logo.alt} fill className="object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03 — HOW ALYAPAY FITS INTO IT */}
      <section id="demo-flow" className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-3">01 / The Journey</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">How AlyaPay fits into the flow</h3>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">A frictionless experience from discovery to payment. Here is exactly what your customers see when checking out with AlyaPay.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-[40%] left-[15%] right-[15%] h-px bg-gradient-to-r from-gray-50 via-blue-200 to-gray-50 -translate-y-1/2 z-0"></div>

            {[
              { title: "Discover", desc: "Customers browse your premium tech collection and add to cart.", img: "/images/UI/FROM PRODUCT TO PAYMENT ICONS/Browse Products.png", delay: 0 },
              { title: "Seamless Checkout", desc: "No long forms. One-click initiation to the AlyaPay gateway.", img: "/images/UI/FROM PRODUCT TO PAYMENT ICONS/Complete checkout.png", delay: 0.2 },
              { title: "Secure Payment", desc: "Transactions are processed safely in the AlyaPay environment.", img: "/images/UI/FROM PRODUCT TO PAYMENT ICONS/Experience AlyaPay.png", delay: 0.4 },
            ].map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: step.delay }}
                className="relative z-10 flex flex-col items-center text-center group bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/60 hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="w-48 h-48 relative mb-6">
                   <Image src={step.img} alt={step.title} fill className="object-cover rounded-2xl" />
                   <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center font-bold text-sm ring-4 ring-white shadow-sm z-10">
                     {index + 1}
                   </div>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h4>
                <p className="text-gray-500 leading-relaxed text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* 05 — FEATURED PRODUCTS */}
      <section className="bg-gray-50/50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <h2 className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-3">03 / The Tech</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900">Featured Products</h3>
            </div>
            <Link href="/products" className="hidden md:flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              View full catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {featured.length > 0 ? (
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {featured.map((product: any) => (
                <motion.div key={product.id} variants={fadeInUp}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 text-gray-400">
              <p className="text-lg font-medium text-gray-900 mb-2">Backend Not Connected</p>
              <p className="text-sm mb-4">Start the Laravel server to fetch the actual e-commerce products.</p>
              <code className="inline-block bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-sm">php artisan serve</code>
            </div>
          )}
          
          <div className="mt-8 md:hidden text-center">
            <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              View full catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 06 — INTERACTIVE DEMO CTA */}
      <section id="start-demo" className="max-w-5xl mx-auto px-6 py-32">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="relative rounded-[2.5rem] overflow-hidden bg-white border border-blue-100 shadow-2xl shadow-blue-900/5 text-center py-20 px-8"
        >
          <div className="absolute inset-0 z-0 pointer-events-none">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[500px] bg-blue-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-60"></div>
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <h2 className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-4">04 / The Action</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Ready to see it in action?</h3>
            <p className="text-xl text-gray-500 mb-10 leading-relaxed">
              Experience the seamless flow yourself. Add a product to your cart and complete a test transaction via the AlyaPay Sandbox.
            </p>
            <Link
              href="/products"
              className="px-10 py-5 bg-[#002366] text-white text-lg font-bold rounded-2xl hover:bg-blue-900 hover:scale-105 transition-all duration-300 shadow-xl shadow-blue-900/20 flex items-center gap-3"
            >
              Start the Demo <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
