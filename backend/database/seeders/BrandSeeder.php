<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Brand;
use App\Models\Series;
use App\Models\Category;
use Illuminate\Support\Str;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            'Apple', 'Samsung', 'Google', 'Lenovo', 'Dell', 'ASUS',
            'ROG Strix', 'Samsung Odyssey', 'Beats', 'Bose', 'Gigabyte',
            'HP', 'Huawei', 'JBL', 'LG', 'Logitech', 'Microsoft', 'MSI',
            'Razer', 'Sony', 'Soundcore', 'Xiaomi'
        ];

        foreach ($brands as $b) {
            Brand::firstOrCreate(
                ['slug' => Str::slug($b)],
                ['name' => $b]
            );
        }

        // Backfill category_id for existing Series
        $laptops = Category::where('name', 'Laptops')->first();
        $smartphones = Category::where('name', 'Smartphones')->first();
        $monitors = Category::where('name', 'Monitors')->first();

        if ($laptops) {
            Series::whereIn('name', ['MacBook Pro 14"', 'MacBook Pro 16"', 'MacBook Air 13"', 'ThinkPad X1 Carbon', 'XPS 15'])
                ->update(['category_id' => $laptops->id]);
        }

        if ($smartphones) {
            Series::whereIn('name', ['iPhone 16 Plus', 'iPhone Air', 'iPhone 17', 'iPhone 17 Pro', 'iPhone 17 Pro Max', 'Galaxy S25 Ultra', 'Galaxy S26 Ultra', 'Galaxy S26', 'Galaxy S26 Plus', 'Galaxy Z Fold 6', 'Pixel 10 Pro', 'Pixel 10 Pro XL'])
                ->update(['category_id' => $smartphones->id]);
        }

        if ($monitors) {
            Series::whereIn('name', ['ROG Monitors', 'Odyssey Monitors'])
                ->update(['category_id' => $monitors->id]);
        }
    }
}
