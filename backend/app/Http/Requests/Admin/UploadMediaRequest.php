<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UploadMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // 5MB max, real image types only — never trusts the client-sent MIME string alone
            // (Laravel's `mimes`/`image` rules sniff the actual file content).
            'file' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,svg', 'max:5120'],
            'alt_text' => ['nullable', 'string', 'max:255'],
        ];
    }
}
