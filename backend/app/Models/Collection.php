<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Collection extends Model {
    protected $fillable = ['name', 'slug', 'description', 'cover_image', 'is_featured', 'sort_order'];
    public function products() { return $this->belongsToMany(Product::class, 'collection_product'); }
}
