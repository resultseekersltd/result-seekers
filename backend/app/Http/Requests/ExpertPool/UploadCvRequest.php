<?php

namespace App\Http\Requests\ExpertPool;

use Illuminate\Foundation\Http\FormRequest;

class UploadCvRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $maxMb = (int) env('CV_MAX_MB', 10);

        return [
            'cv' => [
                'required',
                'file',
                'mimes:pdf,doc,docx',
                'max:'.($maxMb * 1024), // Convert MB to KB for Laravel's max rule.
            ],
        ];
    }

    public function messages(): array
    {
        $maxMb = (int) env('CV_MAX_MB', 10);

        return [
            'cv.required' => 'Please select a CV file.',
            'cv.mimes' => 'CV must be a PDF, DOC, or DOCX file.',
            'cv.max' => "CV must not exceed {$maxMb} MB.",
        ];
    }
}
