<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(
            Category::with('children')->whereNull('parent_id')->get()
        );
    }

    public function show($slug)
    {
        $category = Category::with(['products.variants', 'products.images'])
            ->where('slug', $slug)
            ->firstOrFail();
            
        return response()->json($category);
    }
}
