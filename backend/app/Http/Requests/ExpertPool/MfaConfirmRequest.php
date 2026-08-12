<?php

namespace App\Http\Requests\ExpertPool;

use Illuminate\Foundation\Http\FormRequest;

class MfaConfirmRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'digits:6'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.digits' => 'The verification code must be exactly 6 digits.',
        ];
    }
}
