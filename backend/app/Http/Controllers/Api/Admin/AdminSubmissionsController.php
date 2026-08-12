<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ConsultationBooking;
use App\Models\ContactSubmission;
use App\Models\JobApplication;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminSubmissionsController extends Controller
{
    public function contactSubmissions(Request $request): JsonResponse
    {
        $query = ContactSubmission::with('relatedProduct')->latest();

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->has('type')) {
            $query->where('type', $request->query('type'));
        }

        return response()->json($query->paginate(20));
    }

    public function updateContactSubmission(Request $request, int $id): JsonResponse
    {
        $submission = ContactSubmission::findOrFail($id);

        $validated = $request->validate([
            'status' => ['nullable', 'string'],
            'internal_notes' => ['nullable', 'string'],
        ]);

        $submission->update(array_filter($validated, fn ($val) => ! is_null($val)));

        return response()->json($submission);
    }

    public function consultationBookings(Request $request): JsonResponse
    {
        $query = ConsultationBooking::with('relatedSolution')->latest();

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        return response()->json($query->paginate(20));
    }

    public function updateConsultationBooking(Request $request, int $id): JsonResponse
    {
        $booking = ConsultationBooking::findOrFail($id);

        $validated = $request->validate([
            'status' => ['nullable', 'string'],
            'internal_notes' => ['nullable', 'string'],
        ]);

        $booking->update(array_filter($validated, fn ($val) => ! is_null($val)));

        return response()->json($booking);
    }

    public function newsletterSubscribers(Request $request): JsonResponse
    {
        $query = NewsletterSubscriber::latest();

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        return response()->json($query->paginate(30));
    }

    public function jobApplications(Request $request): JsonResponse
    {
        $query = JobApplication::with('vacancy')->latest();

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->has('vacancy_id')) {
            $query->where('vacancy_id', $request->query('vacancy_id'));
        }

        return response()->json($query->paginate(20));
    }

    public function updateJobApplication(Request $request, int $id): JsonResponse
    {
        $application = JobApplication::findOrFail($id);

        $validated = $request->validate([
            'status' => ['nullable', 'string'],
            'internal_notes' => ['nullable', 'string'],
        ]);

        $updates = array_filter($validated, fn ($val) => ! is_null($val));
        if (array_key_exists('status', $updates)) {
            $updates['reviewed_by'] = $request->user()->id;
        }

        $application->update($updates);

        return response()->json($application);
    }

    public function downloadJobApplicationCv(int $id): StreamedResponse|JsonResponse
    {
        $application = JobApplication::findOrFail($id);

        if (! Storage::disk('local')->exists($application->cv_path)) {
            return response()->json(['message' => 'CV file not found.'], 404);
        }

        $extension = pathinfo($application->cv_path, PATHINFO_EXTENSION);
        $downloadName = 'CV_'.str_replace(' ', '_', $application->applicant_name).'.'.$extension;

        return Storage::disk('local')->download($application->cv_path, $downloadName);
    }
}
