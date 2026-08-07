<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Product extends Model {
    protected $fillable = [
        'category_id', 'brand_id', 'series_id', 'name', 'slug', 'sku', 
        'description', 'status', 'featured', 'stock', 'rating', 'review_count', 
        'thumbnail', 'published_at'
    ];
    
    protected $casts = [
        'published_at' => 'datetime',
        'featured' => 'boolean',
    ];

    public function category() { return $this->belongsTo(Category::class); }
    public function brand() { return $this->belongsTo(Brand::class); }
    public function series() { return $this->belongsTo(Series::class); }
    public function variants() { return $this->hasMany(ProductVariant::class); }
    public function images() { return $this->hasMany(ProductImage::class)->orderBy('sort_order'); }
    public function attributeValues() { return $this->belongsToMany(AttributeValue::class, 'product_attribute_values'); }
    public function collections() { return $this->belongsToMany(Collection::class, 'collection_product'); }
}
