<?php

namespace App\Http\Requests\ExpertPool;

use Illuminate\Foundation\Http\FormRequest;

/** Mirrors UploadCvRequest's exact validation shape — closes the Phase 3 "assessment file submission isn't wired to real storage" gap. */
class UploadAssessmentFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $maxMb = (int) env('ASSESSMENT_FILE_MAX_MB', 10);

        return [
            'response_text' => ['nullable', 'string'],
            'answers' => ['nullable', 'array'],
            'file' => [
                'nullable',
                'file',
                'mimes:pdf,doc,docx,zip',
                'max:'.($maxMb * 1024),
            ],
        ];
    }

    public function messages(): array
    {
        $maxMb = (int) env('ASSESSMENT_FILE_MAX_MB', 10);

        return [
            'file.mimes' => 'File must be a PDF, DOC, DOCX, or ZIP file.',
            'file.max' => "File must not exceed {$maxMb} MB.",
        ];
    }
}
