import re
import os

with open("c:\\PROJECT\\FIND\\backend\\database\\seeders\\DatabaseSeeder.php", "r") as f:
    content = f.read()

# Replace the createVariants helper with an advanced one
new_helper = """        $createVariants = function ($product, $skuPrefix, $configs, $screen, $colors) {
            foreach ($configs as $cfg) {
                foreach ($cfg['storages'] as $storage => $priceBump) {
                    foreach ($colors as $index => $color) {
                        $colorCode = strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $color), 0, 3)) . $index;
                        $procCode = isset($cfg['processor']) ? strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $cfg['processor']), 0, 4)) . '-' : '';
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
        };"""

content = re.sub(
    r"\$createVariants = function \(.*?\).*?};\n",
    new_helper + "\n",
    content,
    flags=re.DOTALL
)

# Update Laptops
# MBP16
mbp16_old = r"\$createVariants\(\$p, 'MBP16', 3499, 36, \[1024 => 0, 2048 => 500\], 16\.2, \['Silver', 'Space Black'\], 'Apple M3 Max'\);"
mbp16_new = """$createVariants($p, 'MBP16', [
            ['processor' => 'Apple M3 Pro', 'ram' => 18, 'basePrice' => 2499, 'storages' => [512 => 0, 1024 => 200, 2048 => 600, 4096 => 1200]],
            ['processor' => 'Apple M3 Pro', 'ram' => 36, 'basePrice' => 2899, 'storages' => [512 => 0, 1024 => 200, 2048 => 600, 4096 => 1200]],
            ['processor' => 'Apple M3 Max', 'ram' => 36, 'basePrice' => 3499, 'storages' => [1024 => 0, 2048 => 400, 4096 => 1000, 8192 => 2200]],
            ['processor' => 'Apple M3 Max', 'ram' => 48, 'basePrice' => 3999, 'storages' => [1024 => 0, 2048 => 400, 4096 => 1000, 8192 => 2200]],
            ['processor' => 'Apple M3 Max', 'ram' => 128, 'basePrice' => 4999, 'storages' => [1024 => 0, 2048 => 400, 4096 => 1000, 8192 => 2200]],
        ], 16.2, ['Silver', 'Space Black']);"""
content = re.sub(mbp16_old, mbp16_new, content)

# MBA13
mba13_old = r"\$createVariants\(\$p, 'MBA13', 1199, 16, \[512 => 0, 1024 => 400\], 13\.6, \['Midnight', 'Starlight', 'Silver', 'Skyblue'\], 'Apple M3'\);"
mba13_new = """$createVariants($p, 'MBA13', [
            ['processor' => 'Apple M3', 'ram' => 8, 'basePrice' => 1099, 'storages' => [256 => 0, 512 => 200, 1024 => 400, 2048 => 800]],
            ['processor' => 'Apple M3', 'ram' => 16, 'basePrice' => 1299, 'storages' => [256 => 0, 512 => 200, 1024 => 400, 2048 => 800]],
            ['processor' => 'Apple M3', 'ram' => 24, 'basePrice' => 1499, 'storages' => [256 => 0, 512 => 200, 1024 => 400, 2048 => 800]],
        ], 13.6, ['Midnight', 'Starlight', 'Silver', 'Skyblue']);"""
content = re.sub(mba13_old, mba13_new, content)

# ThinkPad X1
tpx1_old = r"\$createVariants\(\$p, 'TPX1', 1449, 16, \[512 => 0, 1024 => 400\], 14\.0, \['Black'\], 'Intel Core Ultra 7'\);"
tpx1_new = """$createVariants($p, 'TPX1', [
            ['processor' => 'Intel Core Ultra 5 125U', 'ram' => 16, 'basePrice' => 1349, 'storages' => [512 => 0, 1024 => 200]],
            ['processor' => 'Intel Core Ultra 7 155U', 'ram' => 16, 'basePrice' => 1549, 'storages' => [512 => 0, 1024 => 200, 2048 => 500]],
            ['processor' => 'Intel Core Ultra 7 155U', 'ram' => 32, 'basePrice' => 1749, 'storages' => [512 => 0, 1024 => 200, 2048 => 500]],
            ['processor' => 'Intel Core Ultra 7 165U', 'ram' => 64, 'basePrice' => 2149, 'storages' => [1024 => 0, 2048 => 300]],
        ], 14.0, ['Black']);"""
content = re.sub(tpx1_old, tpx1_new, content)

# Dell XPS 15
xps15_old = r"\$createVariants\(\$p, 'XPS15', 1499, 16, \[512 => 0, 1024 => 500\], 15\.6, \['Black', 'White'\], 'Intel Core i7'\);"
xps15_new = """$createVariants($p, 'XPS15', [
            ['processor' => 'Intel Core i7-13700H', 'ram' => 16, 'basePrice' => 1499, 'storages' => [512 => 0, 1024 => 150, 2048 => 350]],
            ['processor' => 'Intel Core i7-13700H', 'ram' => 32, 'basePrice' => 1649, 'storages' => [512 => 0, 1024 => 150, 2048 => 350]],
            ['processor' => 'Intel Core i9-13900H', 'ram' => 32, 'basePrice' => 1999, 'storages' => [1024 => 0, 2048 => 200, 4096 => 500]],
            ['processor' => 'Intel Core i9-13900H', 'ram' => 64, 'basePrice' => 2299, 'storages' => [1024 => 0, 2048 => 200, 4096 => 500, 8192 => 1000]],
        ], 15.6, ['Black', 'White']);"""
content = re.sub(xps15_old, xps15_new, content)

# Convert other $createVariants to use the new configs format
def replace_simple_variant(match):
    prefix = match.group(1)
    base = match.group(2)
    ram = match.group(3)
    storages = match.group(4)
    screen = match.group(5)
    colors = match.group(6)
    proc = match.group(7)
    return f"$createVariants($p, '{prefix}', [\n            ['processor' => '{proc}', 'ram' => {ram}, 'basePrice' => {base}, 'storages' => {storages}]\n        ], {screen}, {colors});"

content = re.sub(
    r"\$createVariants\(\$p, '([^']+)', ([0-9]+), ([0-9]+), (\[.*?\]), ([0-9\.]+), (\[.*?\]), '([^']+)'\);",
    replace_simple_variant,
    content
)

# Convert Monitors to use MAD (* 9.35)
def convert_monitor_price(match):
    before = match.group(1)
    price = float(match.group(2))
    after = match.group(3)
    new_price = round(price * 9.35, 2)
    return f"{before}{new_price}{after}"

content = re.sub(
    r"(ProductVariant::create\(\[.*?\'price\' => )([0-9\.]+)(,.*?\);)",
    convert_monitor_price,
    content
)

with open("c:\\PROJECT\\FIND\\backend\\database\\seeders\\DatabaseSeeder.php", "w") as f:
    f.write(content)
