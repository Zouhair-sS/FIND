import os

seeder_content = """<?php
namespace Database\\Seeders;

use Illuminate\\Database\\Seeder;
use App\\Models\\Brand;
use App\\Models\\Series;
use App\\Models\\Category;
use App\\Models\\Attribute;
use App\\Models\\AttributeValue;
use App\\Models\\Product;
use App\\Models\\ProductVariant;
use App\\Models\\ProductImage;
use App\\Models\\Collection;
use Illuminate\\Support\\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Categories (Flat Structure per user request)
        $electronics = Category::create(['name' => 'Electronics', 'slug' => 'electronics', 'sort_order' => 1]);
        
        $laptopsCat = Category::create(['name' => 'Laptops', 'slug' => 'laptops', 'parent_id' => $electronics->id, 'sort_order' => 10]);
        $smartphonesCat = Category::create(['name' => 'Smartphones', 'slug' => 'smartphones', 'parent_id' => $electronics->id, 'sort_order' => 20]);
        $monitorsCat = Category::create(['name' => 'Monitors', 'slug' => 'monitors', 'parent_id' => $electronics->id, 'sort_order' => 30]);
        
        // Empty categories for future use
        Category::create(['name' => 'Tablets', 'slug' => 'tablets', 'parent_id' => $electronics->id, 'sort_order' => 40]);
        Category::create(['name' => 'Smartwatches', 'slug' => 'smartwatches', 'parent_id' => $electronics->id, 'sort_order' => 50]);
        Category::create(['name' => 'Audio', 'slug' => 'audio', 'parent_id' => $electronics->id, 'sort_order' => 60]);
        Category::create(['name' => 'Accessories', 'slug' => 'accessories', 'parent_id' => $electronics->id, 'sort_order' => 70]);
        Category::create(['name' => 'Gaming', 'slug' => 'gaming', 'parent_id' => $electronics->id, 'sort_order' => 80]);

        // 2. Create Brands & Series
        $apple = Brand::create(['name' => 'Apple', 'slug' => 'apple']);
        $samsung = Brand::create(['name' => 'Samsung', 'slug' => 'samsung']);
        $google = Brand::create(['name' => 'Google', 'slug' => 'google']);
        $lenovo = Brand::create(['name' => 'Lenovo', 'slug' => 'lenovo']);
        $dell = Brand::create(['name' => 'Dell', 'slug' => 'dell']);
        $asus = Brand::create(['name' => 'ASUS', 'slug' => 'asus']);
        $msi = Brand::create(['name' => 'MSI', 'slug' => 'msi']);
        $lg = Brand::create(['name' => 'LG', 'slug' => 'lg']);

        $seriesMBA = Series::create(['brand_id' => $apple->id, 'name' => 'MacBook Air', 'slug' => 'macbook-air']);
        $seriesMBP = Series::create(['brand_id' => $apple->id, 'name' => 'MacBook Pro', 'slug' => 'macbook-pro']);
        $seriesIPhone = Series::create(['brand_id' => $apple->id, 'name' => 'iPhone', 'slug' => 'iphone']);

        $seriesGS = Series::create(['brand_id' => $samsung->id, 'name' => 'Galaxy S', 'slug' => 'galaxy-s']);
        $seriesGZ = Series::create(['brand_id' => $samsung->id, 'name' => 'Galaxy Z', 'slug' => 'galaxy-z']);
        $seriesOdyssey = Series::create(['brand_id' => $samsung->id, 'name' => 'Odyssey', 'slug' => 'odyssey']);

        $seriesPixel = Series::create(['brand_id' => $google->id, 'name' => 'Pixel', 'slug' => 'pixel']);
        
        $seriesThinkPad = Series::create(['brand_id' => $lenovo->id, 'name' => 'ThinkPad', 'slug' => 'thinkpad']);
        $seriesXPS = Series::create(['brand_id' => $dell->id, 'name' => 'XPS', 'slug' => 'xps']);
        $seriesROG = Series::create(['brand_id' => $asus->id, 'name' => 'ROG', 'slug' => 'rog']);
        $seriesUltraGear = Series::create(['brand_id' => $lg->id, 'name' => 'UltraGear', 'slug' => 'ultragear']);

        // 3. Create Attributes
        $attrOS = Attribute::create(['name' => 'OS', 'slug' => 'os']);
        $attrUsage = Attribute::create(['name' => 'Usage', 'slug' => 'usage']);
        $attrColor = Attribute::create(['name' => 'Color', 'slug' => 'color']);

        // Helper to get or create attribute value
        $getAttrValue = function ($attribute, $value) {
            return AttributeValue::firstOrCreate(['attribute_id' => $attribute->id, 'value' => $value]);
        };

        // Common values
        $valMacOs = $getAttrValue($attrOS, 'macOS');
        $valIOS = $getAttrValue($attrOS, 'iOS');
        $valAndroid = $getAttrValue($attrOS, 'Android');
        $valWindows = $getAttrValue($attrOS, 'Windows 11');

        $valGaming = $getAttrValue($attrUsage, 'Gaming');
        $valBusiness = $getAttrValue($attrUsage, 'Business');
        $valCreator = $getAttrValue($attrUsage, 'Creator');

        // 4. Create Collections
        $colFeatured = Collection::create(['name' => 'Featured', 'slug' => 'featured', 'is_featured' => true]);
        $colNewArrivals = Collection::create(['name' => 'New Arrivals', 'slug' => 'new-arrivals', 'is_featured' => true]);
        $colBestSellers = Collection::create(['name' => 'Best Sellers', 'slug' => 'best-sellers']);
        $colPremium = Collection::create(['name' => 'Premium', 'slug' => 'premium']);

        // 5. Products Helper
        $createAdvancedVariants = function ($product, $skuPrefix, $configs, $screen, $colors) {
            foreach ($configs as $cfg) {
                foreach ($cfg['storages'] as $storage => $priceBump) {
                    foreach ($colors as $index => $color) {
                        $colorCode = strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $color), 0, 3)) . $index;
                        $procCode = isset($cfg['processor']) ? strtoupper(preg_replace('/[^A-Z0-9]/i', '', $cfg['processor'])) . '-' : '';
                        $sku = $skuPrefix . '-' . $procCode . $cfg['ram'] . '-' . $storage . '-' . $colorCode;
                        ProductVariant::create([
                            'product_id' => $product->id,
                            'sku' => str_replace(' ', '', $sku),
                            'price' => ($cfg['basePrice'] + $priceBump) * 9.35,
                            'stock_quantity' => 20,
                            'ram_gb' => $cfg['ram'],
                            'storage_gb' => $storage,
                            'screen_size' => $screen,
                            'color' => $color,
                            'processor' => $cfg['processor'] ?? null
                        ]);
                    }
                }
            }
        };

        // --- LAPTOPS ---
        $p = Product::create([
            'category_id' => $laptopsCat->id, 'brand_id' => $apple->id, 'series_id' => $seriesMBP->id,
            'name' => 'MacBook Pro 16"', 'slug' => 'macbook-pro-16', 'sku' => 'APP-MBP16',
            'description' => 'The most powerful MacBook Pro ever.', 'status' => 'active', 'stock' => 100
        ]);
        $p->attributeValues()->attach([$valMacOs->id, $valCreator->id, $valBusiness->id]);
        $p->collections()->attach([$colFeatured->id, $colPremium->id]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/MacBook%20pro/black%20mac%20pro%2016.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/MacBook%20pro/silver%20mac%20pro%2016.png', 'sort_order' => 2]);
        $createAdvancedVariants($p, 'MBP16', [
            ['processor' => 'Apple M3 Pro', 'ram' => 18, 'basePrice' => 2499, 'storages' => [512 => 0, 1024 => 200, 2048 => 600, 4096 => 1200]],
            ['processor' => 'Apple M3 Pro', 'ram' => 36, 'basePrice' => 2899, 'storages' => [512 => 0, 1024 => 200, 2048 => 600, 4096 => 1200]],
            ['processor' => 'Apple M3 Max', 'ram' => 36, 'basePrice' => 3499, 'storages' => [1024 => 0, 2048 => 400, 4096 => 1000, 8192 => 2200]],
            ['processor' => 'Apple M3 Max', 'ram' => 48, 'basePrice' => 3999, 'storages' => [1024 => 0, 2048 => 400, 4096 => 1000, 8192 => 2200]],
            ['processor' => 'Apple M3 Max', 'ram' => 128, 'basePrice' => 4999, 'storages' => [1024 => 0, 2048 => 400, 4096 => 1000, 8192 => 2200]],
        ], 16.2, ['Silver', 'Space Black']);

        $p = Product::create([
            'category_id' => $laptopsCat->id, 'brand_id' => $apple->id, 'series_id' => $seriesMBA->id,
            'name' => 'MacBook Air 13"', 'slug' => 'macbook-air-13', 'sku' => 'APP-MBA13',
            'description' => 'Thin enough to forget it\\'s in your bag.', 'status' => 'active', 'stock' => 150
        ]);
        $p->attributeValues()->attach([$valMacOs->id]);
        $p->collections()->attach([$colBestSellers->id]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/MacBook%20Air/midnight%20air%2013.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/MacBook%20Air/starlight%20air%2013.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/MacBook%20Air/silver%20air%2013.png', 'sort_order' => 3]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/MacBook%20Air/skyblue%20air%2013.png', 'sort_order' => 4]);
        $createAdvancedVariants($p, 'MBA13', [
            ['processor' => 'Apple M3', 'ram' => 8, 'basePrice' => 1099, 'storages' => [256 => 0, 512 => 200, 1024 => 400, 2048 => 800]],
            ['processor' => 'Apple M3', 'ram' => 16, 'basePrice' => 1299, 'storages' => [256 => 0, 512 => 200, 1024 => 400, 2048 => 800]],
            ['processor' => 'Apple M3', 'ram' => 24, 'basePrice' => 1499, 'storages' => [256 => 0, 512 => 200, 1024 => 400, 2048 => 800]],
        ], 13.6, ['Midnight', 'Starlight', 'Silver', 'Skyblue']);

        $p = Product::create([
            'category_id' => $laptopsCat->id, 'brand_id' => $lenovo->id, 'series_id' => $seriesThinkPad->id,
            'name' => 'ThinkPad X1 Carbon', 'slug' => 'thinkpad-x1-carbon', 'sku' => 'LEN-TPX1',
            'description' => 'The ultimate business laptop.', 'status' => 'active', 'stock' => 50
        ]);
        $p->attributeValues()->attach([$valWindows->id, $valBusiness->id]);
        $p->collections()->attach([$colBestSellers->id]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/Lenovo/ThinkPad%20X1%20Carbon.png', 'sort_order' => 1]);
        $createAdvancedVariants($p, 'TPX1', [
            ['processor' => 'Intel Core Ultra 5 125U', 'ram' => 16, 'basePrice' => 1349, 'storages' => [512 => 0, 1024 => 200]],
            ['processor' => 'Intel Core Ultra 7 155U', 'ram' => 16, 'basePrice' => 1549, 'storages' => [512 => 0, 1024 => 200, 2048 => 500]],
            ['processor' => 'Intel Core Ultra 7 155U', 'ram' => 32, 'basePrice' => 1749, 'storages' => [512 => 0, 1024 => 200, 2048 => 500]],
            ['processor' => 'Intel Core Ultra 7 165U', 'ram' => 64, 'basePrice' => 2149, 'storages' => [1024 => 0, 2048 => 300]],
        ], 14.0, ['Black']);

        $p = Product::create([
            'category_id' => $laptopsCat->id, 'brand_id' => $dell->id, 'series_id' => $seriesXPS->id,
            'name' => 'Dell XPS 15', 'slug' => 'dell-xps-15', 'sku' => 'DEL-XPS15',
            'description' => 'Stunning edge-to-edge display.', 'status' => 'active', 'stock' => 80
        ]);
        $p->attributeValues()->attach([$valWindows->id, $valCreator->id, $valBusiness->id]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/DELL/BLACK%20XPS%2015.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/laptops/DELL/XPS%2015%20WHITE.png', 'sort_order' => 2]);
        $createAdvancedVariants($p, 'XPS15', [
            ['processor' => 'Intel Core i7-13700H', 'ram' => 16, 'basePrice' => 1499, 'storages' => [512 => 0, 1024 => 150, 2048 => 350]],
            ['processor' => 'Intel Core i7-13700H', 'ram' => 32, 'basePrice' => 1649, 'storages' => [512 => 0, 1024 => 150, 2048 => 350]],
            ['processor' => 'Intel Core i9-13900H', 'ram' => 32, 'basePrice' => 1999, 'storages' => [1024 => 0, 2048 => 200, 4096 => 500]],
            ['processor' => 'Intel Core i9-13900H', 'ram' => 64, 'basePrice' => 2299, 'storages' => [1024 => 0, 2048 => 200, 4096 => 500, 8192 => 1000]],
        ], 15.6, ['Black', 'White']);


        // --- SMARTPHONES ---
        $createPhoneVariants = function ($product, $skuPrefix, $configs, $screen, $colors) {
            foreach ($configs as $cfg) {
                foreach ($cfg['storages'] as $storage => $priceBump) {
                    foreach ($colors as $index => $color) {
                        $colorCode = strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $color), 0, 3)) . $index;
                        $procCode = isset($cfg['processor']) ? strtoupper(preg_replace('/[^A-Z0-9]/i', '', $cfg['processor'])) . '-' : '';
                        $sku = $skuPrefix . '-' . $procCode . $cfg['ram'] . '-' . $storage . '-' . $colorCode;
                        ProductVariant::create([
                            'product_id' => $product->id,
                            'sku' => str_replace(' ', '', $sku),
                            'price' => ($cfg['basePrice'] + $priceBump) * 9.35,
                            'stock_quantity' => 20,
                            'ram_gb' => $cfg['ram'],
                            'storage_gb' => $storage,
                            'screen_size' => $screen,
                            'color' => $color,
                            'processor' => $cfg['processor'] ?? null
                        ]);
                    }
                }
            }
        };

        $p = Product::create([
            'category_id' => $smartphonesCat->id, 'brand_id' => $google->id, 'series_id' => $seriesPixel->id,
            'name' => 'Pixel 10 Pro', 'slug' => 'pixel-10-pro', 'sku' => 'GOO-P10P',
            'description' => 'The most advanced Pixel ever.', 'status' => 'active', 'stock' => 300
        ]);
        $p->attributeValues()->attach([$valAndroid->id]);
        $p->collections()->attach([$colNewArrivals->id]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/GOOGLE/pixel%2010%20pro%20jade.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/GOOGLE/pixel%2010%20pro%20moonstone.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/GOOGLE/pixel%2010%20pro%20porcelain.png', 'sort_order' => 3]);
        $createPhoneVariants($p, 'P10P', [['processor'=>'Tensor G5', 'ram'=>12, 'basePrice'=>999, 'storages'=>[128=>0, 256=>100, 512=>200]]], 6.3, ['Jade', 'Moonstone', 'Porcelain']);

        $p = Product::create([
            'category_id' => $smartphonesCat->id, 'brand_id' => $google->id, 'series_id' => $seriesPixel->id,
            'name' => 'Pixel 10 Pro XL', 'slug' => 'pixel-10-pro-xl', 'sku' => 'GOO-P10PXL',
            'description' => 'Bigger screen, bigger battery.', 'status' => 'active', 'stock' => 100
        ]);
        $p->attributeValues()->attach([$valAndroid->id]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/GOOGLE/pixel%2010%20pro%20xl%20jade.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/GOOGLE/pixel%2010%20pro%20xl%20moonstone.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/GOOGLE/pixel%2010%20pro%20xl%20porcelain.png', 'sort_order' => 3]);
        $createPhoneVariants($p, 'P10PXL', [['processor'=>'Tensor G5', 'ram'=>16, 'basePrice'=>1099, 'storages'=>[256=>0, 512=>150, 1024=>300]]], 6.8, ['Jade', 'Moonstone', 'Porcelain']);

        $p = Product::create([
            'category_id' => $smartphonesCat->id, 'brand_id' => $samsung->id, 'series_id' => $seriesGS->id,
            'name' => 'Galaxy S25 Ultra', 'slug' => 'galaxy-s25-ultra', 'sku' => 'SAM-S25U',
            'description' => 'Epic AI, 200MP camera, titanium frame.', 'status' => 'active', 'stock' => 120
        ]);
        $p->attributeValues()->attach([$valAndroid->id]);
        $p->collections()->attach([$colPremium->id, $colFeatured->id]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s25%20ultra%20titanium%20black.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s25%20ultra%20titanium%20gold.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s25%20ultra%20titanium%20silver%20blue.png', 'sort_order' => 3]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s25%20ultra%20titanium%20white%20silver.png', 'sort_order' => 4]);
        $createPhoneVariants($p, 'S25U', [['processor'=>'Snapdragon 8 Gen 4', 'ram'=>12, 'basePrice'=>1299, 'storages'=>[256=>0, 512=>120, 1024=>320]]], 6.8, ['Titanium Black', 'Titanium Gold', 'Titanium Silver Blue', 'Titanium White Silver']);

        $p = Product::create([
            'category_id' => $smartphonesCat->id, 'brand_id' => $samsung->id, 'series_id' => $seriesGS->id,
            'name' => 'Galaxy S26 Ultra', 'slug' => 'galaxy-s26-ultra', 'sku' => 'SAM-S26U',
            'description' => 'The ultimate flagship.', 'status' => 'active', 'stock' => 200
        ]);
        $p->attributeValues()->attach([$valAndroid->id]);
        $p->collections()->attach([$colNewArrivals->id, $colPremium->id]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s26%20ultra%20black.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s26%20ultra%20cobalt%20violet.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s26%20ultra%20pink%20gold.png', 'sort_order' => 3]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s26%20ultra%20silver.png', 'sort_order' => 4]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s26%20ultra%20sky%20blue.png', 'sort_order' => 5]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s26%20ultra%20white.png', 'sort_order' => 6]);
        $createPhoneVariants($p, 'S26U', [['processor'=>'Snapdragon 8 Gen 5', 'ram'=>16, 'basePrice'=>1299, 'storages'=>[256=>0, 512=>120, 1024=>360]]], 6.8, ['Black', 'Cobalt Violet', 'Pink Gold', 'Silver', 'Sky Blue', 'White']);

        $p = Product::create([
            'category_id' => $smartphonesCat->id, 'brand_id' => $samsung->id, 'series_id' => $seriesGZ->id,
            'name' => 'Galaxy Z Fold 6', 'slug' => 'galaxy-z-fold-6', 'sku' => 'SAM-ZF6',
            'description' => 'Unfold a world of possibilities.', 'status' => 'active', 'stock' => 50
        ]);
        $p->attributeValues()->attach([$valAndroid->id]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/z%20fold%206%20navy%20(folded).png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/z%20fold%206%20pink%20(folded).png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/z%20fold%206%20silver%20shadow%20(folded).png', 'sort_order' => 3]);
        $createPhoneVariants($p, 'ZF6', [['processor'=>'Snapdragon 8 Gen 3', 'ram'=>12, 'basePrice'=>1899, 'storages'=>[256=>0, 512=>120, 1024=>360]]], 7.6, ['Navy', 'Pink', 'Silver Shadow']);

        $p = Product::create([
            'category_id' => $smartphonesCat->id, 'brand_id' => $apple->id, 'series_id' => $seriesIPhone->id,
            'name' => 'iPhone 17 Pro Max', 'slug' => 'iphone-17-pro-max', 'sku' => 'APP-IP17PM',
            'description' => '6.9-inch Super Retina XDR OLED.', 'status' => 'active', 'stock' => 1000
        ]);
        $p->attributeValues()->attach([$valIOS->id]);
        $p->collections()->attach([$colFeatured->id, $colPremium->id, $colBestSellers->id]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/17%20pro%20max%20intense%20blue.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/17%20pro%20max%20orange.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/17%20pro%20max%20silver.png', 'sort_order' => 3]);
        $createPhoneVariants($p, 'IP17PM', [['processor'=>'A19 Pro', 'ram'=>12, 'basePrice'=>1200, 'storages'=>[256=>0, 512=>200, 1024=>400]]], 6.9, ['Intense Blue', 'Orange', 'Silver']);


        // --- MONITORS ---
        $createMonitorVariant = function ($product, $sku, $price, $screen, $color) {
            ProductVariant::create([
                'product_id' => $product->id, 'sku' => $sku, 'price' => $price * 9.35,
                'stock_quantity' => 20, 'screen_size' => $screen, 'color' => $color
            ]);
        };

        $p = Product::create([
            'category_id' => $monitorsCat->id, 'brand_id' => $asus->id, 'series_id' => $seriesROG->id,
            'name' => 'ROG Strix OLED XG27AQDMESZ', 'slug' => 'rog-strix-oled-xg27aqdmesz', 'sku' => 'ASUS-XG27',
            'description' => '27-inch 1440p OLED gaming monitor.', 'status' => 'active', 'stock' => 40
        ]);
        $p->attributeValues()->attach([$valGaming->id]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/ROG%20STRIX/ROG%20Strix%20OLED%20XG27AQDMESZ.png', 'sort_order' => 1]);
        $createMonitorVariant($p, 'XG27AQDMESZ', 899, 27.0, 'Black');

        $p = Product::create([
            'category_id' => $monitorsCat->id, 'brand_id' => $samsung->id, 'series_id' => $seriesOdyssey->id,
            'name' => 'Odyssey OLED G9 49"', 'slug' => 'odyssey-oled-g9-g95sd-49', 'sku' => 'SAM-G95SD',
            'description' => '49-inch curved DQHD OLED gaming monitor.', 'status' => 'active', 'stock' => 20
        ]);
        $p->attributeValues()->attach([$valGaming->id, $valCreator->id]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/samsung/Moniteur%20Odyssey%20OLED%20G9%20G95SD%20DQHD%2049%20pouces%20.png', 'sort_order' => 1]);
        $createMonitorVariant($p, 'G95SD', 1799, 49.0, 'Silver');
    }
}
"""

with open('c:/PROJECT/FIND/backend/database/seeders/DatabaseSeeder.php', 'w') as f:
    f.write(seeder_content)
