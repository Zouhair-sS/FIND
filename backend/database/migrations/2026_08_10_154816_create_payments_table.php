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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('provider')->default('alyapay');
            $table->string('alyapay_transaction_id')->nullable();
            $table->string('alyapay_order_reference')->nullable();
            $table->string('vendor_reference');
            $table->text('checkout_url')->nullable();
            $table->string('status')->default('pending');
            $table->decimal('amount', 10, 2);
            $table->string('currency')->default('MAD');
            $table->string('webhook_event_id')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->text('raw_response')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
