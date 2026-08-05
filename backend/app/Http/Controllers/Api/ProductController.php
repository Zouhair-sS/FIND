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
            ->limit(8)
            ->get();

        return response()->json($products);
    }
}
