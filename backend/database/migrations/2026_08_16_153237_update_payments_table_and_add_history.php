<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Non-destructive duplicate cleanup before unique constraints
        // Safely remove duplicates by keeping only the latest row for any duplicate alyapay_transaction_id or webhook_event_id
        DB::delete('DELETE FROM payments WHERE alyapay_transaction_id IS NOT NULL AND id NOT IN (SELECT MAX(id) FROM payments WHERE alyapay_transaction_id IS NOT NULL GROUP BY alyapay_transaction_id)');
        DB::delete('DELETE FROM payments WHERE webhook_event_id IS NOT NULL AND id NOT IN (SELECT MAX(id) FROM payments WHERE webhook_event_id IS NOT NULL GROUP BY webhook_event_id)');
        
        // 2. Clean up null responses for JSON conversion safety
        DB::statement("UPDATE payments SET raw_response = '{}' WHERE raw_response IS NULL");

        Schema::table('payments', function (Blueprint $table) {
            $table->string('environment')->default('sandbox')->after('provider');
            $table->unique('alyapay_transaction_id');
            $table->unique('webhook_event_id');
        });

        Schema::create('order_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('status');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_status_history');
        
        Schema::table('payments', function (Blueprint $table) {
            $table->dropUnique(['alyapay_transaction_id']);
            $table->dropUnique(['webhook_event_id']);
            $table->dropColumn('environment');
        });
    }
};
