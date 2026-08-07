<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

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
