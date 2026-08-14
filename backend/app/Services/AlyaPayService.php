<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Exception;

class AlyaPayService
{
    protected $baseUrl;
    protected $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('alyapay.base_url');
        $this->apiKey = config('alyapay.api_key');
        
        if (!$this->baseUrl || !$this->apiKey) {
            throw new Exception('AlyaPay configuration is missing (base_url or api_key).');
        }
    }

    protected function client()
    {
        return Http::withHeaders([
            'X-Service-Key' => $this->apiKey,
            'X-API-Key' => $this->apiKey, // Passing both to ensure compatibility
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ])->baseUrl($this->baseUrl)
          ->retry(3, 200);
    }

    /**
     * Create a new transaction in AlyaPay
     */
    public function createTransaction(array $payload)
    {
        $response = $this->client()->post('/public/partner/transactions', $payload);

        if (!$response->successful()) {
            throw new Exception('AlyaPay createTransaction failed: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Generate checkout link for a transaction
     */
    public function generateCheckoutLink(string $vendorReference)
    {
        $response = $this->client()->post("/public/partner/transactions/vendor/{$vendorReference}/checkout-link");

        if (!$response->successful()) {
            throw new Exception('AlyaPay generateCheckoutLink failed: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Get transaction status
     */
    public function getTransaction(string $vendorReference)
    {
        $response = $this->client()->get("/public/partner/transactions/vendor/{$vendorReference}");

        if (!$response->successful()) {
            throw new Exception('AlyaPay getTransaction failed: ' . $response->body());
        }

        return $response->json();
    }
}
