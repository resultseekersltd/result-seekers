<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TagRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tag = $this->route('tag');

        return [
            'slug' => ['required', 'string', 'max:255', Rule::unique('tags', 'slug')->ignore($tag)],
            'name' => ['required', 'string', 'max:255'],
        ];
    }
}
