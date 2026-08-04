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
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/MacBook%20Air/Midnight%20air%2013.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/MacBook%20Air/starlight%20air%2013.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/MacBook%20Air/silver%20air%2013.png', 'sort_order' => 3]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/MacBook%20Air/Skyblue%20air%2013.png', 'sort_order' => 4]);
        
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

        // 5. iPhone 15 Pro Max
        $p = Product::create([
            'category_id' => $smartphones->id,
            'name'        => 'iPhone 15 Pro Max',
            'slug'        => 'iphone-15-pro-max',
            'brand'       => 'Apple',
            'description' => 'Forged in titanium. A17 Pro chip. The most powerful iPhone ever made.',
            'status'      => 'active',
        ]);
        ProductImage::create(['product_id' => $p->id, 'url' => 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=800&auto=format&fit=crop', 'sort_order' => 2]);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'IP15PM-256-NT',     'price' => 1199.00, 'stock_quantity' => 30, 'ram_gb' => 8, 'storage_gb' => 256,  'screen_size' => 6.7, 'color' => 'Natural Titanium', 'processor' => 'A17 Pro']);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'IP15PM-512-BT',     'price' => 1399.00, 'stock_quantity' => 20, 'ram_gb' => 8, 'storage_gb' => 512,  'screen_size' => 6.7, 'color' => 'Blue Titanium',    'processor' => 'A17 Pro']);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'IP15PM-1TB-BLT',    'price' => 1599.00, 'stock_quantity' => 10, 'ram_gb' => 8, 'storage_gb' => 1024, 'screen_size' => 6.7, 'color' => 'Black Titanium',   'processor' => 'A17 Pro']);

        // 6. Samsung Galaxy S24 Ultra
        $p = Product::create([
            'category_id' => $smartphones->id,
            'name'        => 'Samsung Galaxy S24 Ultra',
            'slug'        => 'samsung-galaxy-s24-ultra',
            'brand'       => 'Samsung',
            'description' => 'Galaxy AI is here. The ultimate creative companion with built-in S Pen and titanium frame.',
            'status'      => 'active',
        ]);
        ProductImage::create(['product_id' => $p->id, 'url' => 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop', 'sort_order' => 1]);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'S24U-256-TG',       'price' => 1299.00, 'stock_quantity' => 22, 'ram_gb' => 12, 'storage_gb' => 256,  'screen_size' => 6.8, 'color' => 'Titanium Gray',    'processor' => 'Snapdragon 8 Gen 3']);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'S24U-512-TV',       'price' => 1419.00, 'stock_quantity' => 15, 'ram_gb' => 12, 'storage_gb' => 512,  'screen_size' => 6.8, 'color' => 'Titanium Violet',  'processor' => 'Snapdragon 8 Gen 3']);

        // 7. Google Pixel 8 Pro
        $p = Product::create([
            'category_id' => $smartphones->id,
            'name'        => 'Google Pixel 8 Pro',
            'slug'        => 'google-pixel-8-pro',
            'brand'       => 'Google',
            'description' => 'The best of Google AI, the best Pixel camera ever, and seven years of updates.',
            'status'      => 'active',
        ]);
        ProductImage::create(['product_id' => $p->id, 'url' => 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop', 'sort_order' => 1]);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'PX8P-128-OB',       'price' => 999.00,  'stock_quantity' => 18, 'ram_gb' => 12, 'storage_gb' => 128,  'screen_size' => 6.7, 'color' => 'Obsidian', 'processor' => 'Google Tensor G3']);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'PX8P-256-PO',       'price' => 1059.00, 'stock_quantity' => 12, 'ram_gb' => 12, 'storage_gb' => 256,  'screen_size' => 6.7, 'color' => 'Porcelain', 'processor' => 'Google Tensor G3']);

        // ── MONITORS ────────────────────────────────────────────

        // 8. LG UltraFine 27" 4K
        $p = Product::create([
            'category_id' => $monitors->id,
            'name'        => 'LG UltraFine 27" 4K',
            'slug'        => 'lg-ultrafine-27-4k',
            'brand'       => 'LG',
            'description' => 'Stunning 4K resolution with Thunderbolt 4 connectivity. Color-accurate IPS panel for creative professionals.',
            'status'      => 'active',
        ]);
        ProductImage::create(['product_id' => $p->id, 'url' => 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800&auto=format&fit=crop', 'sort_order' => 1]);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'LG27-4K-BK',        'price' => 699.00,  'stock_quantity' => 20, 'ram_gb' => null, 'storage_gb' => null, 'screen_size' => 27.0, 'color' => 'Black', 'processor' => null, 'attributes' => json_encode(['resolution' => '3840x2160', 'refresh_rate' => '60Hz', 'panel' => 'IPS'])]);

        // 9. Samsung Odyssey G7 32"
        $p = Product::create([
            'category_id' => $monitors->id,
            'name'        => 'Samsung Odyssey G7 32"',
            'slug'        => 'samsung-odyssey-g7-32',
            'brand'       => 'Samsung',
            'description' => 'Curved gaming monitor with 240Hz refresh rate and 1ms response time. Immerse yourself in the game.',
            'status'      => 'active',
        ]);
        ProductImage::create(['product_id' => $p->id, 'url' => 'https://images.unsplash.com/photo-1616763355548-1b11cea02883?q=80&w=800&auto=format&fit=crop', 'sort_order' => 1]);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'OG7-32-BK',         'price' => 799.00,  'stock_quantity' => 14, 'ram_gb' => null, 'storage_gb' => null, 'screen_size' => 32.0, 'color' => 'Black', 'processor' => null, 'attributes' => json_encode(['resolution' => '2560x1440', 'refresh_rate' => '240Hz', 'panel' => 'VA', 'curved' => true])]);

        // 10. Dell UltraSharp 32" 4K
        $p = Product::create([
            'category_id' => $monitors->id,
            'name'        => 'Dell UltraSharp 32" 4K',
            'slug'        => 'dell-ultrasharp-32-4k',
            'brand'       => 'Dell',
            'description' => 'Professional-grade 4K monitor with USB-C hub. Built for productivity.',
            'status'      => 'active',
        ]);
        ProductImage::create(['product_id' => $p->id, 'url' => 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?q=80&w=800&auto=format&fit=crop', 'sort_order' => 1]);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'DU32-4K-SLV',       'price' => 949.00,  'stock_quantity' => 9, 'ram_gb' => null, 'storage_gb' => null, 'screen_size' => 32.0, 'color' => 'Silver', 'processor' => null, 'attributes' => json_encode(['resolution' => '3840x2160', 'refresh_rate' => '60Hz', 'panel' => 'IPS'])]);

        // ── ACCESSORIES ─────────────────────────────────────────

        // 11. AirPods Pro 2
        $p = Product::create([
            'category_id' => $accessories->id,
            'name'        => 'AirPods Pro 2',
            'slug'        => 'airpods-pro-2',
            'brand'       => 'Apple',
            'description' => 'Adaptive Audio. Personalized Spatial Audio. Up to 2x more Active Noise Cancellation.',
            'status'      => 'active',
        ]);
        ProductImage::create(['product_id' => $p->id, 'url' => 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?q=80&w=800&auto=format&fit=crop', 'sort_order' => 1]);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'APP2-USB-C',        'price' => 249.00,  'stock_quantity' => 50, 'ram_gb' => null, 'storage_gb' => null, 'screen_size' => null, 'color' => 'White', 'processor' => null]);

        // 12. Logitech MX Master 3S
        $p = Product::create([
            'category_id' => $accessories->id,
            'name'        => 'Logitech MX Master 3S',
            'slug'        => 'logitech-mx-master-3s',
            'brand'       => 'Logitech',
            'description' => 'The master series mouse engineered for coders and creators. Quiet clicks, 8K DPI tracking.',
            'status'      => 'active',
        ]);
        ProductImage::create(['product_id' => $p->id, 'url' => 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800&auto=format&fit=crop', 'sort_order' => 1]);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'MXM3S-GR',          'price' => 99.00,   'stock_quantity' => 35, 'ram_gb' => null, 'storage_gb' => null, 'screen_size' => null, 'color' => 'Graphite',    'processor' => null]);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'MXM3S-PG',          'price' => 99.00,   'stock_quantity' => 30, 'ram_gb' => null, 'storage_gb' => null, 'screen_size' => null, 'color' => 'Pale Grey',   'processor' => null]);

        // 13. Samsung T7 Shield 2TB
        $p = Product::create([
            'category_id' => $accessories->id,
            'name'        => 'Samsung T7 Shield 2TB',
            'slug'        => 'samsung-t7-shield-2tb',
            'brand'       => 'Samsung',
            'description' => 'Rugged portable SSD with IP65 water and dust resistance. Transfer speeds up to 1,050 MB/s.',
            'status'      => 'active',
        ]);
        ProductImage::create(['product_id' => $p->id, 'url' => 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?q=80&w=800&auto=format&fit=crop', 'sort_order' => 1]);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'T7S-2TB-BK',        'price' => 159.00,  'stock_quantity' => 40, 'ram_gb' => null, 'storage_gb' => 2048, 'screen_size' => null, 'color' => 'Black', 'processor' => null]);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'T7S-1TB-BL',        'price' => 109.00,  'stock_quantity' => 45, 'ram_gb' => null, 'storage_gb' => 1024, 'screen_size' => null, 'color' => 'Blue',  'processor' => null]);
    }
}
