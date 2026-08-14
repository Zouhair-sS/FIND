<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\PaymentService;
use App\Models\Order;

class CheckoutController extends Controller
{
    protected $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function initiateCheckout(Request $request)
    {
        \Illuminate\Support\Facades\Log::info('Hit checkout endpoint', $request->all());
        try {
            $validated = $request->validate([
                'items' => 'required|array|min:1',
                'items.*.product_variant_id' => 'required|exists:product_variants,id',
                'items.*.quantity' => 'required|integer|min:1',
                'customer_first_name' => 'required|string',
                'customer_last_name' => 'required|string',
                'customer_phone' => 'required|string',
                'customer_email' => 'nullable|email',
                'shipping_address' => 'required|string',
                'shipping_city' => 'required|string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Illuminate\Support\Facades\Log::error('Checkout validation failed', ['errors' => $e->errors()]);
            return response()->json(['error' => 'Validation failed: ' . json_encode($e->errors())], 422);
        }

        try {
            $result = $this->paymentService->initiatePayment($validated);
            return response()->json($result, 200);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Checkout exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Backend error: ' . $e->getMessage()], 500);
        }
    }

    public function verifyPayment(Request $request)
    {
        $validated = $request->validate([
            'vendor_reference' => 'required|string',
        ]);

        try {
            $verified = $this->paymentService->verifyPayment($validated['vendor_reference']);
            return response()->json(['verified' => $verified], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getOrder($orderNumber)
    {
        $order = Order::with('items.productVariant.product', 'items.productVariant.product.images')
                      ->where('order_number', $orderNumber)
                      ->firstOrFail();
        
        // Authorization check if user is logged in
        if (auth('sanctum')->check() && $order->user_id && $order->user_id !== auth('sanctum')->id()) {
            abort(403);
        }

        return response()->json($order);
    }
}
