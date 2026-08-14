<?php
$vendorReference = 'TEST-' . time();
$payload = [
    'vendorReference' => $vendorReference,
    'total' => 1000.0,
    'customerPhone' => '0600000000',
    'currency' => 'MAD',
    'items' => [
        [
            'reference' => 'ITEM1',
            'name' => 'Test Item',
            'quantity' => 1,
            'unitPrice' => 1000.0
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
echo "Create Transaction HTTP Status: " . $httpcode . "\n";
echo "Create Transaction Response: " . $response . "\n\n";

if ($httpcode >= 200 && $httpcode < 300) {
    $ch2 = curl_init("https://sandbox-api.alyapay.com/api/v1/public/partner/transactions/vendor/{$vendorReference}/checkout-link");
    curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch2, CURLOPT_HTTPHEADER, [
        'X-API-Key: sk_test_4663221e-6b77-4dcd-8557-a7a7b00d5efc_DI13hwIwKNr2hNod_36f1cc5a.61K47gNPL6rffwRzXBPYG2w5Y2uYN2eg',
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    curl_setopt($ch2, CURLOPT_POST, true);
    $response2 = curl_exec($ch2);
    $httpcode2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
    echo "Checkout Link HTTP Status: " . $httpcode2 . "\n";
    echo "Checkout Link Response: " . $response2 . "\n";
}
