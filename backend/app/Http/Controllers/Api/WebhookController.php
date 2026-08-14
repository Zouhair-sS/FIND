<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\PaymentService;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    protected $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function handleAlyaPay(Request $request)
    {
        // 1. Signature Verification
        $secret = config('alyapay.webhook_secret');
        
        // If secret is configured, enforce signature verification
        if ($secret) {
            $timestamp = $request->header('x-alya-timestamp');
            $receivedSig = $request->header('x-alya-signature');
            $rawBody = $request->getContent(); // Raw payload

            if (!$timestamp || !$receivedSig) {
                Log::warning('AlyaPay webhook missing signature headers');
                return response('Missing headers', 400);
            }

            $expectedHMAC = hash_hmac('sha256', $timestamp . '.' . $rawBody, $secret);
            $expectedSig = 'sha256=' . $expectedHMAC;

            if (!hash_equals($expectedSig, $receivedSig)) {
                Log::warning('AlyaPay webhook signature mismatch', [
                    'received' => $receivedSig, 
                    'expected' => $expectedSig
                ]);
                return response('Invalid signature', 401);
            }
        }

        // 2. Process payload
        $eventId = $request->header('x-alya-event-id', 'unknown-' . uniqid());
        $payload = $request->json()->all();

        try {
            $this->paymentService->handleWebhook($payload, $eventId);
            return response('', 200);
        } catch (\Exception $e) {
            Log::error('AlyaPay webhook processing failed', ['error' => $e->getMessage()]);
            return response('Error processing webhook', 500);
        }
    }
}
