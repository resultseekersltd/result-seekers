<?php

namespace App\Http\Requests\ExpertPool;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEducationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'institution' => ['sometimes', 'string', 'max:255'],
            'qualification' => ['sometimes', 'string', 'max:255'],
            'field_of_study' => ['sometimes', 'nullable', 'string', 'max:255'],
            'start_year' => ['sometimes', 'integer', 'min:1940', 'max:'.(date('Y') + 1)],
            'end_year' => ['sometimes', 'nullable', 'integer', 'min:1940', 'max:'.(date('Y') + 5), 'gte:start_year'],
            'country' => ['sometimes', 'nullable', 'string', 'max:100'],
        ];
    }
}
