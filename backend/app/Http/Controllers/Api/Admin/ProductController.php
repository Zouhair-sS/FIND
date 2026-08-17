<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductImage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * List products grouped by storefront identity (name + series_id).
     */
    public function index(Request $request)
    {
        $query = Product::with([
            'brand:id,name',
            'category:id,name',
            'variants:id,product_id,price,stock_quantity',
            'images' => fn($q) => $q->orderBy('sort_order'),
        ]);

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $products = $query->orderBy('name')->get();

        // Group by storefront identity
        $grouped = $products->groupBy(fn($p) => $p->name . '|' . ($p->series_id ?? 'null'));

        $result = $grouped->map(function ($group) {
            $first = $group->first();
            $allVariants = $group->flatMap(fn($p) => $p->variants);
            $firstImage = $group->flatMap(fn($p) => $p->images)->sortBy('sort_order')->first();

            return [
                'group_id' => $first->id,
                'name' => $first->name,
                'brand' => $first->brand,
                'category' => $first->category,
                'series_id' => $first->series_id,
                'status' => $first->status,
                'configurations_count' => $group->count(),
                'variants_count' => $allVariants->count(),
                'total_stock' => $allVariants->sum('stock_quantity'),
                'price_min' => $allVariants->count() > 0 ? (float) $allVariants->min('price') : 0,
                'price_max' => $allVariants->count() > 0 ? (float) $allVariants->max('price') : 0,
                'thumbnail' => $firstImage?->url,
            ];
        })->values()->sortBy('name')->values();

        // Manual pagination over grouped results
        $page = max(1, (int) $request->get('page', 1));
        $perPage = 15;
        $total = $result->count();
        $items = $result->forPage($page, $perPage)->values();

        return response()->json([
            'data' => $items,
            'current_page' => $page,
            'last_page' => max(1, (int) ceil($total / $perPage)),
            'per_page' => $perPage,
            'total' => $total,
        ]);
    }

    /**
     * Show full product group — all configurations with variants and images.
     */
    public function show($id)
    {
        $product = Product::with(['brand', 'category', 'series'])->findOrFail($id);

        $configurations = Product::where('name', $product->name)
            ->where(function ($q) use ($product) {
                if ($product->series_id) {
                    $q->where('series_id', $product->series_id);
                } else {
                    $q->whereNull('series_id');
                }
            })
            ->with([
                'variants' => fn($q) => $q->orderBy('color'),
                'images' => fn($q) => $q->orderBy('sort_order'),
            ])
            ->orderBy('id')
            ->get();

        $first = $configurations->first();

        return response()->json([
            'group_id' => $first->id,
            'name' => $first->name,
            'brand' => $first->brand,
            'category' => $first->category,
            'series' => $first->series,
            'series_id' => $first->series_id,
            'brand_id' => $first->brand_id,
            'category_id' => $first->category_id,
            'status' => $first->status,
            'description' => $first->description,
            'configurations' => $configurations->map(fn($p) => [
                'id' => $p->id,
                'sku' => $p->sku,
                'slug' => $p->slug,
                'stock' => $p->stock,
                'variants' => $p->variants,
                'images' => $p->images,
            ]),
        ]);
    }

    /**
     * Create a new product with an initial configuration and variants (wizard).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'brand_id' => 'required|exists:brands,id',
            'category_id' => 'required|exists:categories,id',
            'series_id' => 'nullable|exists:series,id',
            'description' => 'nullable|string',
            'status' => 'required|string|in:draft,active,archived',
            'sku' => 'nullable|string|max:100',
            'variants' => 'nullable|array',
            'variants.*.price' => 'required|numeric|min:0',
            'variants.*.stock_quantity' => 'required|integer|min:0',
            'variants.*.sku' => 'required|string|max:100',
            'variants.*.color' => 'nullable|string',
            'variants.*.storage_gb' => 'nullable|integer',
            'variants.*.ram_gb' => 'nullable|integer',
            'variants.*.processor' => 'nullable|string',
            'variants.*.screen_size' => 'nullable|numeric',
        ]);

        $slug = Str::slug($validated['name']);
        if (Product::where('slug', $slug)->exists()) {
            $slug .= '-' . time();
        }

        $product = Product::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'sku' => $validated['sku'] ?? strtoupper(Str::slug($validated['name'])),
            'brand_id' => $validated['brand_id'],
            'category_id' => $validated['category_id'],
            'series_id' => $validated['series_id'] ?? null,
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'],
            'stock' => 0,
            'published_at' => $validated['status'] === 'active' ? now() : null,
        ]);

        if (!empty($validated['variants'])) {
            foreach ($validated['variants'] as $variantData) {
                $product->variants()->create($variantData);
            }
            $product->update(['stock' => $product->variants()->sum('stock_quantity')]);
        }

        return response()->json($product->load('variants'), 201);
    }

    /**
     * Update shared fields across all configurations in the product group.
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'brand_id' => 'required|exists:brands,id',
            'category_id' => 'required|exists:categories,id',
            'series_id' => 'nullable|exists:series,id',
            'description' => 'nullable|string',
            'status' => 'required|string|in:draft,active,archived',
        ]);

        // Find all siblings in the group
        $siblings = Product::where('name', $product->name)
            ->where(function ($q) use ($product) {
                if ($product->series_id) {
                    $q->where('series_id', $product->series_id);
                } else {
                    $q->whereNull('series_id');
                }
            })
            ->get();

        $nameChanged = $validated['name'] !== $product->name;

        foreach ($siblings as $sibling) {
            $updateData = [
                'name' => $validated['name'],
                'brand_id' => $validated['brand_id'],
                'category_id' => $validated['category_id'],
                'series_id' => $validated['series_id'],
                'description' => $validated['description'],
                'status' => $validated['status'],
            ];

            // Regenerate slug if name changed, preserving the config suffix
            if ($nameChanged) {
                $oldBase = Str::slug($product->name);
                $newBase = Str::slug($validated['name']);
                $oldSlug = $sibling->slug;

                if (Str::startsWith($oldSlug, $oldBase)) {
                    $suffix = Str::substr($oldSlug, Str::length($oldBase));
                    $newSlug = $newBase . $suffix;
                } else {
                    $newSlug = $newBase . '-' . $sibling->id;
                }

                if (Product::where('slug', $newSlug)->where('id', '!=', $sibling->id)->exists()) {
                    $newSlug .= '-' . time();
                }
                $updateData['slug'] = $newSlug;
            }

            if ($validated['status'] === 'active' && !$sibling->published_at) {
                $updateData['published_at'] = now();
            }

            $sibling->update($updateData);
        }

        return response()->json([
            'message' => 'Product updated across ' . $siblings->count() . ' configurations',
            'count' => $siblings->count(),
        ]);
    }

    /**
     * Delete the entire product group (all configurations).
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        $count = Product::where('name', $product->name)
            ->where(function ($q) use ($product) {
                if ($product->series_id) {
                    $q->where('series_id', $product->series_id);
                } else {
                    $q->whereNull('series_id');
                }
            })
            ->delete();

        return response()->json(['message' => "Deleted {$count} configurations"]);
    }

    /**
     * Add a new configuration to an existing product group.
     */
    public function addConfiguration(Request $request, $id)
    {
        $parent = Product::findOrFail($id);

        $validated = $request->validate([
            'sku' => 'required|string|max:100',
            'variants' => 'nullable|array',
            'variants.*.price' => 'required|numeric|min:0',
            'variants.*.stock_quantity' => 'required|integer|min:0',
            'variants.*.sku' => 'required|string|max:100',
            'variants.*.color' => 'nullable|string',
            'variants.*.storage_gb' => 'nullable|integer',
            'variants.*.ram_gb' => 'nullable|integer',
            'variants.*.processor' => 'nullable|string',
            'variants.*.screen_size' => 'nullable|numeric',
        ]);

        $slug = Str::slug($parent->name . '-' . $validated['sku']);
        if (Product::where('slug', $slug)->exists()) {
            $slug .= '-' . time();
        }

        $config = Product::create([
            'name' => $parent->name,
            'slug' => $slug,
            'sku' => $validated['sku'],
            'brand_id' => $parent->brand_id,
            'category_id' => $parent->category_id,
            'series_id' => $parent->series_id,
            'description' => $parent->description,
            'status' => $parent->status,
            'stock' => 0,
            'published_at' => $parent->published_at,
        ]);

        if (!empty($validated['variants'])) {
            foreach ($validated['variants'] as $variantData) {
                $config->variants()->create($variantData);
            }
            $config->update(['stock' => $config->variants()->sum('stock_quantity')]);
        }

        return response()->json($config->load(['variants', 'images']), 201);
    }

    /**
     * Delete a single configuration (Product row).
     */
    public function deleteConfiguration($configId)
    {
        Product::findOrFail($configId)->delete();
        return response()->json(['message' => 'Configuration deleted']);
    }

    // ─── Variant CRUD ────────────────────────────────────────

    public function storeVariant(Request $request, $configId)
    {
        $config = Product::findOrFail($configId);

        $validated = $request->validate([
            'sku' => 'required|string|max:100',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'ram_gb' => 'nullable|integer',
            'storage_gb' => 'nullable|integer',
            'screen_size' => 'nullable|numeric',
            'color' => 'nullable|string',
            'processor' => 'nullable|string',
            'product_image_id' => 'nullable|exists:product_images,id',
        ]);

        $variant = $config->variants()->create($validated);
        $config->update(['stock' => $config->variants()->sum('stock_quantity')]);

        return response()->json($variant, 201);
    }

    public function updateVariant(Request $request, $variantId)
    {
        $variant = ProductVariant::findOrFail($variantId);

        $validated = $request->validate([
            'sku' => 'required|string|max:100',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'ram_gb' => 'nullable|integer',
            'storage_gb' => 'nullable|integer',
            'screen_size' => 'nullable|numeric',
            'color' => 'nullable|string',
            'processor' => 'nullable|string',
            'product_image_id' => 'nullable|exists:product_images,id',
        ]);

        $variant->update($validated);
        $variant->product->update(['stock' => $variant->product->variants()->sum('stock_quantity')]);

        return response()->json($variant);
    }

    public function destroyVariant($variantId)
    {
        $variant = ProductVariant::findOrFail($variantId);
        $product = $variant->product;
        $variant->delete();
        $product->update(['stock' => $product->variants()->sum('stock_quantity')]);

        return response()->json(['message' => 'Variant deleted']);
    }

    // ─── Image Management ────────────────────────────────────

    public function uploadImage(Request $request, $configId)
    {
        $config = Product::findOrFail($configId);

        $request->validate([
            'image' => 'required|image|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $sortOrder = ($config->images()->max('sort_order') ?? 0) + 1;

            $image = $config->images()->create([
                'url' => '/storage/' . $path,
                'sort_order' => $sortOrder,
            ]);

            return response()->json($image, 201);
        }

        return response()->json(['error' => 'No image uploaded'], 400);
    }

    public function deleteImage($imageId)
    {
        ProductImage::findOrFail($imageId)->delete();
        return response()->json(['message' => 'Image deleted']);
    }

    public function reorderImages(Request $request, $configId)
    {
        $validated = $request->validate([
            'image_ids' => 'required|array',
            'image_ids.*' => 'integer|exists:product_images,id',
        ]);

        foreach ($validated['image_ids'] as $index => $imageId) {
            ProductImage::where('id', $imageId)
                ->where('product_id', $configId)
                ->update(['sort_order' => $index + 1]);
        }

        return response()->json(['message' => 'Images reordered']);
    }
}
