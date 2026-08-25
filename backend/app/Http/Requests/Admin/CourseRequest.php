<?php

namespace App\Http\Requests\Admin;

use App\Enums\CourseDeliveryMode;
use App\Enums\CourseTrack;
use App\Enums\PublicationStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class CourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $course = $this->route('course');

        return [
            'course_category_id' => ['required', 'integer', 'exists:course_categories,id'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('courses', 'slug')->ignore($course)],
            'title' => ['required', 'string', 'max:255'],
            'summary' => ['required', 'string'],
            'description' => ['nullable', 'string'],
            'track' => ['nullable', new Enum(CourseTrack::class)],
            'delivery_mode' => ['nullable', new Enum(CourseDeliveryMode::class)],
            'duration_text' => ['nullable', 'string', 'max:255'],
            'status' => ['required', new Enum(PublicationStatus::class)],
            'is_featured' => ['sometimes', 'boolean'],
            'order' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
