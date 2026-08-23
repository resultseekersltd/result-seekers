<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SolutionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $solution = $this->route('solution');

        return [
            'slug' => ['required', 'string', 'max:255', Rule::unique('solutions', 'slug')->ignore($solution)],
            'name' => ['required', 'string', 'max:255'],
            'summary' => ['required', 'string'],
            'icon' => ['nullable', 'string', 'max:255'],
            'hero_heading' => ['nullable', 'string', 'max:255'],
            'hero_description' => ['nullable', 'string'],
            'problem_statement' => ['nullable', 'string'],
            'our_approach' => ['nullable', 'string'],
            'services' => ['nullable', 'array'],
            'services.*' => ['string', 'max:255'],
            'outputs' => ['nullable', 'array'],
            'outputs.*' => ['string', 'max:255'],
            'tools' => ['nullable', 'array'],
            'tools.*' => ['string', 'max:255'],
            'order' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
