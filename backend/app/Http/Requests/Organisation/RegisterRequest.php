<?php

namespace App\Http\Requests\Organisation;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Self-registration with a verification gate (approved Phase 1 scope
 * decision). Collects both the organisation record and its first
 * Organisation Representative user in one step — the organisation is
 * created with status = pending_verification (never auto-verified) and
 * the user must still verify their own email before logging in, mirroring
 * ExpertPool\RegisterRequest's pattern exactly.
 */
class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Organisation
            'organisation_name' => ['required', 'string', 'max:255'],
            'legal_name' => ['nullable', 'string', 'max:255'],
            'organisation_type' => ['nullable', 'string', 'max:255'],
            'sector' => ['nullable', 'string', 'max:255'],
            'country' => ['nullable', 'string', 'max:255'],
            'state' => ['nullable', 'string', 'max:255'],
            'registered_address' => ['nullable', 'string'],
            'website' => ['nullable', 'string', 'max:255'],
            'registration_number' => ['nullable', 'string', 'max:255'],
            'profile_description' => ['nullable', 'string'],
            'recruitment_needs' => ['nullable', 'string'],
            'terms_agreed' => ['required', 'accepted'],

            // First Organisation Representative user
            'contact_name' => ['required', 'string', 'max:255'],
            'contact_position' => ['nullable', 'string', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:organisation_users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'An organisation account with that email already exists.',
            'terms_agreed.accepted' => 'You must agree to the organisation terms to register.',
        ];
    }
}
