<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreJobApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vacancy_id' => ['nullable', 'exists:vacancies,id'],
            'applicant_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'portfolio_url' => ['nullable', 'url', 'max:255'],
            'cv_file' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
            'cover_letter' => ['nullable', 'string', 'max:10000'],
        ];
    }
}
