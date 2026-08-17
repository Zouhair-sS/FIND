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
        if (!$secret) {
            Log::error('AlyaPay webhook secret is missing in configuration.');
            return response('Webhook secret unconfigured', 401);
        }

        $timestamp = $request->header('x-alya-timestamp');
        $receivedSig = $request->header('x-alya-signature');
        $rawBody = $request->getContent(); // Raw payload

        if (!$timestamp || !$receivedSig) {
            Log::warning('AlyaPay webhook missing signature headers');
            return response('Missing headers', 401);
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

        // 2. Process payload
        $payload = $request->json()->all();
        
        $transactionId = $payload['data']['id'] ?? 'unknown';
        $status = $payload['data']['status'] ?? 'unknown';
        $amount = $payload['data']['amount'] ?? '0';

        $eventId = $request->header('x-alya-event-id', hash('sha256', $transactionId . $status . $amount));

        try {
            $this->paymentService->handleWebhook($payload, $eventId);
            return response('', 200);
        } catch (\Exception $e) {
            Log::error('AlyaPay webhook processing failed', ['error' => $e->getMessage()]);
            return response('Error processing webhook', 500);
        }
    }
}
