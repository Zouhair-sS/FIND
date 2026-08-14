<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;

use App\Http\Controllers\Api\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);

Route::get('/products/search', [ProductController::class, 'search']);
Route::get('/products/all-with-filters', [ProductController::class, 'allWithFilters']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}/configurations', [ProductController::class, 'configurations']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\WebhookController;

Route::post('/checkout', [CheckoutController::class, 'initiateCheckout']);
Route::post('/verify-payment', [CheckoutController::class, 'verifyPayment']);
Route::get('/orders/{orderNumber}', [CheckoutController::class, 'getOrder']);

Route::post('/webhooks/alyapay', [WebhookController::class, 'handleAlyaPay']);
