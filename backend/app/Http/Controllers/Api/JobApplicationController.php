<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreJobApplicationRequest;
use App\Models\JobApplication;
use Illuminate\Http\JsonResponse;

class JobApplicationController extends Controller
{
    public function store(StoreJobApplicationRequest $request): JsonResponse
    {
        $file = $request->file('cv_file');

        $application = JobApplication::create([
            'vacancy_id' => $request->input('vacancy_id'),
            'applicant_name' => $request->input('applicant_name'),
            'email' => $request->input('email'),
            'phone' => $request->input('phone'),
            'portfolio_url' => $request->input('portfolio_url'),
            'cv_path' => '', // Temporary placeholder, updated below
            'internal_notes' => $request->input('cover_letter') ? "Cover Letter text:\n".$request->input('cover_letter') : null,
        ]);

        $fileName = 'cv_'.time().'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs("job-applications/{$application->id}", $fileName, 'local');

        $application->update(['cv_path' => $path]);

        return response()->json([
            'message' => 'Thank you for your application! We have received your submission and will review it shortly.',
            'id' => $application->id,
        ], 201);
    }
}
