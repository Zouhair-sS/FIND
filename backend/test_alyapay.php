<?php
$payload = [
    'customerPhone' => '0665394374',
    'total' => 10490,
    'currency' => 'MAD',
    'vendorReference' => 'FIND-ORD-20260813-5VBQ',
    'items' => [
        [
            'name' => 'Samsung Odyssey OLED G8 27" - SAM-G81--SIL',
            'reference' => 'SAM-G81--SIL',
            'quantity' => 1,
            'unitPrice' => 10490
        ]
    ]
];
$ch = curl_init('https://sandbox-api.alyapay.com/api/v1/public/partner/transactions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'X-API-Key: sk_test_4663221e-6b77-4dcd-8557-a7a7b00d5efc_DI13hwIwKNr2hNod_36f1cc5a.61K47gNPL6rffwRzXBPYG2w5Y2uYN2eg',
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
echo "HTTP Status: " . $httpcode . "\n";
echo "Response: " . $response . "\n";
