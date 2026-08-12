<?php

namespace App\Http\Requests\ExpertPool;

use Illuminate\Foundation\Http\FormRequest;

class MfaVerifyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Either a 6-digit TOTP code OR a recovery code (8 chars, alphanumeric).
            'code' => ['required', 'string'],
            'recovery_mode' => ['sometimes', 'boolean'],
        ];
    }
}
