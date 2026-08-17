<?php

return [
    'base_url' => env('ALYAPAY_BASE_URL', 'https://sandbox-api.alyapay.com/api/v1'),
    'api_key' => env('ALYAPAY_API_KEY'),
    'webhook_secret' => env('ALYAPAY_WEBHOOK_SECRET'),
    'environment' => env('ALYAPAY_ENVIRONMENT', 'sandbox'),
];
