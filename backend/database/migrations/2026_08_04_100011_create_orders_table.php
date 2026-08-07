<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

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
