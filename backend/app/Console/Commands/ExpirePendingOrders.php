<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Carbon\Carbon;
use App\Models\Order;

class ExpirePendingOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:expire';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cancel orders that have been pending for more than 30 minutes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $cutoffTime = Carbon::now()->subMinutes(30);

        $orders = Order::whereIn('status', ['pending', 'pending_payment'])
            ->where('created_at', '<', $cutoffTime)
            ->get();

        $count = 0;
        foreach ($orders as $order) {
            $order->update(['status' => 'canceled']);
            $order->statusHistory()->create([
                'status' => 'canceled',
                'notes' => 'Automatically canceled due to payment timeout'
            ]);

            // Update associated payments to failed
            $order->payments()->where('status', 'pending')->update(['status' => 'failed']);
            $count++;
        }

        $this->info("Expired $count pending orders.");
    }
}
