import os

models = {
    'Brand.php': """<?php
namespace App\\Models;
use Illuminate\\Database\\Eloquent\\Model;

class Brand extends Model {
    protected $fillable = ['name', 'slug'];
    public function series() { return $this->hasMany(Series::class); }
    public function products() { return $this->hasMany(Product::class); }
}
""",
    'Series.php': """<?php
namespace App\\Models;
use Illuminate\\Database\\Eloquent\\Model;

class Series extends Model {
    protected $fillable = ['brand_id', 'name', 'slug'];
    public function brand() { return $this->belongsTo(Brand::class); }
    public function products() { return $this->hasMany(Product::class); }
}
""",
    'Attribute.php': """<?php
namespace App\\Models;
use Illuminate\\Database\\Eloquent\\Model;

class Attribute extends Model {
    protected $fillable = ['name', 'slug'];
    public function values() { return $this->hasMany(AttributeValue::class); }
}
""",
    'AttributeValue.php': """<?php
namespace App\\Models;
use Illuminate\\Database\\Eloquent\\Model;

class AttributeValue extends Model {
    protected $fillable = ['attribute_id', 'value'];
    public function attribute() { return $this->belongsTo(Attribute::class); }
    public function products() { return $this->belongsToMany(Product::class, 'product_attribute_values'); }
}
""",
    'Collection.php': """<?php
namespace App\\Models;
use Illuminate\\Database\\Eloquent\\Model;

class Collection extends Model {
    protected $fillable = ['name', 'slug', 'description', 'cover_image', 'is_featured', 'sort_order'];
    public function products() { return $this->belongsToMany(Product::class, 'collection_product'); }
}
""",
    'Category.php': """<?php
namespace App\\Models;
use Illuminate\\Database\\Eloquent\\Model;

class Category extends Model {
    protected $fillable = ['parent_id', 'name', 'slug', 'description', 'image_url', 'icon', 'banner', 'sort_order'];
    public function products() { return $this->hasMany(Product::class); }
    public function parent() { return $this->belongsTo(Category::class, 'parent_id'); }
    public function children() { return $this->hasMany(Category::class, 'parent_id'); }
}
""",
    'Product.php': """<?php
namespace App\\Models;
use Illuminate\\Database\\Eloquent\\Model;

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
"""
}

base_dir = 'c:/PROJECT/FIND/backend/app/Models'
for filename, content in models.items():
    with open(os.path.join(base_dir, filename), 'w') as f:
        f.write(content)
