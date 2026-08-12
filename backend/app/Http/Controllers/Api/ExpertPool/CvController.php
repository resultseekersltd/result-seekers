<?php

namespace App\Http\Controllers\Api\ExpertPool;

use App\Http\Controllers\Controller;
use App\Http\Requests\ExpertPool\UploadCvRequest;
use App\Models\ExpertUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CvController extends Controller
{
    /**
     * Upload or replace the expert's CV.
     * Files are stored on the private 'local' disk (storage/app/private)
     * so they are never directly accessible via a public URL.
     */
    public function upload(UploadCvRequest $request): JsonResponse
    {
        /** @var ExpertUser $user */
        $user = $request->user();
        $profile = $user->profile()->firstOrFail();

        // Delete the old file if one exists.
        if ($profile->cv_path) {
            Storage::disk('local')->delete($profile->cv_path);
        }

        $file = $request->file('cv');
        $extension = $file->getClientOriginalExtension();
        $safeName = 'expert-cvs/'.$user->id.'/'.Str::uuid().'.'.$extension;
        $originalName = $file->getClientOriginalName();

        Storage::disk('local')->putFileAs(
            dirname($safeName),
            $file,
            basename($safeName)
        );

        $profile->update([
            'cv_path' => $safeName,
            'cv_original_name' => $originalName,
            'cv_uploaded_at' => now(),
        ]);

        return response()->json([
            'message' => 'CV uploaded successfully.',
            'cv_original_name' => $originalName,
            'cv_uploaded_at' => $profile->fresh()->cv_uploaded_at?->toIso8601String(),
        ]);
    }

    /**
     * Stream the expert's own CV as a download.
     * The file is served through PHP — never exposed through a public URL.
     */
    public function download(Request $request): mixed
    {
        /** @var ExpertUser $user */
        $user = $request->user();
        $profile = $user->profile()->firstOrFail();

        if (! $profile->cv_path || ! Storage::disk('local')->exists($profile->cv_path)) {
            return response()->json(['message' => 'No CV found.'], 404);
        }

        return Storage::disk('local')->download(
            $profile->cv_path,
            $profile->cv_original_name ?? 'cv.'.pathinfo($profile->cv_path, PATHINFO_EXTENSION)
        );
    }

    /**
     * Delete the expert's CV.
     */
    public function destroy(Request $request): JsonResponse
    {
        /** @var ExpertUser $user */
        $user = $request->user();
        $profile = $user->profile()->firstOrFail();

        if (! $profile->cv_path) {
            return response()->json(['message' => 'No CV to delete.'], 404);
        }

        Storage::disk('local')->delete($profile->cv_path);

        $profile->update([
            'cv_path' => null,
            'cv_original_name' => null,
            'cv_uploaded_at' => null,
        ]);

        return response()->json(['message' => 'CV deleted successfully.']);
    }
}
