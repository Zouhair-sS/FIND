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
    public function getDashboard()
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

        // Pending payments count
        $pendingPayments = Payment::where('status', 'pending')->count();

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
        $recentOrders = Order::with('payments')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'total_orders' => $totalOrders,
            'total_revenue' => round((float) $totalRevenue, 2),
            'revenue_currency' => $revenueCurrency,
            'total_customers' => $totalCustomers,
            'pending_payments' => $pendingPayments,
            'orders_trend' => $ordersTrend,
            'revenue_trend' => $revenueTrend,
            'orders_this_month' => $ordersThisMonth,
            'revenue_this_month' => round((float) $revenueThisMonth, 2),
            'orders_by_status' => $ordersByStatus,
            'payments_by_status' => $paymentsByStatus,
            'recent_orders' => $recentOrders,
        ]);
    }
    public function getOrders()
    {
        $orders = Order::with('payments')->orderBy('created_at', 'desc')->paginate(50);
        return response()->json($orders);
    }

    public function getOrder($id)
    {
        $order = Order::with([
            'items.productVariant.product', 
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
            'status' => 'required|in:pending,processing,shipped,delivered'
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $validated['status']]);
        
        $order->statusHistory()->create([
            'status' => $validated['status'], 
            'notes' => 'Updated by Admin'
        ]);

        return response()->json($order->load('statusHistory'));
    }
}
