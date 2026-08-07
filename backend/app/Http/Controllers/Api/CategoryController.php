<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(
            Category::with('children')->whereNull('parent_id')->orderBy('sort_order')->get()
        );
    }

    public function show($slug, Request $request)
    {
        $category = Category::with(['children'])->where('slug', $slug)->firstOrFail();
        
        $includeChildren = $request->query('includeChildren', 'false') === 'true';
        $categoryIds = [$category->id];

        if ($includeChildren) {
            $categoryIds = array_merge($categoryIds, $category->children->pluck('id')->toArray());
        }

        $products = \App\Models\Product::with(['variants', 'images', 'brand', 'series', 'attributeValues.attribute', 'collections'])
            ->whereIn('category_id', $categoryIds)
            ->get();
            
        $brands = [];
        $rams = [];
        $storages = [];
        $processors = [];
        $screens = [];
        $customAttributes = [];
        $minPrice = null;
        $maxPrice = null;

        foreach ($products as $p) {
            if ($p->brand) {
                $brands[$p->brand->name] = ($brands[$p->brand->name] ?? 0) + 1;
            }
            
            $p_rams = [];
            $p_storages = [];
            $p_processors = [];
            $p_screens = [];
            
            foreach ($p->variants as $v) {
                if ($v->ram_gb) $p_rams[$v->ram_gb] = true;
                if ($v->storage_gb) $p_storages[$v->storage_gb] = true;
                if ($v->processor) $p_processors[$v->processor] = true;
                if ($v->screen_size) $p_screens[(string)$v->screen_size] = true;
                
                $price = (float) $v->price;
                if ($minPrice === null || $price < $minPrice) $minPrice = $price;
                if ($maxPrice === null || $price > $maxPrice) $maxPrice = $price;
            }
            
            foreach (array_keys($p_rams) as $val) $rams[$val] = ($rams[$val] ?? 0) + 1;
            foreach (array_keys($p_storages) as $val) $storages[$val] = ($storages[$val] ?? 0) + 1;
            foreach (array_keys($p_processors) as $val) $processors[$val] = ($processors[$val] ?? 0) + 1;
            foreach (array_keys($p_screens) as $val) $screens[$val] = ($screens[$val] ?? 0) + 1;
            
            foreach ($p->attributeValues as $av) {
                $attrName = $av->attribute->name;
                $val = $av->value;
                if (!isset($customAttributes[$attrName])) {
                    $customAttributes[$attrName] = [];
                }
                $customAttributes[$attrName][$val] = ($customAttributes[$attrName][$val] ?? 0) + 1;
            }
        }

        $filters = [];
        $addFilter = function($name, $slug, $counts, $sortNum = false) use (&$filters) {
            if (empty($counts)) return;
            $values = [];
            foreach ($counts as $val => $count) {
                $values[] = ['value' => $val, 'count' => $count];
            }
            if ($sortNum) {
                usort($values, fn($a, $b) => (float)$a['value'] <=> (float)$b['value']);
            } else {
                usort($values, fn($a, $b) => strcmp($a['value'], $b['value']));
            }
            $filters[] = [
                'name' => $name,
                'slug' => $slug,
                'type' => 'checkbox',
                'values' => $values
            ];
        };

        $addFilter('Brand', 'brand', $brands);
        $addFilter('Processor', 'processor', $processors);
        $addFilter('RAM', 'ram_gb', $rams, true);
        $addFilter('Storage', 'storage_gb', $storages, true);
        $addFilter('Screen Size', 'screen_size', $screens, true);

        foreach ($customAttributes as $attrName => $counts) {
            $addFilter($attrName, Str::slug($attrName), $counts);
        }

        $category->setRelation('products', $products);
        $category->filters = $filters;
        $category->price = ['min' => $minPrice ?? 0, 'max' => $maxPrice ?? 0];
            
        return response()->json($category);
    }
}
