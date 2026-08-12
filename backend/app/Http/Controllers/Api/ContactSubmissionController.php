<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactSubmissionRequest;
use App\Models\ContactSubmission;
use Illuminate\Http\JsonResponse;

class ContactSubmissionController extends Controller
{
    public function store(StoreContactSubmissionRequest $request): JsonResponse
    {
        $submission = ContactSubmission::create($request->validated());

        return response()->json([
            'message' => 'Thank you for getting in touch! We have received your enquiry and will respond shortly.',
            'id' => $submission->id,
        ], 201);
    }
}
