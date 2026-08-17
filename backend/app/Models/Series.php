<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Series extends Model {
    protected $fillable = ['brand_id', 'category_id', 'name', 'slug'];
    public function brand() { return $this->belongsTo(Brand::class); }
    public function category() { return $this->belongsTo(Category::class); }
    public function products() { return $this->hasMany(Product::class); }
}
