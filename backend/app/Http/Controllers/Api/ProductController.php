<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class ProductController extends Controller
{
    public function index()
    {
        $products = QueryBuilder::for(Product::class)
            ->allowedFilters([
                'brand',
                'category_id',
                'status',
                AllowedFilter::exact('ram_gb', 'variants.ram_gb'),
                AllowedFilter::exact('storage_gb', 'variants.storage_gb'),
                AllowedFilter::exact('color', 'variants.color'),
            ])
            ->allowedSorts(['name', 'brand'])
            ->allowedIncludes(['variants', 'images', 'category'])
            ->with(['variants', 'images', 'category'])
            ->where('status', 'active')
            ->paginate(12);

        return response()->json($products);
    }

    public function show($slug)
    {
        $product = QueryBuilder::for(Product::where('slug', $slug))
            ->allowedIncludes(['variants', 'images', 'category'])
            ->with(['variants', 'images', 'category'])
            ->firstOrFail();

        return response()->json($product);
    }

    public function configurations($slug)
    {
        $product = Product::where('slug', $slug)->firstOrFail();

        if (!$product->series_id) {
            return response()->json([]);
        }

        $relatedProducts = Product::where('series_id', $product->series_id)
            ->where('id', '!=', $product->id)
            ->where('status', 'active')
            ->with(['variants' => function ($q) {
                // Just need one variant to extract RAM, storage, price
                $q->limit(1);
            }])
            ->get();

        $configurations = $relatedProducts->map(function ($p) {
            $variant = $p->variants->first();
            return [
                'id' => $p->id,
                'slug' => $p->slug,
                'name' => $p->name,
                'processor' => $variant ? $variant->processor : null,
                'ram_gb' => $variant ? $variant->ram_gb : null,
                'storage_gb' => $variant ? $variant->storage_gb : null,
                'price' => $variant ? $variant->price : 0,
            ];
        })->sortBy('price')->values();

        return response()->json($configurations);
    }

    public function search()
    {
        $query = request()->input('q', '');

        if (strlen($query) < 1) {
            return response()->json([]);
        }

        $products = Product::where('status', 'active')
            ->where(function ($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                  ->orWhere('brand', 'LIKE', "%{$query}%");
            })
            ->with(['images' => function ($q) {
                $q->orderBy('sort_order')->limit(1);
            }, 'category', 'variants' => function ($q) {
                $q->orderBy('price')->limit(1);
            }])
            ->get();

        return response()->json($products);
    }

    public function allWithFilters()
    {
        $products = Product::with(['variants', 'images', 'brand', 'series', 'attributeValues.attribute', 'collections', 'category'])
            ->where('status', 'active')
            ->inRandomOrder()
            ->get();
            
        $categories = [];
        $minPrice = null;
        $maxPrice = null;

        foreach ($products as $p) {
            if ($p->category) {
                $categories[$p->category->name] = ($categories[$p->category->name] ?? 0) + 1;
            }
            
            foreach ($p->variants as $v) {
                $price = (float) $v->price;
                if ($minPrice === null || $price < $minPrice) $minPrice = $price;
                if ($maxPrice === null || $price > $maxPrice) $maxPrice = $price;
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

        $addFilter('Category', 'category', $categories);

        $result = new \stdClass();
        $result->name = "All Products";
        $result->products = $products;
        $result->filters = $filters;
        $result->price = ['min' => $minPrice ?? 0, 'max' => $maxPrice ?? 0];
            
        return response()->json($result);
    }
}
