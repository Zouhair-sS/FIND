<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Exception;

class OrderService
{
    /**
     * Create a new order securely using database prices.
     */
    public function createOrder(array $data)
    {
        return DB::transaction(function () use ($data) {
            $items = $data['items'];
            
            if (empty($items)) {
                throw new Exception('Order must contain at least one item.');
            }

            $subtotal = 0;
            $orderItemsData = [];

            foreach ($items as $item) {
                $variant = ProductVariant::with('product')->findOrFail($item['product_variant_id']);
                
                $quantity = (int) $item['quantity'];
                if ($quantity <= 0) {
                    throw new Exception('Quantity must be greater than zero.');
                }

                $price = $variant->price;
                $subtotal += ($price * $quantity);
                
                $orderItemsData[] = [
                    'product_variant_id' => $variant->id,
                    'quantity' => $quantity,
                    'unit_price' => $price,
                ];
            }

            $shippingCost = $data['shipping_cost'] ?? 0.00;
            $totalAmount = $subtotal + $shippingCost;
            $orderNumber = $this->generateOrderNumber();
            $vendorReference = $orderNumber; // They are the same per our design

            $order = Order::create([
                'user_id' => auth()->id(), // Nullable for guests
                'order_number' => $orderNumber,
                'vendor_reference' => $vendorReference,
                'status' => 'pending_payment',
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'total_amount' => $totalAmount,
                'currency' => 'MAD',
                'customer_first_name' => $data['customer_first_name'] ?? null,
                'customer_last_name' => $data['customer_last_name'] ?? null,
                'customer_phone' => $data['customer_phone'] ?? null,
                'customer_email' => $data['customer_email'] ?? null,
                'shipping_address' => $data['shipping_address'] ?? null,
                'shipping_city' => $data['shipping_city'] ?? null,
                'payment_status' => 'unpaid',
            ]);

            foreach ($orderItemsData as $itemData) {
                $itemData['order_id'] = $order->id;
                OrderItem::create($itemData);
            }

            // Reload the order with items to return
            return $order->load('items.productVariant.product');
        });
    }

    private function generateOrderNumber(): string
    {
        do {
            // E.g. FIND-ORD-20260810-XXXX
            $number = 'FIND-ORD-' . date('Ymd') . '-' . strtoupper(Str::random(4));
        } while (Order::where('order_number', $number)->exists());

        return $number;
    }
}
