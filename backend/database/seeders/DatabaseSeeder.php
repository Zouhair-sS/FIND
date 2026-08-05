<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductImage;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@find.store',
        ]);

        // ── Categories ──────────────────────────────────────────
        $laptops     = Category::create(['name' => 'Laptops',     'slug' => 'laptops',     'description' => 'Thin, fast, all-day battery']);
        $smartphones = Category::create(['name' => 'Smartphones', 'slug' => 'smartphones', 'description' => 'Always connected, always ready']);
        $monitors    = Category::create(['name' => 'Monitors',    'slug' => 'monitors',    'description' => 'See more, strain less']);
        $accessories = Category::create(['name' => 'Accessories', 'slug' => 'accessories', 'description' => 'Small things, big difference']);

        // ── LAPTOPS ─────────────────────────────────────────────

        // 1. MacBook Pro 16"
        $p = Product::create([
            'category_id' => $laptops->id,
            'name'        => 'MacBook Pro 16"',
            'slug'        => 'macbook-pro-16',
            'brand'       => 'Apple',
            'description' => 'The most powerful MacBook Pro ever. M3 Max delivers extraordinary performance for the most demanding workflows.',
            'status'      => 'active',
        ]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/MacBook%20pro/black%20mac%20pro%2016.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/MacBook%20pro/silver%20mac%20pro%2016.png', 'sort_order' => 2]);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'MBP16-36-1TB-SLV',  'price' => 3499.00, 'stock_quantity' => 10, 'ram_gb' => 36, 'storage_gb' => 1024, 'screen_size' => 16.2, 'color' => 'Silver',     'processor' => 'Apple M3 Max']);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'MBP16-36-1TB-SB',   'price' => 3499.00, 'stock_quantity' => 8,  'ram_gb' => 36, 'storage_gb' => 1024, 'screen_size' => 16.2, 'color' => 'Space Black', 'processor' => 'Apple M3 Max']);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'MBP16-48-2TB-SB',   'price' => 3999.00, 'stock_quantity' => 5,  'ram_gb' => 48, 'storage_gb' => 2048, 'screen_size' => 16.2, 'color' => 'Space Black', 'processor' => 'Apple M3 Max']);

        // 2. MacBook Air 13"
        $p = Product::create([
            'category_id' => $laptops->id,
            'name'        => 'MacBook Air 13"',
            'slug'        => 'macbook-air-13',
            'brand'       => 'Apple',
            'description' => 'Thin enough to forget it\'s in your bag, fast enough to forget it\'s not a desktop. All-day battery, silent by design.',
            'status'      => 'active',
        ]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/MacBook%20Air/midnight%20air%2013.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/MacBook%20Air/starlight%20air%2013.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/MacBook%20Air/silver%20air%2013.png', 'sort_order' => 3]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/MacBook%20Air/skyblue%20air%2013.png', 'sort_order' => 4]);
        
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'MBA13-16-512-MN',   'price' => 1199.00, 'stock_quantity' => 25, 'ram_gb' => 16, 'storage_gb' => 512,  'screen_size' => 13.6, 'color' => 'Midnight',  'processor' => 'Apple M3']);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'MBA13-16-512-STL',  'price' => 1199.00, 'stock_quantity' => 20, 'ram_gb' => 16, 'storage_gb' => 512,  'screen_size' => 13.6, 'color' => 'Starlight', 'processor' => 'Apple M3']);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'MBA13-16-512-SLV',  'price' => 1199.00, 'stock_quantity' => 15, 'ram_gb' => 16, 'storage_gb' => 512,  'screen_size' => 13.6, 'color' => 'Silver',    'processor' => 'Apple M3']);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'MBA13-16-512-SB',   'price' => 1199.00, 'stock_quantity' => 10, 'ram_gb' => 16, 'storage_gb' => 512,  'screen_size' => 13.6, 'color' => 'Skyblue',   'processor' => 'Apple M3']);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'MBA13-24-1TB-MN',   'price' => 1599.00, 'stock_quantity' => 12, 'ram_gb' => 24, 'storage_gb' => 1024, 'screen_size' => 13.6, 'color' => 'Midnight',  'processor' => 'Apple M3']);

        // 3. ThinkPad X1 Carbon
        $p = Product::create([
            'category_id' => $laptops->id,
            'name'        => 'ThinkPad X1 Carbon',
            'slug'        => 'thinkpad-x1-carbon',
            'brand'       => 'Lenovo',
            'description' => 'The ultimate business laptop. Ultralight, durable, and featuring the legendary ThinkPad keyboard.',
            'status'      => 'active',
        ]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/Lenovo/ThinkPad%20X1%20Carbon.png', 'sort_order' => 1]);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'TPX1-16-512',       'price' => 1449.00, 'stock_quantity' => 15, 'ram_gb' => 16, 'storage_gb' => 512,  'screen_size' => 14.0, 'color' => 'Black', 'processor' => 'Intel Core Ultra 7']);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'TPX1-32-1TB',       'price' => 1849.00, 'stock_quantity' => 10, 'ram_gb' => 32, 'storage_gb' => 1024, 'screen_size' => 14.0, 'color' => 'Black', 'processor' => 'Intel Core Ultra 7']);

        // 4. Dell XPS 15
        $p = Product::create([
            'category_id' => $laptops->id,
            'name'        => 'Dell XPS 15',
            'slug'        => 'dell-xps-15',
            'brand'       => 'Dell',
            'description' => 'Stunning edge-to-edge InfinityEdge display packed with serious power for creators.',
            'status'      => 'active',
        ]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/DELL/BLACK%20XPS%2015.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/DELL/XPS%2015%20WHITE.png', 'sort_order' => 2]);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'XPS15-16-512-BLK',  'price' => 1499.00, 'stock_quantity' => 18, 'ram_gb' => 16, 'storage_gb' => 512,  'screen_size' => 15.6, 'color' => 'Black', 'processor' => 'Intel Core i7']);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'XPS15-32-1TB-WHT',  'price' => 1999.00, 'stock_quantity' => 8,  'ram_gb' => 32, 'storage_gb' => 1024, 'screen_size' => 15.6, 'color' => 'White', 'processor' => 'Intel Core i9']);

        // ── SMARTPHONES ─────────────────────────────────────────





        // 8. iPhone 16 Plus
        $p = Product::create([
            'category_id' => $smartphones->id,
            'name'        => 'iPhone 16 Plus',
            'slug'        => 'iphone-16-plus',
            'brand'       => 'Apple',
            'description' => 'Super Retina XDR OLED display, A18 chip, and Apple Intelligence. Built for everything you love.',
            'status'      => 'active',
        ]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/16%20plus%20black.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/16%20plus%20teal.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/16%20plus%20ultramarine.png', 'sort_order' => 3]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/16%20plus%20white.png', 'sort_order' => 4]);
        
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'IP16P-128-BLK', 'price' => 899.00, 'stock_quantity' => 20, 'ram_gb' => 8, 'storage_gb' => 128, 'screen_size' => 6.7, 'color' => 'Black', 'processor' => 'A18']);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'IP16P-256-TE', 'price' => 999.00, 'stock_quantity' => 15, 'ram_gb' => 8, 'storage_gb' => 256, 'screen_size' => 6.7, 'color' => 'Teal', 'processor' => 'A18']);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'IP16P-512-UM', 'price' => 1199.00, 'stock_quantity' => 10, 'ram_gb' => 8, 'storage_gb' => 512, 'screen_size' => 6.7, 'color' => 'Ultramarine', 'processor' => 'A18']);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'IP16P-256-WH', 'price' => 999.00, 'stock_quantity' => 15, 'ram_gb' => 8, 'storage_gb' => 256, 'screen_size' => 6.7, 'color' => 'White', 'processor' => 'A18']);

        // 9. iPhone 17 Pro Max
        $p = Product::create([
            'category_id' => $smartphones->id,
            'name'        => 'iPhone 17 Pro Max',
            'slug'        => 'iphone-17-pro-max',
            'brand'       => 'Apple',
            'description' => '6.9-inch Super Retina XDR OLED, A19 Pro chip, and Pro Fusion camera. The ultimate iPhone experience.',
            'status'      => 'active',
        ]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/17%20pro%20max%20intense%20blue.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/17%20pro%20max%20orange.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/17%20pro%20max%20silver.png', 'sort_order' => 3]);
        
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'IP17PM-256-IB', 'price' => 1200.00, 'stock_quantity' => 25, 'ram_gb' => 12, 'storage_gb' => 256, 'screen_size' => 6.9, 'color' => 'Intense Blue', 'processor' => 'A19 Pro']);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'IP17PM-512-OR', 'price' => 1400.00, 'stock_quantity' => 15, 'ram_gb' => 12, 'storage_gb' => 512, 'screen_size' => 6.9, 'color' => 'Orange', 'processor' => 'A19 Pro']);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'IP17PM-1TB-SLV', 'price' => 1600.00, 'stock_quantity' => 10, 'ram_gb' => 12, 'storage_gb' => 1024, 'screen_size' => 6.9, 'color' => 'Silver', 'processor' => 'A19 Pro']);

        // 10. iPhone Air
        $p = Product::create([
            'category_id' => $smartphones->id,
            'name'        => 'iPhone Air',
            'slug'        => 'iphone-air',
            'brand'       => 'Apple',
            'description' => 'The thinnest iPhone ever made. 5.6mm ultra-thin design, A19 Pro chip, and stunning 6.5-inch OLED display.',
            'status'      => 'active',
        ]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/air%20spaceblack.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/air%20cloud%20white.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/air%20light%20gold.png', 'sort_order' => 3]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/air%20skyblue.png', 'sort_order' => 4]);
        
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'IPA-256-SB', 'price' => 999.00, 'stock_quantity' => 30, 'ram_gb' => 12, 'storage_gb' => 256, 'screen_size' => 6.5, 'color' => 'Space Black', 'processor' => 'A19 Pro']);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'IPA-256-CW', 'price' => 999.00, 'stock_quantity' => 25, 'ram_gb' => 12, 'storage_gb' => 256, 'screen_size' => 6.5, 'color' => 'Cloud White', 'processor' => 'A19 Pro']);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'IPA-512-LG', 'price' => 1199.00, 'stock_quantity' => 20, 'ram_gb' => 12, 'storage_gb' => 512, 'screen_size' => 6.5, 'color' => 'Light Gold', 'processor' => 'A19 Pro']);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'IPA-512-SKB', 'price' => 1199.00, 'stock_quantity' => 15, 'ram_gb' => 12, 'storage_gb' => 512, 'screen_size' => 6.5, 'color' => 'Skyblue', 'processor' => 'A19 Pro']);

    }
}
