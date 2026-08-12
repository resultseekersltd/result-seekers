<?php

namespace App\Http\Requests\ExpertPool;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExperienceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'organization' => ['sometimes', 'string', 'max:255'],
            'job_title' => ['sometimes', 'string', 'max:255'],
            'country' => ['sometimes', 'nullable', 'string', 'max:100'],
            'start_date' => ['sometimes', 'date', 'before_or_equal:today'],
            'end_date' => ['sometimes', 'nullable', 'date', 'after_or_equal:start_date', 'before_or_equal:today'],
            'is_current' => ['sometimes', 'boolean'],
            'description' => ['sometimes', 'nullable', 'string', 'max:3000'],
        ];
    }
}
