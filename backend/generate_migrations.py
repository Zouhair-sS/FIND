import os

migrations = {
    '2026_08_04_100000_create_brands_table.php': """<?php
use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('brands'); }
};
""",
    '2026_08_04_100001_create_series_table.php': """<?php
use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('series', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brand_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('series'); }
};
""",
    '2026_08_04_100002_create_categories_table.php': """<?php
use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image_url')->nullable();
            $table->string('icon')->nullable();
            $table->string('banner')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('categories'); }
};
""",
    '2026_08_04_100003_create_attributes_table.php': """<?php
use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('attributes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('attributes'); }
};
""",
    '2026_08_04_100004_create_attribute_values_table.php': """<?php
use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('attribute_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attribute_id')->constrained()->cascadeOnDelete();
            $table->string('value');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('attribute_values'); }
};
""",
    '2026_08_04_100005_create_products_table.php': """<?php
use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('brand_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('series_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('sku')->nullable()->unique();
            $table->text('description')->nullable();
            $table->enum('status', ['active', 'draft', 'archived'])->default('active');
            $table->boolean('featured')->default(false);
            $table->integer('stock')->default(0);
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('review_count')->default(0);
            $table->string('thumbnail')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('products'); }
};
""",
    '2026_08_04_100006_create_product_attribute_values_table.php': """<?php
use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('product_attribute_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('attribute_value_id')->constrained()->cascadeOnDelete();
            $table->unique(['product_id', 'attribute_value_id']);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('product_attribute_values'); }
};
""",
    '2026_08_04_100007_create_collections_table.php': """<?php
use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('collections', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('cover_image')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('collections'); }
};
""",
    '2026_08_04_100008_create_collection_product_table.php': """<?php
use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('collection_product', function (Blueprint $table) {
            $table->foreignId('collection_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->primary(['collection_id', 'product_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('collection_product'); }
};
""",
    '2026_08_04_100009_create_product_variants_table.php': """<?php
use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->string('sku')->unique();
            $table->decimal('price', 10, 2);
            $table->integer('stock_quantity')->default(0);
            $table->integer('ram_gb')->nullable();
            $table->integer('storage_gb')->nullable();
            $table->decimal('screen_size', 4, 1)->nullable();
            $table->string('color')->nullable();
            $table->string('processor')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('product_variants'); }
};
""",
    '2026_08_04_100010_create_product_images_table.php': """<?php
use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->string('url');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('product_images'); }
};
""",
    '2026_08_04_100011_create_orders_table.php': """<?php
use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('order_number')->unique();
            $table->string('status')->default('pending');
            $table->decimal('total_amount', 10, 2);
            $table->string('shipping_address')->nullable();
            $table->string('billing_address')->nullable();
            $table->string('payment_status')->default('unpaid');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('orders'); }
};
""",
    '2026_08_04_100012_create_order_items_table.php': """<?php
use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_variant_id')->constrained()->onDelete('cascade');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('order_items'); }
};
"""
}

base_dir = 'c:/PROJECT/FIND/backend/database/migrations'
for filename, content in migrations.items():
    with open(os.path.join(base_dir, filename), 'w') as f:
        f.write(content)
