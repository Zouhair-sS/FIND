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
}
