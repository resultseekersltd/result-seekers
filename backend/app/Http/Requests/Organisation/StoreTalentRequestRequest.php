<?php

namespace App\Http\Requests\Organisation;

use Illuminate\Foundation\Http\FormRequest;

/** Fields per talent-expert.txt's "ORGANISATION TALENT REQUEST" guided form (condensed — see the TalentRequest migration docblock). */
class StoreTalentRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'service_type' => ['required', 'string', 'in:talent_hunt,managed_recruitment,project_team,rapid_deployment,executive_search,rpo'],
            'title' => ['required', 'string', 'max:255'],
            'number_required' => ['sometimes', 'integer', 'min:1'],
            'location' => ['nullable', 'string', 'max:255'],
            'arrangement' => ['nullable', 'string', 'in:remote,hybrid,onsite,field'],
            'engagement_type' => ['nullable', 'string', 'max:255'],
            'duration' => ['nullable', 'string', 'max:255'],
            'start_date' => ['nullable', 'date'],
            'deadline' => ['nullable', 'date'],
            'description' => ['required', 'string'],
            'essential_qualifications' => ['nullable', 'string'],
            'desirable_qualifications' => ['nullable', 'string'],
            'years_experience_required' => ['nullable', 'integer', 'min:0'],
            'required_skills' => ['nullable', 'array'],
            'required_skills.*' => ['string'],
            'budget_range' => ['nullable', 'string', 'max:255'],
            'confidentiality_level' => ['sometimes', 'string', 'in:standard,confidential,executive'],
            'details' => ['nullable', 'array'],
        ];
    }
}
