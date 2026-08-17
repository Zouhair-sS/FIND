<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    protected $fillable = [
        'product_id', 'product_image_id', 'sku', 'price', 'stock_quantity', 'ram_gb',
        'storage_gb', 'screen_size', 'color', 'processor', 'attributes'
    ];

    protected $casts = [
        'attributes' => 'array',
        'price' => 'decimal:2',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function image()
    {
        return $this->belongsTo(ProductImage::class, 'product_image_id');
    }
}
