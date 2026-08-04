<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'customer_name', 'customer_email', 'customer_phone',
        'customer_address', 'payment_method', 'payment_status', 'total_amount'
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
