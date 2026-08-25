<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HasPaginatedResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    use HasPaginatedResponse;

    public function index(): JsonResponse
    {
        return $this->paginatedResponse(Product::query()->orderBy('order')->paginate(25), ProductResource::class);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json(['data' => new ProductResource($product)]);
    }

    public function store(ProductRequest $request): JsonResponse
    {
        $product = Product::create($request->validated());
        AuditLogger::log('product.created', $product, $request->validated());

        return response()->json(['data' => new ProductResource($product)], 201);
    }

    public function update(ProductRequest $request, Product $product): JsonResponse
    {
        $product->update($request->validated());
        AuditLogger::log('product.updated', $product, $request->validated());

        return response()->json(['data' => new ProductResource($product)]);
    }

    public function destroy(Product $product): JsonResponse
    {
        AuditLogger::log('product.deleted', $product);
        $product->delete();

        return response()->json(['message' => 'Product deleted.']);
    }
}
