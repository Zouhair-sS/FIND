<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'order_id', 'provider', 'alyapay_transaction_id', 'alyapay_order_reference',
        'vendor_reference', 'checkout_url', 'status', 'amount', 'currency',
        'webhook_event_id', 'verified_at', 'raw_response'
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
