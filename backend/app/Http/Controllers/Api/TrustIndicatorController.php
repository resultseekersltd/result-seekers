<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TrustIndicatorResource;
use App\Models\TrustIndicator;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TrustIndicatorController extends Controller
{
    /** GET /api/trust-indicators — the active, approved trust indicators, ordered. */
    public function index(): AnonymousResourceCollection
    {
        $indicators = TrustIndicator::query()
            ->where('is_active', true)
            ->orderBy('order')
            ->get();

        return TrustIndicatorResource::collection($indicators);
    }
}
