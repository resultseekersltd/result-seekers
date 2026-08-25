<?php

namespace App\Http\Requests\Admin;

use App\Enums\VacancyStatus;
use App\Enums\VacancyType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class VacancyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $vacancy = $this->route('vacancy');

        return [
            'type' => ['required', new Enum(VacancyType::class)],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('vacancies', 'slug')->ignore($vacancy)],
            'department' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'summary' => ['required', 'string'],
            'description' => ['nullable', 'string'],
            'requirements' => ['nullable', 'array'],
            'requirements.*' => ['string', 'max:500'],
            'application_deadline' => ['nullable', 'date'],
            'status' => ['required', new Enum(VacancyStatus::class)],
            'is_featured' => ['sometimes', 'boolean'],
            'order' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
