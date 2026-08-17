<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;

use App\Http\Controllers\Api\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::post('/admin/login', [AuthController::class, 'adminLogin']);
Route::post('/admin/logout', [AuthController::class, 'adminLogout'])->middleware('auth:sanctum');

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/orders', [App\Http\Controllers\Api\CheckoutController::class, 'getUserOrders']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);
});

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

use App\Http\Controllers\Api\AdminController;

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'getDashboard']);
    Route::get('/orders', [AdminController::class, 'getOrders']);
    Route::get('/orders/{id}', [AdminController::class, 'getOrder']);
    Route::delete('/orders/{id}', [AdminController::class, 'deleteOrder']);
    Route::get('/payments', [AdminController::class, 'getPayments']);
    Route::put('/orders/{id}/status', [AdminController::class, 'updateOrderStatus']);
    
    // Metadata
    Route::get('/metadata', [\App\Http\Controllers\Api\Admin\MetadataController::class, 'getMetadata']);

    // Products (grouped by storefront identity)
    Route::get('/products', [\App\Http\Controllers\Api\Admin\ProductController::class, 'index']);
    Route::post('/products', [\App\Http\Controllers\Api\Admin\ProductController::class, 'store']);
    Route::get('/products/{id}', [\App\Http\Controllers\Api\Admin\ProductController::class, 'show']);
    Route::put('/products/{id}', [\App\Http\Controllers\Api\Admin\ProductController::class, 'update']);
    Route::delete('/products/{id}', [\App\Http\Controllers\Api\Admin\ProductController::class, 'destroy']);

    // Configurations (within a product group)
    Route::post('/products/{id}/configurations', [\App\Http\Controllers\Api\Admin\ProductController::class, 'addConfiguration']);
    Route::delete('/products/configurations/{configId}', [\App\Http\Controllers\Api\Admin\ProductController::class, 'deleteConfiguration']);

    // Variants (per-configuration)
    Route::post('/products/configurations/{configId}/variants', [\App\Http\Controllers\Api\Admin\ProductController::class, 'storeVariant']);
    Route::put('/products/variants/{variantId}', [\App\Http\Controllers\Api\Admin\ProductController::class, 'updateVariant']);
    Route::delete('/products/variants/{variantId}', [\App\Http\Controllers\Api\Admin\ProductController::class, 'destroyVariant']);

    // Images (per-configuration)
    Route::post('/products/configurations/{configId}/images', [\App\Http\Controllers\Api\Admin\ProductController::class, 'uploadImage']);
    Route::delete('/products/images/{imageId}', [\App\Http\Controllers\Api\Admin\ProductController::class, 'deleteImage']);
    Route::put('/products/configurations/{configId}/images/reorder', [\App\Http\Controllers\Api\Admin\ProductController::class, 'reorderImages']);
    // Profile
    Route::get('/profile', [\App\Http\Controllers\Api\Admin\ProfileController::class, 'getProfile']);
    Route::post('/profile', [\App\Http\Controllers\Api\Admin\ProfileController::class, 'updateProfile']);
});
