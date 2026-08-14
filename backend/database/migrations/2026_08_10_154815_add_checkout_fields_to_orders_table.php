<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('vendor_reference')->nullable()->unique()->after('order_number');
            $table->decimal('subtotal', 10, 2)->default(0)->after('status');
            $table->decimal('shipping_cost', 10, 2)->default(0)->after('subtotal');
            $table->string('currency')->default('MAD')->after('total_amount');
            $table->string('customer_first_name')->nullable()->after('currency');
            $table->string('customer_last_name')->nullable()->after('customer_first_name');
            $table->string('customer_phone')->nullable()->after('customer_last_name');
            $table->string('customer_email')->nullable()->after('customer_phone');
            $table->string('shipping_city')->nullable()->after('shipping_address');
            $table->string('payment_method')->nullable()->after('payment_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            //
        });
    }
};
