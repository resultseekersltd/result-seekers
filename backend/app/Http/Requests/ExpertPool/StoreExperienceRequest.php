<?php

namespace App\Http\Requests\ExpertPool;

use Illuminate\Foundation\Http\FormRequest;

class StoreExperienceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'organization' => ['required', 'string', 'max:255'],
            'job_title' => ['required', 'string', 'max:255'],
            'country' => ['sometimes', 'nullable', 'string', 'max:100'],
            'start_date' => ['required', 'date', 'before_or_equal:today'],
            'end_date' => ['sometimes', 'nullable', 'date', 'after_or_equal:start_date', 'before_or_equal:today'],
            'is_current' => ['sometimes', 'boolean'],
            'description' => ['sometimes', 'nullable', 'string', 'max:3000'],
        ];
    }
}
