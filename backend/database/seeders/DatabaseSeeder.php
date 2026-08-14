<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Brand;
use App\Models\Series;
use App\Models\Category;
use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductImage;
use App\Models\Collection;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Categories
        $electronics = Category::create(['name' => 'Electronics', 'slug' => 'electronics', 'sort_order' => 1]);
        $laptopsCat = Category::create(['name' => 'Laptops', 'slug' => 'laptops', 'parent_id' => $electronics->id, 'sort_order' => 10]);
        $smartphonesCat = Category::create(['name' => 'Smartphones', 'slug' => 'smartphones', 'parent_id' => $electronics->id, 'sort_order' => 20]);
        $monitorsCat = Category::create(['name' => 'Monitors', 'slug' => 'monitors', 'parent_id' => $electronics->id, 'sort_order' => 30]);

        Category::create(['name' => 'Tablets', 'slug' => 'tablets', 'parent_id' => $electronics->id, 'sort_order' => 40]);
        Category::create(['name' => 'Smartwatches', 'slug' => 'smartwatches', 'parent_id' => $electronics->id, 'sort_order' => 50]);
        Category::create(['name' => 'Audio', 'slug' => 'audio', 'parent_id' => $electronics->id, 'sort_order' => 60]);
        $accessoriesCat = Category::create(['name' => 'Accessories', 'slug' => 'accessories', 'parent_id' => $electronics->id, 'sort_order' => 70]);
        Category::create(['name' => 'Gaming', 'slug' => 'gaming', 'parent_id' => $electronics->id, 'sort_order' => 80]);

        // 2. Create Brands
        $apple = Brand::create(['name' => 'Apple', 'slug' => 'apple']);
        $samsung = Brand::create(['name' => 'Samsung', 'slug' => 'samsung']);
        $google = Brand::create(['name' => 'Google', 'slug' => 'google']);
        $lenovo = Brand::create(['name' => 'Lenovo', 'slug' => 'lenovo']);
        $dell = Brand::create(['name' => 'Dell', 'slug' => 'dell']);
        $asus = Brand::create(['name' => 'ASUS', 'slug' => 'asus']);

        // Granular Series (Product Families)
        $seriesMBP14 = Series::create(['brand_id' => $apple->id, 'name' => 'MacBook Pro 14"', 'slug' => 'macbook-pro-14']);
        $seriesMBP16 = Series::create(['brand_id' => $apple->id, 'name' => 'MacBook Pro 16"', 'slug' => 'macbook-pro-16']);
        $seriesMBA13 = Series::create(['brand_id' => $apple->id, 'name' => 'MacBook Air 13"', 'slug' => 'macbook-air-13']);

        $seriesIP16P = Series::create(['brand_id' => $apple->id, 'name' => 'iPhone 16 Plus', 'slug' => 'iphone-16-plus']);
        $seriesIPAir = Series::create(['brand_id' => $apple->id, 'name' => 'iPhone Air', 'slug' => 'iphone-air']);
        $seriesIP17 = Series::create(['brand_id' => $apple->id, 'name' => 'iPhone 17', 'slug' => 'iphone-17']);
        $seriesIP17P = Series::create(['brand_id' => $apple->id, 'name' => 'iPhone 17 Pro', 'slug' => 'iphone-17-pro']);
        $seriesIP17PM = Series::create(['brand_id' => $apple->id, 'name' => 'iPhone 17 Pro Max', 'slug' => 'iphone-17-pro-max']);

        $seriesGS25U = Series::create(['brand_id' => $samsung->id, 'name' => 'Galaxy S25 Ultra', 'slug' => 'galaxy-s25-ultra']);
        $seriesGS26U = Series::create(['brand_id' => $samsung->id, 'name' => 'Galaxy S26 Ultra', 'slug' => 'galaxy-s26-ultra']);
        $seriesGS26 = Series::create(['brand_id' => $samsung->id, 'name' => 'Galaxy S26', 'slug' => 'galaxy-s26']);
        $seriesGS26P = Series::create(['brand_id' => $samsung->id, 'name' => 'Galaxy S26 Plus', 'slug' => 'galaxy-s26-plus']);
        $seriesGZF6 = Series::create(['brand_id' => $samsung->id, 'name' => 'Galaxy Z Fold 6', 'slug' => 'galaxy-z-fold-6']);

        $seriesP10P = Series::create(['brand_id' => $google->id, 'name' => 'Pixel 10 Pro', 'slug' => 'pixel-10-pro']);
        $seriesP10PXL = Series::create(['brand_id' => $google->id, 'name' => 'Pixel 10 Pro XL', 'slug' => 'pixel-10-pro-xl']);

        $seriesTPX1 = Series::create(['brand_id' => $lenovo->id, 'name' => 'ThinkPad X1 Carbon', 'slug' => 'thinkpad-x1-carbon']);
        $seriesXPS15 = Series::create(['brand_id' => $dell->id, 'name' => 'XPS 15', 'slug' => 'xps-15']);
        
        $seriesROG = Series::create(['brand_id' => $asus->id, 'name' => 'ROG Monitors', 'slug' => 'rog-monitors']);
        $seriesOdyssey = Series::create(['brand_id' => $samsung->id, 'name' => 'Odyssey Monitors', 'slug' => 'odyssey-monitors']);

        // 3. Create Attributes
        $attrOS = Attribute::create(['name' => 'OS', 'slug' => 'os']);
        $attrUsage = Attribute::create(['name' => 'Usage', 'slug' => 'usage']);

        $valMacOs = AttributeValue::firstOrCreate(['attribute_id' => $attrOS->id, 'value' => 'macOS']);
        $valIOS = AttributeValue::firstOrCreate(['attribute_id' => $attrOS->id, 'value' => 'iOS']);
        $valAndroid = AttributeValue::firstOrCreate(['attribute_id' => $attrOS->id, 'value' => 'Android']);
        $valWindows = AttributeValue::firstOrCreate(['attribute_id' => $attrOS->id, 'value' => 'Windows 11']);
        
        $valGaming = AttributeValue::firstOrCreate(['attribute_id' => $attrUsage->id, 'value' => 'Gaming']);
        $valBusiness = AttributeValue::firstOrCreate(['attribute_id' => $attrUsage->id, 'value' => 'Business']);
        $valCreator = AttributeValue::firstOrCreate(['attribute_id' => $attrUsage->id, 'value' => 'Creator']);

        // 4. Create Collections
        $colFeatured = Collection::create(['name' => 'Featured', 'slug' => 'featured', 'is_featured' => true]);
        $colNewArrivals = Collection::create(['name' => 'New Arrivals', 'slug' => 'new-arrivals', 'is_featured' => true]);
        $colBestSellers = Collection::create(['name' => 'Best Sellers', 'slug' => 'best-sellers']);
        $colPremium = Collection::create(['name' => 'Premium', 'slug' => 'premium']);

        // =====================================================================
        // 5. HELPER: Create an Independent Product Configuration
        // =====================================================================
        $createProductConfig = function ($baseName, $baseSku, $series, $category, $brand, $processor, $ram, $storage, $price, $screen, $colors, $images, $attrs, $collections, $desc) {
            
            // Clean up processor name for the title (e.g. M3 Max 30-core -> M3 Max)
            $procTitle = $processor ? preg_replace('/ \(.*?\)/', '', $processor) : '';
            $productName = trim("{$brand->name} {$baseName} {$procTitle}");

            // Generate strict SKU suffix
            $slugSuffix = '';
            if ($processor) $slugSuffix .= '-' . Str::slug($processor);
            if ($ram) $slugSuffix .= "-{$ram}gb";
            if ($storage) $slugSuffix .= "-{$storage}gb";
            
            $slug = Str::slug($baseName) . $slugSuffix;

            $p = Product::create([
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'series_id' => $series->id,
                'name' => $productName,
                'slug' => $slug,
                'sku' => strtoupper($baseSku . '-' . Str::slug($slugSuffix, '')),
                'description' => $desc,
                'status' => 'active',
                'stock' => 0
            ]);

            $p->attributeValues()->attach($attrs);
            $p->collections()->attach($collections);

            foreach ($images as $index => $imgUrl) {
                ProductImage::create(['product_id' => $p->id, 'url' => $imgUrl, 'sort_order' => $index + 1]);
            }

            $totalStock = 0;
            
            foreach ($colors as $index => $color) {
                $words = explode(' ', trim(preg_replace('/[^a-zA-Z0-9 ]/', '', $color)));
                if (count($words) >= 2) {
                    $colorCode = strtoupper(substr($words[0], 0, 1) . substr($words[1], 0, 2));
                } else {
                    $colorCode = strtoupper(substr($words[0] ?? 'COL', 0, 3));
                }
                $variantSku = $p->sku . '-' . $colorCode;
                
                // Realistic random stock based on price point
                if ($price > 40000) $stock = rand(1, 4);
                elseif ($price > 25000) $stock = rand(3, 9);
                elseif ($price > 15000) $stock = rand(6, 18);
                else $stock = rand(12, 31);
                
                // Simulate occasional out-of-stock colors
                if ($index > 0 && rand(1, 10) <= 2) { 
                    $stock = 0;
                }

                ProductVariant::create([
                    'product_id' => $p->id,
                    'sku' => $variantSku,
                    'price' => $price,
                    'stock_quantity' => $stock,
                    'ram_gb' => $ram,
                    'storage_gb' => $storage,
                    'screen_size' => $screen,
                    'color' => $color,
                    'processor' => $processor
                ]);
                
                $totalStock += $stock;
            }
            
            $p->update(['stock' => $totalStock]);
        };

        // =================================================================
        // --- CURATED LAPTOP CATALOG (66 Products) ---
        // =================================================================
        $mbp14Images = ['/images/products/laptops/MacBook pro/black mac pro 14.png', '/images/products/laptops/MacBook pro/silver mac pro 14.png'];
        $mbp16Images = ['/images/products/laptops/MacBook pro/black mac pro 16.png', '/images/products/laptops/MacBook pro/silver mac pro 16.png'];
        $mbaImages = ['/images/products/laptops/MacBook Air/midnight air 13.png', '/images/products/laptops/MacBook Air/starlight air 13.png', '/images/products/laptops/MacBook Air/silver air 13.png', '/images/products/laptops/MacBook Air/skyblue air 13.png'];
        $xps13Images = ['/images/products/laptops/DELL/WHITE XPS13.png'];
        $xps14Images = ['/images/products/laptops/DELL/BLACK XPS 14.png', '/images/products/laptops/DELL/WHITE XPS 14.png'];
        $xps16Images = ['/images/products/laptops/DELL/WHITE XPS 16.png'];
        $alienwareM15Images = ['/images/products/laptops/DELL/alienware m15.png'];
        $tpImages = ['/images/products/laptops/Lenovo/ThinkPad X1 Carbon.png'];

        $mbColors = ['Space Black', 'Silver'];
        $mbaColors = ['Midnight', 'Starlight', 'Silver', 'Skyblue'];
        $xpsColors = ['Black', 'White'];
        $xps13Colors = ['White'];
        $xps16Colors = ['White'];
        $alienwareColors = ['Dark Side of the Moon'];
        
        $laptopsToSeed = [
            // MacBook Air 13" (M3)
            ['MacBook Air 13"', 'APP-MBA13', $seriesMBA13, $apple, 'M3', 8, 256, 12990, 13.6, $mbaColors, $mbaImages],
            ['MacBook Air 13"', 'APP-MBA13', $seriesMBA13, $apple, 'M3', 16, 512, 15490, 13.6, $mbaColors, $mbaImages],
            ['MacBook Air 13"', 'APP-MBA13', $seriesMBA13, $apple, 'M3', 24, 1024, 19990, 13.6, $mbaColors, $mbaImages],
            // MacBook Air 15" (M3)
            ['MacBook Air 15"', 'APP-MBA15', $seriesMBA13, $apple, 'M3', 8, 256, 14990, 15.3, $mbaColors, $mbaImages],
            ['MacBook Air 15"', 'APP-MBA15', $seriesMBA13, $apple, 'M3', 16, 512, 17990, 15.3, $mbaColors, $mbaImages],
            ['MacBook Air 15"', 'APP-MBA15', $seriesMBA13, $apple, 'M3', 24, 1024, 21490, 15.3, $mbaColors, $mbaImages],
            // MacBook Pro 14" M3
            ['MacBook Pro 14"', 'APP-MBP14', $seriesMBP14, $apple, 'M3 Pro', 18, 512, 22490, 14.2, $mbColors, $mbp14Images],
            ['MacBook Pro 14"', 'APP-MBP14', $seriesMBP14, $apple, 'M3 Pro', 18, 1024, 24990, 14.2, $mbColors, $mbp14Images],
            ['MacBook Pro 14"', 'APP-MBP14', $seriesMBP14, $apple, 'M3 Pro', 36, 1024, 28990, 14.2, $mbColors, $mbp14Images],
            ['MacBook Pro 14"', 'APP-MBP14', $seriesMBP14, $apple, 'M3 Max 30-core', 36, 1024, 34990, 14.2, $mbColors, $mbp14Images],
            // MacBook Pro 16" M3
            ['MacBook Pro 16"', 'APP-MBP16', $seriesMBP16, $apple, 'M3 Pro', 18, 512, 26990, 16.2, $mbColors, $mbp16Images],
            ['MacBook Pro 16"', 'APP-MBP16', $seriesMBP16, $apple, 'M3 Pro', 36, 1024, 32990, 16.2, $mbColors, $mbp16Images],
            ['MacBook Pro 16"', 'APP-MBP16', $seriesMBP16, $apple, 'M3 Max 30-core', 36, 1024, 37990, 16.2, $mbColors, $mbp16Images],
            ['MacBook Pro 16"', 'APP-MBP16', $seriesMBP16, $apple, 'M3 Max 40-core', 48, 1024, 44990, 16.2, $mbColors, $mbp16Images],
            ['MacBook Pro 16"', 'APP-MBP16', $seriesMBP16, $apple, 'M3 Max 40-core', 128, 4096, 75990, 16.2, $mbColors, $mbp16Images],
            // MacBook Pro 14" M4
            ['MacBook Pro 14"', 'APP-MBP14', $seriesMBP14, $apple, 'M4 Pro', 24, 512, 23490, 14.2, $mbColors, $mbp14Images],
            ['MacBook Pro 14"', 'APP-MBP14', $seriesMBP14, $apple, 'M4 Pro', 24, 1024, 25990, 14.2, $mbColors, $mbp14Images],
            ['MacBook Pro 14"', 'APP-MBP14', $seriesMBP14, $apple, 'M4 Pro', 48, 1024, 29990, 14.2, $mbColors, $mbp14Images],
            ['MacBook Pro 14"', 'APP-MBP14', $seriesMBP14, $apple, 'M4 Pro', 48, 2048, 34990, 14.2, $mbColors, $mbp14Images],
            ['MacBook Pro 14"', 'APP-MBP14', $seriesMBP14, $apple, 'M4 Max 32-core', 36, 1024, 36990, 14.2, $mbColors, $mbp14Images],
            ['MacBook Pro 14"', 'APP-MBP14', $seriesMBP14, $apple, 'M4 Max 40-core', 64, 2048, 48990, 14.2, $mbColors, $mbp14Images],
            // MacBook Pro 16" M4
            ['MacBook Pro 16"', 'APP-MBP16', $seriesMBP16, $apple, 'M4 Pro', 24, 512, 27990, 16.2, $mbColors, $mbp16Images],
            ['MacBook Pro 16"', 'APP-MBP16', $seriesMBP16, $apple, 'M4 Pro', 48, 1024, 33990, 16.2, $mbColors, $mbp16Images],
            ['MacBook Pro 16"', 'APP-MBP16', $seriesMBP16, $apple, 'M4 Max 32-core', 36, 1024, 39990, 16.2, $mbColors, $mbp16Images],
            ['MacBook Pro 16"', 'APP-MBP16', $seriesMBP16, $apple, 'M4 Max 40-core', 48, 1024, 46990, 16.2, $mbColors, $mbp16Images],
            ['MacBook Pro 16"', 'APP-MBP16', $seriesMBP16, $apple, 'M4 Max 40-core', 64, 2048, 54990, 16.2, $mbColors, $mbp16Images],
            ['MacBook Pro 16"', 'APP-MBP16', $seriesMBP16, $apple, 'M4 Max 40-core', 128, 4096, 77990, 16.2, $mbColors, $mbp16Images],
            // MacBook Pro 14" M5
            ['MacBook Pro 14"', 'APP-MBP14', $seriesMBP14, $apple, 'M5 Pro', 24, 1024, 27990, 14.2, $mbColors, $mbp14Images],
            ['MacBook Pro 14"', 'APP-MBP14', $seriesMBP14, $apple, 'M5 Pro', 48, 1024, 31990, 14.2, $mbColors, $mbp14Images],
            ['MacBook Pro 14"', 'APP-MBP14', $seriesMBP14, $apple, 'M5 Pro', 64, 2048, 38990, 14.2, $mbColors, $mbp14Images],
            ['MacBook Pro 14"', 'APP-MBP14', $seriesMBP14, $apple, 'M5 Max 32-core', 36, 2048, 42990, 14.2, $mbColors, $mbp14Images],
            ['MacBook Pro 14"', 'APP-MBP14', $seriesMBP14, $apple, 'M5 Max 40-core', 48, 2048, 49990, 14.2, $mbColors, $mbp14Images],
            ['MacBook Pro 14"', 'APP-MBP14', $seriesMBP14, $apple, 'M5 Max 40-core', 128, 4096, 78990, 14.2, $mbColors, $mbp14Images],
            // MacBook Pro 16" M5
            ['MacBook Pro 16"', 'APP-MBP16', $seriesMBP16, $apple, 'M5 Pro', 24, 1024, 31990, 16.2, $mbColors, $mbp16Images],
            ['MacBook Pro 16"', 'APP-MBP16', $seriesMBP16, $apple, 'M5 Pro', 48, 2048, 39990, 16.2, $mbColors, $mbp16Images],
            ['MacBook Pro 16"', 'APP-MBP16', $seriesMBP16, $apple, 'M5 Max 32-core', 36, 2048, 44990, 16.2, $mbColors, $mbp16Images],
            ['MacBook Pro 16"', 'APP-MBP16', $seriesMBP16, $apple, 'M5 Max 40-core', 48, 2048, 51990, 16.2, $mbColors, $mbp16Images],
            ['MacBook Pro 16"', 'APP-MBP16', $seriesMBP16, $apple, 'M5 Max 40-core', 64, 4096, 62990, 16.2, $mbColors, $mbp16Images],
            ['MacBook Pro 16"', 'APP-MBP16', $seriesMBP16, $apple, 'M5 Max 40-core', 128, 8192, 89990, 16.2, $mbColors, $mbp16Images],
            // Dell XPS 13
            ['XPS 13', 'DEL-XPS13', $seriesXPS15, $dell, 'Core Ultra 5', 16, 512, 14490, 13.4, $xps13Colors, $xps13Images],
            ['XPS 13', 'DEL-XPS13', $seriesXPS15, $dell, 'Core Ultra 7', 16, 512, 16990, 13.4, $xps13Colors, $xps13Images],
            ['XPS 13', 'DEL-XPS13', $seriesXPS15, $dell, 'Core Ultra 7', 16, 1024, 18990, 13.4, $xps13Colors, $xps13Images],
            ['XPS 13', 'DEL-XPS13', $seriesXPS15, $dell, 'Core Ultra 7', 32, 1024, 21990, 13.4, $xps13Colors, $xps13Images],
            ['XPS 13', 'DEL-XPS13', $seriesXPS15, $dell, 'Core Ultra 7', 64, 2048, 27990, 13.4, $xps13Colors, $xps13Images],
            // Dell XPS 14
            ['XPS 14', 'DEL-XPS14', $seriesXPS15, $dell, 'Core Ultra 7', 16, 512, 18490, 14.5, $xpsColors, $xps14Images],
            ['XPS 14', 'DEL-XPS14', $seriesXPS15, $dell, 'Core Ultra 7', 32, 1024, 23490, 14.5, $xpsColors, $xps14Images],
            ['XPS 14', 'DEL-XPS14', $seriesXPS15, $dell, 'Core Ultra 7', 64, 2048, 29490, 14.5, $xpsColors, $xps14Images],
            ['XPS 14', 'DEL-XPS14', $seriesXPS15, $dell, 'Core Ultra 9', 32, 1024, 26990, 14.5, $xpsColors, $xps14Images],
            ['XPS 14', 'DEL-XPS14', $seriesXPS15, $dell, 'Core Ultra 9', 64, 2048, 32990, 14.5, $xpsColors, $xps14Images],
            // Dell XPS 16
            ['XPS 16', 'DEL-XPS16', $seriesXPS15, $dell, 'Core Ultra 7', 16, 512, 20990, 16.3, $xps16Colors, $xps16Images],
            ['XPS 16', 'DEL-XPS16', $seriesXPS15, $dell, 'Core Ultra 7', 32, 1024, 25990, 16.3, $xps16Colors, $xps16Images],
            ['XPS 16', 'DEL-XPS16', $seriesXPS15, $dell, 'Core Ultra 7', 64, 2048, 31990, 16.3, $xps16Colors, $xps16Images],
            ['XPS 16', 'DEL-XPS16', $seriesXPS15, $dell, 'Core Ultra 9', 32, 1024, 28990, 16.3, $xps16Colors, $xps16Images],
            ['XPS 16', 'DEL-XPS16', $seriesXPS15, $dell, 'Core Ultra 9', 64, 2048, 34990, 16.3, $xps16Colors, $xps16Images],
            ['XPS 16', 'DEL-XPS16', $seriesXPS15, $dell, 'Core Ultra 9', 64, 4096, 38990, 16.3, $xps16Colors, $xps16Images],
            ['XPS 16', 'DEL-XPS16', $seriesXPS15, $dell, 'Core Ultra 9', 96, 4096, 45990, 16.3, $xps16Colors, $xps16Images],
            // Dell Alienware m15
            ['Alienware m15', 'DEL-AM15', $seriesXPS15, $dell, 'Core i7', 16, 1024, 19490, 15.6, $alienwareColors, $alienwareM15Images],
            ['Alienware m15', 'DEL-AM15', $seriesXPS15, $dell, 'Core i7', 32, 1024, 21990, 15.6, $alienwareColors, $alienwareM15Images],
            ['Alienware m15', 'DEL-AM15', $seriesXPS15, $dell, 'Core i9', 32, 1024, 25490, 15.6, $alienwareColors, $alienwareM15Images],
            ['Alienware m15', 'DEL-AM15', $seriesXPS15, $dell, 'Core i9', 64, 2048, 31990, 15.6, $alienwareColors, $alienwareM15Images],
            ['Alienware m15', 'DEL-AM15', $seriesXPS15, $dell, 'Core i9', 64, 4096, 35990, 15.6, $alienwareColors, $alienwareM15Images],
            // Lenovo ThinkPad X1 Carbon
            ['ThinkPad X1 Carbon', 'LEN-TPX1', $seriesTPX1, $lenovo, 'Core Ultra 5', 16, 512, 17490, 14.0, ['Black'], $tpImages],
            ['ThinkPad X1 Carbon', 'LEN-TPX1', $seriesTPX1, $lenovo, 'Core Ultra 5', 16, 1024, 19490, 14.0, ['Black'], $tpImages],
            ['ThinkPad X1 Carbon', 'LEN-TPX1', $seriesTPX1, $lenovo, 'Core Ultra 7', 16, 1024, 22490, 14.0, ['Black'], $tpImages],
            ['ThinkPad X1 Carbon', 'LEN-TPX1', $seriesTPX1, $lenovo, 'Core Ultra 7', 32, 1024, 25490, 14.0, ['Black'], $tpImages],
            ['ThinkPad X1 Carbon', 'LEN-TPX1', $seriesTPX1, $lenovo, 'Core Ultra 7', 32, 2048, 29990, 14.0, ['Black'], $tpImages],
        ];

        foreach ($laptopsToSeed as $l) {
            $attrs = $l[3]->name === 'Apple' ? [$valMacOs->id, $valCreator->id, $valBusiness->id] : [$valWindows->id, $valBusiness->id];
            $createProductConfig($l[0], $l[1], $l[2], $laptopsCat, $l[3], $l[4], $l[5], $l[6], $l[7], $l[8], $l[9], $l[10], $attrs, [$colFeatured->id], 'Premium performance laptop.');
        }


        // =================================================================
        // --- IPHONES ---
        // =================================================================
        $ip17pmImages = ['/images/products/phones/IPHONES/17 pro max intense blue.png', '/images/products/phones/IPHONES/17 pro max orange.png', '/images/products/phones/IPHONES/17 pro max silver.png'];
        $ip17pmColors = ['Intense Blue', 'Orange', 'Silver'];
        $createProductConfig('iPhone 17 Pro Max', 'APP-IP17PM', $seriesIP17PM, $smartphonesCat, $apple, null, null, 256, 14999, 6.9, $ip17pmColors, $ip17pmImages, [$valIOS->id], [$colPremium->id], '6.9-inch Super Retina XDR OLED.');
        $createProductConfig('iPhone 17 Pro Max', 'APP-IP17PM', $seriesIP17PM, $smartphonesCat, $apple, null, null, 512, 17499, 6.9, $ip17pmColors, $ip17pmImages, [$valIOS->id], [$colPremium->id], '6.9-inch Super Retina XDR OLED.');
        $createProductConfig('iPhone 17 Pro Max', 'APP-IP17PM', $seriesIP17PM, $smartphonesCat, $apple, null, null, 1024, 19999, 6.9, $ip17pmColors, $ip17pmImages, [$valIOS->id], [$colPremium->id], '6.9-inch Super Retina XDR OLED.');

        $ip17pImages = ['/images/products/phones/IPHONES/17 bro blue intense.png', '/images/products/phones/IPHONES/17 pro orange.png', '/images/products/phones/IPHONES/17 pro silver.png'];
        $ip17pColors = ['Blue Intense', 'Orange', 'Silver'];
        $createProductConfig('iPhone 17 Pro', 'APP-IP17P', $seriesIP17P, $smartphonesCat, $apple, null, null, 256, 12999, 6.3, $ip17pColors, $ip17pImages, [$valIOS->id], [$colBestSellers->id], 'Pro level power in your pocket.');
        $createProductConfig('iPhone 17 Pro', 'APP-IP17P', $seriesIP17P, $smartphonesCat, $apple, null, null, 512, 14999, 6.3, $ip17pColors, $ip17pImages, [$valIOS->id], [$colBestSellers->id], 'Pro level power in your pocket.');

        // =================================================================
        // --- SAMSUNG PHONES ---
        // =================================================================
        $s26uImages = [
            '/images/products/phones/samsung/s26 ultra black.png',
            '/images/products/phones/samsung/s26 ultra cobalt violet.png',
            '/images/products/phones/samsung/s26 ultra pink gold.png',
            '/images/products/phones/samsung/s26 ultra silver.png',
            '/images/products/phones/samsung/s26 ultra sky blue.png',
            '/images/products/phones/samsung/s26 ultra white.png'
        ];
        $s26uColors = ['Black', 'Cobalt Violet', 'Pink Gold', 'Silver', 'Sky Blue', 'White'];
        $createProductConfig('Galaxy S26 Ultra', 'SAM-S26U', $seriesGS26U, $smartphonesCat, $samsung, null, null, 256, 13999, 6.8, $s26uColors, $s26uImages, [$valAndroid->id], [$colPremium->id], 'The ultimate flagship.');
        $createProductConfig('Galaxy S26 Ultra', 'SAM-S26U', $seriesGS26U, $smartphonesCat, $samsung, null, null, 512, 15599, 6.8, $s26uColors, $s26uImages, [$valAndroid->id], [$colPremium->id], 'The ultimate flagship.');
        $createProductConfig('Galaxy S26 Ultra', 'SAM-S26U', $seriesGS26U, $smartphonesCat, $samsung, null, null, 1024, 16999, 6.8, $s26uColors, $s26uImages, [$valAndroid->id], [$colPremium->id], 'The ultimate flagship.');

        $s25uImages = [
            '/images/products/phones/samsung/s25 ultra titanium black.png',
            '/images/products/phones/samsung/s25 ultra titanium gold.png',
            '/images/products/phones/samsung/s25 ultra titanium silver blue.png',
            '/images/products/phones/samsung/s25 ultra titanium white silver.png'
        ];
        $s25uColors = ['Titanium Black', 'Titanium Gold', 'Titanium Silver Blue', 'Titanium White Silver'];
        $createProductConfig('Galaxy S25 Ultra', 'SAM-S25U', $seriesGS25U, $smartphonesCat, $samsung, null, null, 256, 12999, 6.8, $s25uColors, $s25uImages, [$valAndroid->id], [], 'The previous flagship king.');

        $s26Images = [
            '/images/products/phones/samsung/s26 black.png',
            '/images/products/phones/samsung/s26 skyblue.png',
            '/images/products/phones/samsung/s26 violet.png',
            '/images/products/phones/samsung/s26 white.png'
        ];
        $s26Colors = ['Black', 'Skyblue', 'Violet', 'White'];
        $createProductConfig('Galaxy S26', 'SAM-S26', $seriesGS26, $smartphonesCat, $samsung, null, null, 128, 9499, 6.2, $s26Colors, $s26Images, [$valAndroid->id], [], 'Compact flagship power.');

        $s26pImages = [
            '/images/products/phones/samsung/s26 plus black.png',
            '/images/products/phones/samsung/s26 plus skyblue.png',
            '/images/products/phones/samsung/s26 plus violet.png',
            '/images/products/phones/samsung/s26 plus white.png'
        ];
        $createProductConfig('Galaxy S26 Plus', 'SAM-S26P', $seriesGS26P, $smartphonesCat, $samsung, null, null, 256, 10999, 6.7, $s26Colors, $s26pImages, [$valAndroid->id], [], 'Big screen flagship power.');

        $zf6Images = [
            '/images/products/phones/samsung/z fold 6 navy (folded).png',
            '/images/products/phones/samsung/z fold 6 pink (folded).png',
            '/images/products/phones/samsung/z fold 6 silver shadow (folded).png'
        ];
        $zf6Colors = ['Navy', 'Pink', 'Silver Shadow'];
        $createProductConfig('Galaxy Z Fold 6', 'SAM-ZF6', $seriesGZF6, $smartphonesCat, $samsung, null, null, 256, 18999, 7.6, $zf6Colors, $zf6Images, [$valAndroid->id], [$colPremium->id], 'Unfold your world.');

        // =================================================================
        // --- GOOGLE PHONES ---
        // =================================================================
        $p10pImages = [
            '/images/products/phones/GOOGLE/pixel 10 pro jade.png',
            '/images/products/phones/GOOGLE/pixel 10 pro moonstone.png',
            '/images/products/phones/GOOGLE/pixel 10 pro porcelain.png'
        ];
        $p10pColors = ['Jade', 'Moonstone', 'Porcelain'];
        $createProductConfig('Pixel 10 Pro', 'GOO-P10P', $seriesP10P, $smartphonesCat, $google, 'Tensor G5', null, 256, 10999, 6.3, $p10pColors, $p10pImages, [$valAndroid->id], [], 'Pro-level AI features.');

        $p10pxlImages = [
            '/images/products/phones/GOOGLE/pixel 10 pro xl jade.png',
            '/images/products/phones/GOOGLE/pixel 10 pro xl moonstone.png',
            '/images/products/phones/GOOGLE/pixel 10 pro xl porcelain.png'
        ];
        $createProductConfig('Pixel 10 Pro XL', 'GOO-P10PXL', $seriesP10PXL, $smartphonesCat, $google, 'Tensor G5', null, 256, 11999, 6.8, $p10pColors, $p10pxlImages, [$valAndroid->id], [$colPremium->id], 'Large pro-level AI features.');

        // =================================================================
        // --- APPLE IPHONES (MORE) ---
        // =================================================================
        $ip16pImages = [
            '/images/products/phones/IPHONES/16 plus black.png',
            '/images/products/phones/IPHONES/16 plus teal.png',
            '/images/products/phones/IPHONES/16 plus ultramarine.png',
            '/images/products/phones/IPHONES/16 plus white.png'
        ];
        $ip16pColors = ['Black', 'Teal', 'Ultramarine', 'White'];
        $createProductConfig('iPhone 16 Plus', 'APP-IP16P', $seriesIP16P, $smartphonesCat, $apple, null, null, 128, 9999, 6.7, $ip16pColors, $ip16pImages, [$valIOS->id], [], 'Supersized iPhone.');
        
        $ip17Images = [
            '/images/products/phones/IPHONES/17 black.png',
            '/images/products/phones/IPHONES/17 lavender.png',
            '/images/products/phones/IPHONES/17 mist blue.png',
            '/images/products/phones/IPHONES/17 sage.png',
            '/images/products/phones/IPHONES/17 white.png'
        ];
        $ip17Colors = ['Black', 'Lavender', 'Mist Blue', 'Sage', 'White'];
        $createProductConfig('iPhone 17', 'APP-IP17', $seriesIP17, $smartphonesCat, $apple, null, null, 128, 8999, 6.1, $ip17Colors, $ip17Images, [$valIOS->id], [], 'The baseline for exceptional.');

        $ipAirImages = [
            '/images/products/phones/IPHONES/air cloud white.png',
            '/images/products/phones/IPHONES/air light gold.png',
            '/images/products/phones/IPHONES/air skyblue.png',
            '/images/products/phones/IPHONES/air spaceblack.png'
        ];
        $ipAirColors = ['Cloud White', 'Light Gold', 'Skyblue', 'Space Black'];
        $createProductConfig('iPhone Air', 'APP-IPAIR', $seriesIPAir, $smartphonesCat, $apple, null, null, 256, 10999, 6.6, $ipAirColors, $ipAirImages, [$valIOS->id], [], 'Incredibly thin and light.');

        // =================================================================
        // --- MONITORS ---
        // =================================================================
        $xg27aqdmeszImages = [
            '/images/products/monitors/ROG STRIX/ROG Strix OLED XG27AQDMESZ.png',
            '/images/products/monitors/ROG STRIX/ROG Strix OLED XG27AQDMESZ side.png',
            '/images/products/monitors/ROG STRIX/ROG Strix OLED XG27AQDMESZ back.png'
        ];
        $createProductConfig('ROG Strix OLED XG27AQDMESZ', 'ASUS-XG27A', $seriesROG, $monitorsCat, $asus, null, null, null, 11490, 27.0, ['Black'], $xg27aqdmeszImages, [$valGaming->id], [], '27-inch QHD OLED gaming monitor.');

        $xg27ucgwImages = [
            '/images/products/monitors/ROG STRIX/ROG Strix XG27UCG-W Gen2 (XG27UCGR-W).png',
            '/images/products/monitors/ROG STRIX/ROG Strix XG27UCG-W Gen2 (XG27UCGR-W) side.png',
            '/images/products/monitors/ROG STRIX/ROG Strix XG27UCG-W Gen2 (XG27UCGR-W) back.png'
        ];
        $createProductConfig('ROG Strix XG27UCG-W Gen2', 'ASUS-XG27W', $seriesROG, $monitorsCat, $asus, null, null, null, 8990, 27.0, ['White'], $xg27ucgwImages, [$valGaming->id], [], '27-inch 4K UHD white gaming monitor.');

        $pg32ucwmImages = [
            '/images/products/monitors/ROG STRIX/ROG Swift OLED PG32UCWM.png',
            '/images/products/monitors/ROG STRIX/ROG Swift OLED PG32UCWM double.png',
            '/images/products/monitors/ROG STRIX/ROG Swift OLED PG32UCWM back.png'
        ];
        $createProductConfig('ROG Swift OLED PG32UCWM', 'ASUS-PG32', $seriesROG, $monitorsCat, $asus, null, null, null, 16990, 32.0, ['Black'], $pg32ucwmImages, [$valGaming->id, $valCreator->id], [$colPremium->id], '32-inch 4K OLED gaming monitor.');

        $g60Images = [
            '/images/products/monitors/samsung/Moniteur gaming QHD Odyssey OLED G6 G60SF 500Hz 32 pouces.png',
            '/images/products/monitors/samsung/Moniteur gaming QHD Odyssey OLED G6 G60SF 500Hz 32 pouces (side).png',
            '/images/products/monitors/samsung/Moniteur gaming QHD Odyssey OLED G6 G60SF 500Hz 32 pouces (back side).png'
        ];
        $createProductConfig('Odyssey OLED G6 G60SF 32"', 'SAM-G60', $seriesOdyssey, $monitorsCat, $samsung, null, null, null, 12990, 32.0, ['Silver'], $g60Images, [$valGaming->id], [], '32-inch QHD OLED gaming monitor.');

        $createProductConfig('Odyssey OLED G9 49"', 'SAM-G95SD', $seriesOdyssey, $monitorsCat, $samsung, null, null, null, 15990, 49.0, ['Silver'], ['/images/products/monitors/samsung/Moniteur Odyssey OLED G9 G95SD DQHD 49 pouces .png', '/images/products/monitors/samsung/Moniteur Odyssey OLED G9 G95SD DQHD 49 pouces side .png', '/images/products/monitors/samsung/Moniteur Odyssey OLED G9 G95SD DQHD 49 pouces back.png'], [$valGaming->id], [$colPremium->id], '49-inch curved DQHD OLED gaming monitor.');
        $createProductConfig('Odyssey OLED G8 27"', 'SAM-G81', $seriesOdyssey, $monitorsCat, $samsung, null, null, null, 10490, 27.0, ['Silver'], ['/images/products/monitors/samsung/Moniteur gaming 4K Odyssey OLED G8 G81SF 27 pouces.png', '/images/products/monitors/samsung/Moniteur gaming 4K Odyssey OLED G8 G81SF 27 pouces side.png', '/images/products/monitors/samsung/Moniteur gaming 4K Odyssey OLED G8 G81SF 27 pouces (back).png'], [$valGaming->id], [], '27-inch 4K UHD OLED gaming monitor.');
    }
}
