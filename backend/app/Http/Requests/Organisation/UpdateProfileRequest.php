<?php

namespace App\Http\Requests\Organisation;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'legal_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'trading_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'organisation_type' => ['sometimes', 'nullable', 'string', 'max:255'],
            'sector' => ['sometimes', 'nullable', 'string', 'max:255'],
            'country' => ['sometimes', 'nullable', 'string', 'max:255'],
            'state' => ['sometimes', 'nullable', 'string', 'max:255'],
            'registered_address' => ['sometimes', 'nullable', 'string'],
            'website' => ['sometimes', 'nullable', 'string', 'max:255'],
            'registration_number' => ['sometimes', 'nullable', 'string', 'max:255'],
            'profile_description' => ['sometimes', 'nullable', 'string'],
            'recruitment_needs' => ['sometimes', 'nullable', 'string'],
        ];
    }
}
