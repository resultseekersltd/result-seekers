<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    /** GET /api/products — the product catalogue, for nav/listing use. */
    public function index(): AnonymousResourceCollection
    {
        $products = Product::query()
            ->where('is_active', true)
            ->orderBy('order')
            ->get();

        return ProductResource::collection($products);
    }

    /** GET /api/products/{product} — resolved by slug (Product::getRouteKeyName()). */
    public function show(Product $product): ProductResource
    {
        abort_if(! $product->is_active, 404);

        $product->load('solutions');

        return new ProductResource($product);
    }
}
