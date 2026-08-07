<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductImage;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@find.store',
        ]);

        $laptops     = Category::create(['name' => 'Laptops',     'slug' => 'laptops',     'description' => 'Thin, fast, all-day battery']);
        $smartphones = Category::create(['name' => 'Smartphones', 'slug' => 'smartphones', 'description' => 'Always connected, always ready']);
        $monitors    = Category::create(['name' => 'Monitors',    'slug' => 'monitors',    'description' => 'See more, strain less']);
        $accessories = Category::create(['name' => 'Accessories', 'slug' => 'accessories', 'description' => 'Small things, big difference']);

        // Helper to create variants
        $createVariants = function ($product, $skuPrefix, $basePrice, $ram, $storages, $screen, $colors, $processor) {
            foreach ($storages as $storage => $priceBump) {
                foreach ($colors as $index => $color) {
                    $colorCode = strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $color), 0, 3)) . $index;
                    $sku = $skuPrefix . '-' . $storage . '-' . $colorCode;
                    ProductVariant::create([
                        'product_id' => $product->id,
                        'sku' => $sku,
                        'price' => $basePrice + $priceBump,
                        'stock_quantity' => 20,
                        'ram_gb' => $ram,
                        'storage_gb' => $storage,
                        'screen_size' => $screen,
                        'color' => $color,
                        'processor' => $processor
                    ]);
                }
            }
        };

        // ── LAPTOPS ─────────────────────────────────────────────

        $p = Product::create(['category_id' => $laptops->id, 'name' => 'MacBook Pro 16"', 'slug' => 'macbook-pro-16', 'brand' => 'Apple', 'description' => 'The most powerful MacBook Pro ever.', 'status' => 'active']);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/MacBook%20pro/black%20mac%20pro%2016.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/MacBook%20pro/silver%20mac%20pro%2016.png', 'sort_order' => 2]);
        $createVariants($p, 'MBP16', 3499, 36, [1024 => 0, 2048 => 500], 16.2, ['Silver', 'Space Black'], 'Apple M3 Max');

        $p = Product::create(['category_id' => $laptops->id, 'name' => 'MacBook Air 13"', 'slug' => 'macbook-air-13', 'brand' => 'Apple', 'description' => 'Thin enough to forget it\'s in your bag.', 'status' => 'active']);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/MacBook%20Air/midnight%20air%2013.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/MacBook%20Air/starlight%20air%2013.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/MacBook%20Air/silver%20air%2013.png', 'sort_order' => 3]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/MacBook%20Air/skyblue%20air%2013.png', 'sort_order' => 4]);
        $createVariants($p, 'MBA13', 1199, 16, [512 => 0, 1024 => 400], 13.6, ['Midnight', 'Starlight', 'Silver', 'Skyblue'], 'Apple M3');

        $p = Product::create(['category_id' => $laptops->id, 'name' => 'ThinkPad X1 Carbon', 'slug' => 'thinkpad-x1-carbon', 'brand' => 'Lenovo', 'description' => 'The ultimate business laptop.', 'status' => 'active']);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/Lenovo/ThinkPad%20X1%20Carbon.png', 'sort_order' => 1]);
        $createVariants($p, 'TPX1', 1449, 16, [512 => 0, 1024 => 400], 14.0, ['Black'], 'Intel Core Ultra 7');

        $p = Product::create(['category_id' => $laptops->id, 'name' => 'Dell XPS 15', 'slug' => 'dell-xps-15', 'brand' => 'Dell', 'description' => 'Stunning edge-to-edge display.', 'status' => 'active']);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/DELL/BLACK%20XPS%2015.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/DELL/XPS%2015%20WHITE.png', 'sort_order' => 2]);
        $createVariants($p, 'XPS15', 1499, 16, [512 => 0, 1024 => 500], 15.6, ['Black', 'White'], 'Intel Core i7');

        // ── MONITORS ────────────────────────────────────────────

        $p = Product::create(['category_id' => $monitors->id, 'name' => 'ROG Strix OLED XG27AQDMESZ', 'slug' => 'rog-strix-oled-xg27aqdmesz', 'brand' => 'ASUS', 'description' => '27-inch 1440p OLED gaming monitor.', 'status' => 'active']);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/ROG%20STRIX/ROG%20Strix%20OLED%20XG27AQDMESZ.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/ROG%20STRIX/ROG%20Strix%20OLED%20XG27AQDMESZ%20side.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/ROG%20STRIX/ROG%20Strix%20OLED%20XG27AQDMESZ%20back.png', 'sort_order' => 3]);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'XG27AQDMESZ', 'price' => 899.00, 'stock_quantity' => 20, 'screen_size' => 27.0, 'color' => 'Black']);

        $p = Product::create(['category_id' => $monitors->id, 'name' => 'ROG Strix XG27UCG-W Gen2', 'slug' => 'rog-strix-xg27ucg-w-gen2', 'brand' => 'ASUS', 'description' => 'Stunning 27-inch 4K UHD white gaming monitor.', 'status' => 'active']);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/ROG%20STRIX/ROG%20Strix%20XG27UCG-W%20Gen2%20(XG27UCGR-W).png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/ROG%20STRIX/ROG%20Strix%20XG27UCG-W%20Gen2%20(XG27UCGR-W)%20side.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/ROG%20STRIX/ROG%20Strix%20XG27UCG-W%20Gen2%20(XG27UCGR-W)%20back.png', 'sort_order' => 3]);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'XG27UCG-W', 'price' => 799.00, 'stock_quantity' => 20, 'screen_size' => 27.0, 'color' => 'White']);

        $p = Product::create(['category_id' => $monitors->id, 'name' => 'ROG Swift OLED PG32UCWM', 'slug' => 'rog-swift-oled-pg32ucwm', 'brand' => 'ASUS', 'description' => '32-inch 4K OLED gaming monitor.', 'status' => 'active']);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/ROG%20STRIX/ROG%20Swift%20OLED%20PG32UCWM.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/ROG%20STRIX/ROG%20Swift%20OLED%20PG32UCWM%20double.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/ROG%20STRIX/ROG%20Swift%20OLED%20PG32UCWM%20back.png', 'sort_order' => 3]);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'PG32UCWM', 'price' => 1299.00, 'stock_quantity' => 20, 'screen_size' => 32.0, 'color' => 'Black']);

        $p = Product::create(['category_id' => $monitors->id, 'name' => 'Odyssey OLED G9 G95SD 49"', 'slug' => 'odyssey-oled-g9-g95sd-49', 'brand' => 'Samsung', 'description' => '49-inch curved DQHD OLED gaming monitor.', 'status' => 'active']);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/samsung/Moniteur%20Odyssey%20OLED%20G9%20G95SD%20DQHD%2049%20pouces%20.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/samsung/Moniteur%20Odyssey%20OLED%20G9%20G95SD%20DQHD%2049%20pouces%20side.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/samsung/Moniteur%20Odyssey%20OLED%20G9%20G95SD%20DQHD%2049%20pouces%20back.png', 'sort_order' => 3]);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'G95SD', 'price' => 1799.00, 'stock_quantity' => 20, 'screen_size' => 49.0, 'color' => 'Silver']);

        $p = Product::create(['category_id' => $monitors->id, 'name' => 'Odyssey OLED G8 G81SF 27"', 'slug' => 'odyssey-oled-g8-g81sf-27', 'brand' => 'Samsung', 'description' => '27-inch 4K UHD OLED gaming monitor.', 'status' => 'active']);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/samsung/Moniteur%20gaming%204K%20Odyssey%20OLED%20G8%20G81SF%2027%20pouces.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/samsung/Moniteur%20gaming%204K%20Odyssey%20OLED%20G8%20G81SF%2027%20pouces%20side.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/samsung/Moniteur%20gaming%204K%20Odyssey%20OLED%20G8%20G81SF%2027%20pouces%20(back).png', 'sort_order' => 3]);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'G81SF', 'price' => 999.00, 'stock_quantity' => 20, 'screen_size' => 27.0, 'color' => 'Silver']);

        $p = Product::create(['category_id' => $monitors->id, 'name' => 'Odyssey OLED G6 G60SF 32"', 'slug' => 'odyssey-oled-g6-g60sf-32', 'brand' => 'Samsung', 'description' => '32-inch QHD OLED gaming monitor.', 'status' => 'active']);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/samsung/Moniteur%20gaming%20QHD%20Odyssey%20OLED%20G6%20G60SF%20500Hz%2032%20pouces.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/samsung/Moniteur%20gaming%20QHD%20Odyssey%20OLED%20G6%20G60SF%20500Hz%2032%20pouces%20(side).png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/samsung/Moniteur%20gaming%20QHD%20Odyssey%20OLED%20G6%20G60SF%20500Hz%2032%20pouces%20(back%20side).png', 'sort_order' => 3]);
        ProductVariant::create(['product_id' => $p->id, 'sku' => 'G60SF', 'price' => 1099.00, 'stock_quantity' => 20, 'screen_size' => 32.0, 'color' => 'Silver']);

        // ── SMARTPHONES ─────────────────────────────────────────

        $p = Product::create(['category_id' => $smartphones->id, 'name' => 'Pixel 10 Pro', 'slug' => 'pixel-10-pro', 'brand' => 'Google', 'description' => 'The most advanced Pixel ever.', 'status' => 'active']);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/GOOGLE/pixel%2010%20pro%20jade.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/GOOGLE/pixel%2010%20pro%20moonstone.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/GOOGLE/pixel%2010%20pro%20porcelain.png', 'sort_order' => 3]);
        $createVariants($p, 'P10P', 999, 12, [128 => 0, 256 => 100, 512 => 200], 6.3, ['Jade', 'Moonstone', 'Porcelain'], 'Tensor G5');

        $p = Product::create(['category_id' => $smartphones->id, 'name' => 'Pixel 10 Pro XL', 'slug' => 'pixel-10-pro-xl', 'brand' => 'Google', 'description' => 'Bigger screen, bigger battery.', 'status' => 'active']);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/GOOGLE/pixel%2010%20pro%20xl%20jade.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/GOOGLE/pixel%2010%20pro%20xl%20moonstone.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/GOOGLE/pixel%2010%20pro%20xl%20porcelain.png', 'sort_order' => 3]);
        $createVariants($p, 'P10PXL', 1099, 16, [256 => 0, 512 => 150, 1024 => 300], 6.8, ['Jade', 'Moonstone', 'Porcelain'], 'Tensor G5');

        $p = Product::create(['category_id' => $smartphones->id, 'name' => 'Galaxy S25 Ultra', 'slug' => 'galaxy-s25-ultra', 'brand' => 'Samsung', 'description' => 'Epic AI, 200MP camera, titanium frame.', 'status' => 'active']);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s25%20ultra%20titanium%20black.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s25%20ultra%20titanium%20gold.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s25%20ultra%20titanium%20silver%20blue.png', 'sort_order' => 3]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s25%20ultra%20titanium%20white%20silver.png', 'sort_order' => 4]);
        $createVariants($p, 'S25U', 1299, 12, [256 => 0, 512 => 120, 1024 => 320], 6.8, ['Titanium Black', 'Titanium Gold', 'Titanium Silver Blue', 'Titanium White Silver'], 'Snapdragon 8 Gen 4');

        $p = Product::create(['category_id' => $smartphones->id, 'name' => 'Galaxy S26', 'slug' => 'galaxy-s26', 'brand' => 'Samsung', 'description' => 'The next generation of Galaxy.', 'status' => 'active']);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s26%20black.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s26%20skyblue.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s26%20violet.png', 'sort_order' => 3]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s26%20white.png', 'sort_order' => 4]);
        $createVariants($p, 'S26', 799, 8, [128 => 0, 256 => 60], 6.2, ['Black', 'Skyblue', 'Violet', 'White'], 'Snapdragon 8 Gen 5');

        $p = Product::create(['category_id' => $smartphones->id, 'name' => 'Galaxy S26 Plus', 'slug' => 'galaxy-s26-plus', 'brand' => 'Samsung', 'description' => 'More screen, more battery.', 'status' => 'active']);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s26%20plus%20black.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s26%20plus%20skyblue.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s26%20plus%20violet.png', 'sort_order' => 3]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s26%20plus%20white.png', 'sort_order' => 4]);
        $createVariants($p, 'S26P', 999, 12, [256 => 0, 512 => 120], 6.7, ['Black', 'Skyblue', 'Violet', 'White'], 'Snapdragon 8 Gen 5');

        $p = Product::create(['category_id' => $smartphones->id, 'name' => 'Galaxy S26 Ultra', 'slug' => 'galaxy-s26-ultra', 'brand' => 'Samsung', 'description' => 'The ultimate flagship.', 'status' => 'active']);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s26%20ultra%20black.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s26%20ultra%20cobalt%20violet.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s26%20ultra%20pink%20gold.png', 'sort_order' => 3]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s26%20ultra%20silver.png', 'sort_order' => 4]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s26%20ultra%20sky%20blue.png', 'sort_order' => 5]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s26%20ultra%20white.png', 'sort_order' => 6]);
        $createVariants($p, 'S26U', 1299, 16, [256 => 0, 512 => 120, 1024 => 360], 6.8, ['Black', 'Cobalt Violet', 'Pink Gold', 'Silver', 'Sky Blue', 'White'], 'Snapdragon 8 Gen 5');

        $p = Product::create(['category_id' => $smartphones->id, 'name' => 'Galaxy Z Fold 6', 'slug' => 'galaxy-z-fold-6', 'brand' => 'Samsung', 'description' => 'Unfold a world of possibilities.', 'status' => 'active']);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/z%20fold%206%20navy%20(folded).png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/z%20fold%206%20pink%20(folded).png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/z%20fold%206%20silver%20shadow%20(folded).png', 'sort_order' => 3]);
        $createVariants($p, 'ZF6', 1899, 12, [256 => 0, 512 => 120, 1024 => 360], 7.6, ['Navy', 'Pink', 'Silver Shadow'], 'Snapdragon 8 Gen 3');

        $p = Product::create(['category_id' => $smartphones->id, 'name' => 'iPhone 16 Plus', 'slug' => 'iphone-16-plus', 'brand' => 'Apple', 'description' => 'Super Retina XDR OLED display.', 'status' => 'active']);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/16%20plus%20black.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/16%20plus%20teal.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/16%20plus%20ultramarine.png', 'sort_order' => 3]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/16%20plus%20white.png', 'sort_order' => 4]);
        $createVariants($p, 'IP16P', 899, 8, [128 => 0, 256 => 100, 512 => 300], 6.7, ['Black', 'Teal', 'Ultramarine', 'White'], 'A18');

        $p = Product::create(['category_id' => $smartphones->id, 'name' => 'iPhone 17 Pro Max', 'slug' => 'iphone-17-pro-max', 'brand' => 'Apple', 'description' => '6.9-inch Super Retina XDR OLED.', 'status' => 'active']);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/17%20pro%20max%20intense%20blue.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/17%20pro%20max%20orange.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/17%20pro%20max%20silver.png', 'sort_order' => 3]);
        $createVariants($p, 'IP17PM', 1200, 12, [256 => 0, 512 => 200, 1024 => 400], 6.9, ['Intense Blue', 'Orange', 'Silver'], 'A19 Pro');

        $p = Product::create(['category_id' => $smartphones->id, 'name' => 'iPhone Air', 'slug' => 'iphone-air', 'brand' => 'Apple', 'description' => 'The thinnest iPhone ever made.', 'status' => 'active']);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/air%20spaceblack.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/air%20cloud%20white.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/air%20light%20gold.png', 'sort_order' => 3]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/air%20skyblue.png', 'sort_order' => 4]);
        $createVariants($p, 'IPA', 999, 12, [256 => 0, 512 => 200], 6.5, ['Space Black', 'Cloud White', 'Light Gold', 'Skyblue'], 'A19 Pro');

        $p = Product::create(['category_id' => $smartphones->id, 'name' => 'iPhone 17', 'slug' => 'iphone-17', 'brand' => 'Apple', 'description' => 'The baseline for exceptional.', 'status' => 'active']);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/17%20black.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/17%20lavender.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/17%20mist%20blue.png', 'sort_order' => 3]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/17%20sage.png', 'sort_order' => 4]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/17%20white.png', 'sort_order' => 5]);
        $createVariants($p, 'IP17', 799, 8, [128 => 0, 256 => 100, 512 => 300], 6.1, ['Black', 'Lavender', 'Mist Blue', 'Sage', 'White'], 'A19');

        $p = Product::create(['category_id' => $smartphones->id, 'name' => 'iPhone 17 Pro', 'slug' => 'iphone-17-pro', 'brand' => 'Apple', 'description' => 'Pro level power in your pocket.', 'status' => 'active']);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/17%20bro%20blue%20intense.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/17%20pro%20orange.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/17%20pro%20silver.png', 'sort_order' => 3]);
        $createVariants($p, 'IP17P', 1099, 12, [256 => 0, 512 => 200, 1024 => 400], 6.3, ['Blue Intense', 'Orange', 'Silver'], 'A19 Pro');
    }
}
