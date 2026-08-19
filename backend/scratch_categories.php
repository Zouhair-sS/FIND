<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$categories = \App\Models\Category::all();
foreach($categories as $c) {
    echo $c->id . ': ' . $c->name . ' (parent: ' . $c->parent_id . ")\n";
}
