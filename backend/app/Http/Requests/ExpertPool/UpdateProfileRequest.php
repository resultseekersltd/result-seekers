<?php

namespace App\Http\Requests\ExpertPool;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Auth enforced at route level via middleware.
    }

    public function rules(): array
    {
        return [
            // Personal
            'preferred_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'country' => ['sometimes', 'nullable', 'string', 'max:100'],
            'state' => ['sometimes', 'nullable', 'string', 'max:100'],
            'city' => ['sometimes', 'nullable', 'string', 'max:100'],

            // Professional
            'professional_title' => ['sometimes', 'nullable', 'string', 'max:255'],
            'current_organization' => ['sometimes', 'nullable', 'string', 'max:255'],
            'years_experience' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:60'],
            'highest_qualification' => ['sometimes', 'nullable', 'string', 'max:255'],
            'field_of_study' => ['sometimes', 'nullable', 'string', 'max:255'],
            'bio' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'skills' => ['sometimes', 'nullable', 'array'],
            'skills.*' => ['string', 'max:100'],
            'industries' => ['sometimes', 'nullable', 'array'],
            'industries.*' => ['string', 'max:100'],
            'languages' => ['sometimes', 'nullable', 'array'],
            'languages.*' => ['string', 'max:100'],
            'certifications' => ['sometimes', 'nullable', 'array'],
            'certifications.*' => ['string', 'max:255'],

            // Disciplines (array of IDs from expert_disciplines)
            'discipline_ids' => ['sometimes', 'nullable', 'array'],
            'discipline_ids.*' => ['integer', 'exists:expert_disciplines,id'],
        ];
    }
}
