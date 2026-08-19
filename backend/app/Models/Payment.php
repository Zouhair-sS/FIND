<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'order_id', 'provider', 'alyapay_transaction_id', 'alyapay_order_reference',
        'vendor_reference', 'amount', 'currency', 'status', 'payment_method', 
        'webhook_event_id', 'raw_response', 'environment', 'checkout_url', 'verified_at'
    ];

    protected $hidden = [
        'raw_response'
    ];

    protected $casts = [
        'verified_at' => 'datetime',
        'raw_response' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
