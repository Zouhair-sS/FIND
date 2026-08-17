<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Seed a dedicated admin account.
     * Idempotent: safe to run multiple times.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'FIND Admin',
                'password' => Hash::make('admin1234'),
                'role' => 'admin',
            ]
        );

        $this->command->info('Admin account seeded: admin@gmail.com');
    }
}
