<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Series;

class MetadataController extends Controller
{
    public function getMetadata()
    {
        return response()->json([
            'categories' => Category::select('id', 'name')->get(),
            'brands' => Brand::select('id', 'name')->get(),
            'series' => Series::select('id', 'name', 'brand_id')->get(),
        ]);
    }
}
