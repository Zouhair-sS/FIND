import os

seeder_path = 'c:/PROJECT/FIND/backend/database/seeders/DatabaseSeeder.php'
with open(seeder_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the end of the file
insert_index = content.rfind('    }\n}')

missing_code = """

        // --- MISSING SMARTPHONES ---
        $p = Product::create([
            'category_id' => $smartphonesCat->id, 'brand_id' => $samsung->id, 'series_id' => $seriesGS->id,
            'name' => 'Galaxy S26', 'slug' => 'galaxy-s26', 'sku' => 'SAM-S26',
            'description' => 'The next generation of Galaxy.', 'status' => 'active', 'stock' => 200
        ]);
        $p->attributeValues()->attach([$valAndroid->id]);
        $p->collections()->attach([$colNewArrivals->id]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s26%20black.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s26%20skyblue.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s26%20violet.png', 'sort_order' => 3]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s26%20white.png', 'sort_order' => 4]);
        $createPhoneVariants($p, 'S26', [['processor'=>'Snapdragon 8 Gen 5', 'ram'=>8, 'basePrice'=>799, 'storages'=>[128=>0, 256=>60]]], 6.2, ['Black', 'Skyblue', 'Violet', 'White']);

        $p = Product::create([
            'category_id' => $smartphonesCat->id, 'brand_id' => $samsung->id, 'series_id' => $seriesGS->id,
            'name' => 'Galaxy S26 Plus', 'slug' => 'galaxy-s26-plus', 'sku' => 'SAM-S26P',
            'description' => 'More screen, more battery.', 'status' => 'active', 'stock' => 150
        ]);
        $p->attributeValues()->attach([$valAndroid->id]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s26%20plus%20black.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s26%20plus%20skyblue.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s26%20plus%20violet.png', 'sort_order' => 3]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/samsung/s26%20plus%20white.png', 'sort_order' => 4]);
        $createPhoneVariants($p, 'S26P', [['processor'=>'Snapdragon 8 Gen 5', 'ram'=>12, 'basePrice'=>999, 'storages'=>[256=>0, 512=>120]]], 6.7, ['Black', 'Skyblue', 'Violet', 'White']);

        $p = Product::create([
            'category_id' => $smartphonesCat->id, 'brand_id' => $apple->id, 'series_id' => $seriesIPhone->id,
            'name' => 'iPhone 16 Plus', 'slug' => 'iphone-16-plus', 'sku' => 'APP-IP16P',
            'description' => 'Super Retina XDR OLED display.', 'status' => 'active', 'stock' => 300
        ]);
        $p->attributeValues()->attach([$valIOS->id]);
        $p->collections()->attach([$colBestSellers->id]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/16%20plus%20black.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/16%20plus%20teal.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/16%20plus%20ultramarine.png', 'sort_order' => 3]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/16%20plus%20white.png', 'sort_order' => 4]);
        $createPhoneVariants($p, 'IP16P', [['processor'=>'A18', 'ram'=>8, 'basePrice'=>899, 'storages'=>[128=>0, 256=>100, 512=>300]]], 6.7, ['Black', 'Teal', 'Ultramarine', 'White']);

        $p = Product::create([
            'category_id' => $smartphonesCat->id, 'brand_id' => $apple->id, 'series_id' => $seriesIPhone->id,
            'name' => 'iPhone Air', 'slug' => 'iphone-air', 'sku' => 'APP-IPAIR',
            'description' => 'The thinnest iPhone ever made.', 'status' => 'active', 'stock' => 400
        ]);
        $p->attributeValues()->attach([$valIOS->id]);
        $p->collections()->attach([$colFeatured->id]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/air%20spaceblack.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/air%20cloud%20white.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/air%20light%20gold.png', 'sort_order' => 3]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/air%20skyblue.png', 'sort_order' => 4]);
        $createPhoneVariants($p, 'IPA', [['processor'=>'A19 Pro', 'ram'=>12, 'basePrice'=>999, 'storages'=>[256=>0, 512=>200]]], 6.5, ['Space Black', 'Cloud White', 'Light Gold', 'Skyblue']);

        $p = Product::create([
            'category_id' => $smartphonesCat->id, 'brand_id' => $apple->id, 'series_id' => $seriesIPhone->id,
            'name' => 'iPhone 17', 'slug' => 'iphone-17', 'sku' => 'APP-IP17',
            'description' => 'The baseline for exceptional.', 'status' => 'active', 'stock' => 500
        ]);
        $p->attributeValues()->attach([$valIOS->id]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/17%20black.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/17%20lavender.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/17%20mist%20blue.png', 'sort_order' => 3]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/17%20sage.png', 'sort_order' => 4]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/17%20white.png', 'sort_order' => 5]);
        $createPhoneVariants($p, 'IP17', [['processor'=>'A19', 'ram'=>8, 'basePrice'=>799, 'storages'=>[128=>0, 256=>100, 512=>300]]], 6.1, ['Black', 'Lavender', 'Mist Blue', 'Sage', 'White']);

        $p = Product::create([
            'category_id' => $smartphonesCat->id, 'brand_id' => $apple->id, 'series_id' => $seriesIPhone->id,
            'name' => 'iPhone 17 Pro', 'slug' => 'iphone-17-pro', 'sku' => 'APP-IP17P',
            'description' => 'Pro level power in your pocket.', 'status' => 'active', 'stock' => 400
        ]);
        $p->attributeValues()->attach([$valIOS->id]);
        $p->collections()->attach([$colBestSellers->id, $colPremium->id]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/17%20bro%20blue%20intense.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/17%20pro%20orange.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/phones/IPHONES/17%20pro%20silver.png', 'sort_order' => 3]);
        $createPhoneVariants($p, 'IP17P', [['processor'=>'A19 Pro', 'ram'=>12, 'basePrice'=>1099, 'storages'=>[256=>0, 512=>200, 1024=>400]]], 6.3, ['Blue Intense', 'Orange', 'Silver']);


        // --- MISSING MONITORS ---
        $p = Product::create([
            'category_id' => $monitorsCat->id, 'brand_id' => $asus->id, 'series_id' => $seriesROG->id,
            'name' => 'ROG Strix XG27UCG-W Gen2', 'slug' => 'rog-strix-xg27ucg-w-gen2', 'sku' => 'ASUS-XG27W',
            'description' => 'Stunning 27-inch 4K UHD white gaming monitor.', 'status' => 'active', 'stock' => 50
        ]);
        $p->attributeValues()->attach([$valGaming->id]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/ROG%20STRIX/ROG%20Strix%20XG27UCG-W%20Gen2%20(XG27UCGR-W).png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/ROG%20STRIX/ROG%20Strix%20XG27UCG-W%20Gen2%20(XG27UCGR-W)%20side.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/ROG%20STRIX/ROG%20Strix%20XG27UCG-W%20Gen2%20(XG27UCGR-W)%20back.png', 'sort_order' => 3]);
        $createMonitorVariant($p, 'XG27W', 799, 27.0, 'White');

        $p = Product::create([
            'category_id' => $monitorsCat->id, 'brand_id' => $asus->id, 'series_id' => $seriesROG->id,
            'name' => 'ROG Swift OLED PG32UCWM', 'slug' => 'rog-swift-oled-pg32ucwm', 'sku' => 'ASUS-PG32',
            'description' => '32-inch 4K OLED gaming monitor.', 'status' => 'active', 'stock' => 30
        ]);
        $p->attributeValues()->attach([$valGaming->id, $valCreator->id]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/ROG%20STRIX/ROG%20Swift%20OLED%20PG32UCWM.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/ROG%20STRIX/ROG%20Swift%20OLED%20PG32UCWM%20double.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/ROG%20STRIX/ROG%20Swift%20OLED%20PG32UCWM%20back.png', 'sort_order' => 3]);
        $createMonitorVariant($p, 'PG32', 1299, 32.0, 'Black');

        $p = Product::create([
            'category_id' => $monitorsCat->id, 'brand_id' => $samsung->id, 'series_id' => $seriesOdyssey->id,
            'name' => 'Odyssey OLED G8 G81SF 27"', 'slug' => 'odyssey-oled-g8-g81sf-27', 'sku' => 'SAM-G81',
            'description' => '27-inch 4K UHD OLED gaming monitor.', 'status' => 'active', 'stock' => 60
        ]);
        $p->attributeValues()->attach([$valGaming->id]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/samsung/Moniteur%20gaming%204K%20Odyssey%20OLED%20G8%20G81SF%2027%20pouces.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/samsung/Moniteur%20gaming%204K%20Odyssey%20OLED%20G8%20G81SF%2027%20pouces%20side.png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/samsung/Moniteur%20gaming%204K%20Odyssey%20OLED%20G8%20G81SF%2027%20pouces%20(back).png', 'sort_order' => 3]);
        $createMonitorVariant($p, 'G81', 999, 27.0, 'Silver');

        $p = Product::create([
            'category_id' => $monitorsCat->id, 'brand_id' => $samsung->id, 'series_id' => $seriesOdyssey->id,
            'name' => 'Odyssey OLED G6 G60SF 32"', 'slug' => 'odyssey-oled-g6-g60sf-32', 'sku' => 'SAM-G60',
            'description' => '32-inch QHD OLED gaming monitor.', 'status' => 'active', 'stock' => 70
        ]);
        $p->attributeValues()->attach([$valGaming->id]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/samsung/Moniteur%20gaming%20QHD%20Odyssey%20OLED%20G6%20G60SF%20500Hz%2032%20pouces.png', 'sort_order' => 1]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/samsung/Moniteur%20gaming%20QHD%20Odyssey%20OLED%20G6%20G60SF%20500Hz%2032%20pouces%20(side).png', 'sort_order' => 2]);
        ProductImage::create(['product_id' => $p->id, 'url' => '/images/products/monitors/samsung/Moniteur%20gaming%20QHD%20Odyssey%20OLED%20G6%20G60SF%20500Hz%2032%20pouces%20(back%20side).png', 'sort_order' => 3]);
        $createMonitorVariant($p, 'G60', 899, 32.0, 'Silver');

"""

new_content = content[:insert_index] + missing_code + content[insert_index:]
with open(seeder_path, 'w', encoding='utf-8') as f:
    f.write(new_content)
