<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;

class AdminController extends Controller
{
    public function getDashboard(Request $request)
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        // Real counts
        $totalOrders = Order::count();
        $totalCustomers = User::where('role', 'customer')->count();

        // Revenue from approved/paid payments ONLY
        $approvedStatuses = ['approved', 'paid'];
        $totalRevenue = Payment::whereIn('status', $approvedStatuses)->sum('amount');
        $revenueCurrency = Payment::whereIn('status', $approvedStatuses)->value('currency') ?? 'MAD';

        // Orders to fulfill (processing)
        $ordersToFulfill = Order::where('status', 'processing')->count();

        // This month vs last month trends (real data)
        $ordersThisMonth = Order::where('created_at', '>=', $startOfMonth)->count();
        $ordersLastMonth = Order::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();

        $revenueThisMonth = Payment::whereIn('status', $approvedStatuses)
            ->where('created_at', '>=', $startOfMonth)->sum('amount');
        $revenueLastMonth = Payment::whereIn('status', $approvedStatuses)
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->sum('amount');

        // Calculate percentage changes (null if no prior data to compare)
        $ordersTrend = $ordersLastMonth > 0
            ? round((($ordersThisMonth - $ordersLastMonth) / $ordersLastMonth) * 100, 1)
            : null;
        $revenueTrend = $revenueLastMonth > 0
            ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100, 1)
            : null;

        // Orders by status
        $ordersByStatus = Order::selectRaw('status, count(*) as count')
            ->groupBy('status')->pluck('count', 'status');

        // Payments by status
        $paymentsByStatus = Payment::selectRaw('status, count(*) as count')
            ->groupBy('status')->pluck('count', 'status');

        // Recent orders (last 5)
        $recentOrders = Order::with(['payments', 'items.productVariant.product.images', 'user'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Weekly Top Customers (Last 7 Days)
        $weeklyTopCustomers = User::where('role', 'customer')
            ->whereHas('orders', function ($query) {
                $query->where('created_at', '>=', Carbon::now()->subDays(7));
            })
            ->withCount(['orders' => function ($query) {
                $query->where('created_at', '>=', Carbon::now()->subDays(7));
            }])
            ->orderByDesc('orders_count')
            ->take(3)
            ->get();

        // Most Selling Products
        $sellingPeriod = $request->query('selling_period', '30_days');
        
        $mostSellingQuery = \Illuminate\Support\Facades\DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('product_variants', 'order_items.product_variant_id', '=', 'product_variants.id')
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->selectRaw('products.id, products.name, SUM(order_items.quantity) as total_sales, (SELECT url FROM product_images WHERE product_images.product_id = products.id ORDER BY sort_order ASC LIMIT 1) as thumbnail')
            ->whereIn('orders.payment_status', ['paid', 'approved', 'completed']);

        if ($sellingPeriod === '30_days') {
            $mostSellingQuery->where('orders.created_at', '>=', Carbon::now()->subDays(30));
        }

        $mostSellingProducts = $mostSellingQuery
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_sales')
            ->take(3)
            ->get();

        // Sales Chart Data
        $chartPeriod = $request->query('chart_period', '30_days');
        $daysAgo = $chartPeriod === '7_days' ? $now->copy()->subDays(6)->startOfDay() : $now->copy()->subDays(29)->startOfDay();
        
        $dailyOrders = Order::where('created_at', '>=', $daysAgo)
            ->selectRaw('DATE(created_at) as date, count(*) as count')
            ->groupBy('date')
            ->pluck('count', 'date')->toArray();

        $dailyRevenue = Payment::whereIn('status', $approvedStatuses)
            ->where('created_at', '>=', $daysAgo)
            ->selectRaw('DATE(created_at) as date, sum(amount) as total')
            ->groupBy('date')
            ->pluck('total', 'date')->toArray();

        $salesChartData = [];
        $daysCount = $chartPeriod === '7_days' ? 7 : 30;
        for ($i = $daysCount - 1; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i)->format('Y-m-d');
            $salesChartData[] = [
                'date' => $date,
                'orders' => $dailyOrders[$date] ?? 0,
                'revenue' => round((float) ($dailyRevenue[$date] ?? 0), 2),
            ];
        }

        return response()->json([
            'total_orders' => $totalOrders,
            'total_revenue' => round((float) $totalRevenue, 2),
            'revenue_currency' => $revenueCurrency,
            'total_customers' => $totalCustomers,
            'orders_to_fulfill' => $ordersToFulfill,
            'orders_trend' => $ordersTrend,
            'revenue_trend' => $revenueTrend,
            'orders_this_month' => $ordersThisMonth,
            'revenue_this_month' => round((float) $revenueThisMonth, 2),
            'orders_by_status' => $ordersByStatus,
            'sales_chart_data' => $salesChartData,
            'recent_orders' => $recentOrders,
            'weekly_top_customers' => $weeklyTopCustomers,
            'most_selling_products' => $mostSellingProducts,
        ]);
    }
    public function getOrders(Request $request)
    {
        $orders = Order::with(['payments', 'user'])->orderBy('created_at', 'desc')->paginate(50);
        return response()->json($orders);
    }

    public function getOrder($id)
    {
        $order = Order::with([
            'items.productVariant.product.images',
            'user',
            'payments' => fn($q) => $q->orderBy('created_at', 'desc'),
            'statusHistory' => fn($q) => $q->orderBy('created_at', 'asc')
        ])->findOrFail($id);

        return response()->json($order);
    }

    public function getPayments()
    {
        $payments = Payment::with('order')->orderBy('created_at', 'desc')->paginate(50);
        return response()->json($payments);
    }

    public function updateOrderStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,canceled',
            'reason' => 'nullable|string'
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $validated['status']]);
        
        $order->statusHistory()->create([
            'status' => $validated['status'], 
            'notes' => $validated['reason'] ?? 'Updated by Admin'
        ]);

        return response()->json($order->load('statusHistory'));
    }

    public function getCustomers(Request $request)
    {
        $registeredCustomers = User::where('role', 'customer')
            ->withCount('orders')
            ->orderBy('created_at', 'desc')
            ->get();
            
        $registeredCustomers->transform(function ($customer) {
            $customer->total_spent = \App\Models\Payment::whereHas('order', function($q) use ($customer) {
                $q->where('user_id', $customer->id);
            })->whereIn('status', ['approved', 'paid'])->sum('amount');
            $customer->is_guest = false;
            return $customer;
        });

        // Get guest customers from orders
        $guestOrders = Order::whereNull('user_id')
            ->selectRaw('MIN(id) as id, customer_first_name, customer_last_name, customer_email, COUNT(*) as orders_count, MIN(created_at) as created_at')
            ->groupBy('customer_first_name', 'customer_last_name', 'customer_email')
            ->get();
            
        $guestCustomers = $guestOrders->map(function ($guest) {
            $totalSpent = \App\Models\Payment::whereHas('order', function($q) use ($guest) {
                $q->whereNull('user_id')
                  ->where('customer_first_name', $guest->customer_first_name)
                  ->where('customer_last_name', $guest->customer_last_name);
                if ($guest->customer_email) {
                    $q->where('customer_email', $guest->customer_email);
                } else {
                    $q->whereNull('customer_email');
                }
            })->whereIn('status', ['approved', 'paid'])->sum('amount');

            return [
                'id' => 'guest_' . $guest->id,
                'name' => trim("{$guest->customer_first_name} {$guest->customer_last_name}"),
                'email' => $guest->customer_email,
                'profile_picture' => null,
                'orders_count' => $guest->orders_count,
                'total_spent' => $totalSpent,
                'created_at' => $guest->created_at,
                'is_guest' => true,
            ];
        });

        // Merge and sort by created_at descending
        $allCustomers = collect($registeredCustomers)->concat($guestCustomers)
            ->sortByDesc('created_at')
            ->values();

        return response()->json([
            'data' => $allCustomers
        ]);
    }

    public function getCustomer($id)
    {
        if (str_starts_with($id, 'guest_')) {
            $orderId = str_replace('guest_', '', $id);
            $baseOrder = Order::whereNull('user_id')->findOrFail($orderId);
            
            $customer = (object) [
                'id' => $id,
                'name' => trim("{$baseOrder->customer_first_name} {$baseOrder->customer_last_name}"),
                'email' => $baseOrder->customer_email,
                'profile_picture' => null,
                'created_at' => $baseOrder->created_at,
                'is_guest' => true,
            ];

            $ordersQuery = Order::whereNull('user_id')
                ->where('customer_first_name', $baseOrder->customer_first_name)
                ->where('customer_last_name', $baseOrder->customer_last_name);
                
            if ($baseOrder->customer_email) {
                $ordersQuery->where('customer_email', $baseOrder->customer_email);
            } else {
                $ordersQuery->whereNull('customer_email');
            }

            $customer->orders_count = $ordersQuery->count();
            
            $orders = (clone $ordersQuery)
                ->with('payments')
                ->orderBy('created_at', 'desc')
                ->get();
                
            $customer->total_spent = \App\Models\Payment::whereHas('order', function($q) use ($ordersQuery) {
                $q->mergeWheres($ordersQuery->getQuery()->wheres, $ordersQuery->getQuery()->bindings);
            })->whereIn('status', ['approved', 'paid'])->sum('amount');
            
        } else {
            $customer = User::where('role', 'customer')->findOrFail($id);
            $customer->is_guest = false;
            
            $customer->total_spent = \App\Models\Payment::whereHas('order', function($q) use ($customer) {
                $q->where('user_id', $customer->id);
            })->whereIn('status', ['approved', 'paid'])->sum('amount');

            $customer->orders_count = Order::where('user_id', $customer->id)->count();
            
            $orders = Order::where('user_id', $customer->id)
                ->with('payments')
                ->orderBy('created_at', 'desc')
                ->get();
        }
            
        return response()->json([
            'customer' => $customer,
            'orders' => $orders
        ]);
    }

    // --- CATEGORIES (Basic CRUD for Admin) ---
    public function getCategories()
    {
        $categories = \App\Models\Category::withCount('products')->with('brands')->get();
        
        // Add children product counts to parents
        foreach ($categories as $category) {
            $childrenCount = $categories->where('parent_id', $category->id)->sum('products_count');
            $category->setAttribute('products_count', $category->products_count + $childrenCount);
        }
        
        return response()->json($categories);
    }

    public function createCategory(Request $request)
    {
        // Simple create stub
        $validated = $request->validate([
            'name' => 'required|string',
            'slug' => 'required|string|unique:categories',
            'brand_ids' => 'nullable|array',
            'brand_ids.*' => 'exists:brands,id',
        ]);
        $category = \App\Models\Category::create($request->only('name', 'slug'));
        if ($request->has('brand_ids')) {
            $category->brands()->sync($request->brand_ids);
        }
        return response()->json($category->load('brands'));
    }

    public function updateCategory(Request $request, $id)
    {
        $category = \App\Models\Category::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string',
            'slug' => 'required|string|unique:categories,slug,' . $id,
            'brand_ids' => 'nullable|array',
            'brand_ids.*' => 'exists:brands,id',
        ]);
        $category->update($request->only('name', 'slug'));
        if ($request->has('brand_ids')) {
            $category->brands()->sync($request->brand_ids);
        }
        return response()->json($category->load('brands'));
    }

    public function deleteCategory($id)
    {
        $category = \App\Models\Category::find($id);
        
        if (!$category) {
            // Idempotent: already deleted or doesn't exist
            return response()->json(['message' => 'Deleted']);
        }

        if ($category->children()->count() > 0) {
            return response()->json(['message' => 'Cannot delete category with subcategories.'], 400);
        }

        if ($category->products()->count() > 0) {
            return response()->json(['message' => 'Cannot delete category because it has products.'], 400);
        }

        try {
            $category->delete();
            return response()->json(['message' => 'Deleted']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete category.'], 400);
        }
    }

    // --- BRANDS ---
    public function getBrands()
    {
        $brands = \App\Models\Brand::all();
        return response()->json($brands);
    }

    public function createBrand(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'slug' => 'required|string|unique:brands',
            'image' => 'nullable|image|max:2048'
        ]);

        $data = $request->only('name', 'slug');

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('brands', 'public');
            $data['image_url'] = '/storage/' . $path;
        }

        $brand = \App\Models\Brand::create($data);
        return response()->json($brand);
    }

    public function updateBrand(Request $request, $id)
    {
        $brand = \App\Models\Brand::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string',
            'slug' => 'required|string|unique:brands,slug,' . $id,
            'image' => 'nullable|image|max:2048'
        ]);

        $data = $request->only('name', 'slug');

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($brand->image_url) {
                $oldPath = str_replace('/storage/', '', $brand->image_url);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('brands', 'public');
            $data['image_url'] = '/storage/' . $path;
        }

        $brand->update($data);
        return response()->json($brand);
    }

    public function deleteBrand($id)
    {
        $brand = \App\Models\Brand::findOrFail($id);
        
        // Delete image
        if ($brand->image_url) {
            $oldPath = str_replace('/storage/', '', $brand->image_url);
            \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
        }

        $brand->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function deleteOrder($id)
    {
        $order = Order::findOrFail($id);

        if ($order->payment_status !== 'unpaid' && $order->payment_status !== 'failed') {
            return response()->json(['message' => 'Only unpaid or failed orders can be deleted.'], 400);
        }

        // Delete associated payments and status history
        $order->payments()->delete();
        $order->statusHistory()->delete();
        $order->items()->delete();
        $order->delete();

        return response()->json(['message' => 'Order deleted successfully.']);
    }
}
