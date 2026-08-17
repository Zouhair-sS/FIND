<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'order_number', 'vendor_reference', 'status', 'subtotal',
        'shipping_cost', 'total_amount', 'currency', 'customer_first_name',
        'customer_last_name', 'customer_phone', 'customer_email', 'shipping_address',
        'shipping_city', 'billing_address', 'payment_status', 'payment_method'
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function statusHistory()
    {
        return $this->hasMany(OrderStatusHistory::class);
    }
}
