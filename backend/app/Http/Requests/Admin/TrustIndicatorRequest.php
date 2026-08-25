<?php

namespace App\Http\Requests\Admin;

use App\Enums\TrustIndicatorType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class TrustIndicatorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', new Enum(TrustIndicatorType::class)],
            'value' => ['nullable', 'integer', 'min:0'],
            'suffix' => ['nullable', 'string', 'max:50'],
            'label' => ['required', 'string', 'max:255'],
            'order' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
