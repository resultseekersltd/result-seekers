<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreConsultationBookingRequest;
use App\Models\ConsultationBooking;
use Illuminate\Http\JsonResponse;

class ConsultationBookingController extends Controller
{
    public function store(StoreConsultationBookingRequest $request): JsonResponse
    {
        $booking = ConsultationBooking::create($request->validated());

        return response()->json([
            'message' => 'Your consultation booking request has been submitted successfully. Our team will contact you shortly to confirm details.',
            'id' => $booking->id,
        ], 201);
    }
}
