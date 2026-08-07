<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Brand extends Model {
    protected $fillable = ['name', 'slug'];
    public function series() { return $this->hasMany(Series::class); }
    public function products() { return $this->hasMany(Product::class); }
}
