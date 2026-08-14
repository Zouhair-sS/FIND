<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use Exception;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    protected $orderService;
    protected $alyaPayService;

    public function __construct(OrderService $orderService, AlyaPayService $alyaPayService)
    {
        $this->orderService = $orderService;
        $this->alyaPayService = $alyaPayService;
    }

    /**
     * Initiate payment for an order via AlyaPay
     */
    public function initiatePayment(array $checkoutData)
    {
        // 1. Create Order in DB
        $order = $this->orderService->createOrder($checkoutData);

        // 2. Prepare AlyaPay Payload
        $itemsPayload = $order->items->map(function ($item) {
            return [
                'name' => mb_substr($item->productVariant->product->name . ' - ' . $item->productVariant->sku, 0, 200),
                'reference' => mb_substr($item->productVariant->sku, 0, 100),
                'quantity' => $item->quantity,
                'unitPrice' => (float) $item->unit_price,
            ];
        })->toArray();

        $payload = [
            'customerPhone' => $order->customer_phone,
            'total' => (float) $order->total_amount,
            'currency' => $order->currency,
            'vendorReference' => $order->vendor_reference,
            'items' => $itemsPayload
        ];

        // 3. Create Transaction on AlyaPay
        $transactionResponse = $this->alyaPayService->createTransaction($payload);
        
        // 4. Record Payment in DB
        $payment = Payment::create([
            'order_id' => $order->id,
            'provider' => 'alyapay',
            'alyapay_transaction_id' => $transactionResponse['id'] ?? null,
            'alyapay_order_reference' => $transactionResponse['orderReference'] ?? null,
            'vendor_reference' => $order->vendor_reference,
            'status' => strtolower($transactionResponse['status'] ?? 'pending'),
            'amount' => $order->total_amount,
            'currency' => $order->currency,
            'raw_response' => json_encode($transactionResponse),
        ]);

        // 5. Generate Checkout Link
        $checkoutLinkResponse = $this->alyaPayService->generateCheckoutLink($order->vendor_reference);
        $checkoutUrl = $checkoutLinkResponse['checkout_url'] ?? null;
        
        if ($checkoutUrl) {
            // Append redirect_url so AlyaPay sends the user back to our app
            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
            $callbackUrl = urlencode("{$frontendUrl}/checkout/payment-callback?vendor_reference={$order->vendor_reference}");
            
            $separator = strpos($checkoutUrl, '?') === false ? '?' : '&';
            $checkoutUrl .= "{$separator}redirect_url={$callbackUrl}";
            
            $payment->update(['checkout_url' => $checkoutUrl]);
        }

        $order->update(['payment_status' => 'awaiting_payment']);

        return [
            'order_number' => $order->order_number,
            'checkout_url' => $checkoutUrl,
        ];
    }

    /**
     * Verify payment status directly from API
     */
    public function verifyPayment(string $vendorReference)
    {
        $order = Order::where('vendor_reference', $vendorReference)->firstOrFail();
        $payment = Payment::where('vendor_reference', $vendorReference)->latest()->firstOrFail();

        // Check AlyaPay API
        $response = $this->alyaPayService->getTransaction($vendorReference);
        $status = strtolower($response['status'] ?? '');

        return $this->processStatusUpdate($order, $payment, $status, $response);
    }

    /**
     * Handle incoming webhook
     */
    public function handleWebhook(array $payload, string $eventId)
    {
        $vendorReference = $payload['data']['vendorReference'] ?? null;
        $status = strtolower($payload['data']['status'] ?? '');

        if (!$vendorReference) {
            throw new Exception('Webhook missing vendorReference');
        }

        // Idempotency check
        if (Payment::where('webhook_event_id', $eventId)->exists()) {
            return true; // Already processed
        }

        $order = Order::where('vendor_reference', $vendorReference)->first();
        if (!$order) {
            Log::warning("Webhook received for unknown order: $vendorReference");
            return false;
        }

        $payment = Payment::where('vendor_reference', $vendorReference)->latest()->first();
        if (!$payment) {
            return false;
        }

        $this->processStatusUpdate($order, $payment, $status, $payload, $eventId);
        return true;
    }

    protected function processStatusUpdate(Order $order, Payment $payment, string $status, array $rawResponse, ?string $eventId = null)
    {
        $payment->update([
            'status' => $status,
            'webhook_event_id' => $eventId ?? $payment->webhook_event_id,
            'verified_at' => now(),
            'raw_response' => json_encode($rawResponse)
        ]);

        if ($status === 'approved') {
            $order->update([
                'status' => 'processing',
                'payment_status' => 'paid',
            ]);
            return true; // Verified
        } elseif (in_array($status, ['canceled', 'expired', 'failed'])) {
            $order->update([
                'payment_status' => $status,
                // Do not cancel the order itself immediately so customer can retry
            ]);
        }

        return false;
    }
}
