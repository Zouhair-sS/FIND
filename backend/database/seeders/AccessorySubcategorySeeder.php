<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class AccessorySubcategorySeeder extends Seeder
{
    public function run(): void
    {
        $accessories = Category::where('name', 'Accessories')->first();
        if (!$accessories) return;

        $subcategories = [
            ['name' => 'Headphones & Earbuds', 'slug' => 'headphones-earbuds',    'sort_order' => 1],
            ['name' => 'Mice',                  'slug' => 'mice',                   'sort_order' => 2],
            ['name' => 'Keyboards',             'slug' => 'keyboards',              'sort_order' => 3],
            ['name' => 'Smartwatches',          'slug' => 'accessories-smartwatches','sort_order' => 4],
        ];

        foreach ($subcategories as $sub) {
            Category::firstOrCreate(
                ['slug' => $sub['slug']],
                array_merge($sub, ['parent_id' => $accessories->id])
            );
        }

        $this->command->info('Accessory subcategories seeded!');
    }
}
