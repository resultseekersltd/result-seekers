<?php

namespace Tests\Feature\ExpertPool;

use App\Models\ExpertUser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * IDOR regression coverage: one expert must never be able to read, modify,
 * or delete another expert's experience/education entries by guessing IDs.
 * Matches the ownership check already present in ExperienceController and
 * EducationController (findOwnedExperience()/findOwnedEntry()).
 */
class CrossAccountAccessTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function an_expert_cannot_view_update_or_delete_another_experts_experience(): void
    {
        $owner = ExpertUser::factory()->create();
        $ownerProfile = $owner->profile()->create([]);
        $experience = $ownerProfile->experiences()->create([
            'organization' => 'Acme Research Institute',
            'job_title' => 'Senior Analyst',
            'start_date' => '2020-01-01',
        ]);

        $intruder = ExpertUser::factory()->create();
        $intruder->profile()->create([]);
        $intruderToken = $intruder->createToken('expert-session')->plainTextToken;

        $this->withToken($intruderToken)
            ->patchJson("/api/expert-pool/experiences/{$experience->id}", ['job_title' => 'Hijacked'])
            ->assertStatus(404);

        $this->withToken($intruderToken)
            ->deleteJson("/api/expert-pool/experiences/{$experience->id}")
            ->assertStatus(404);

        // Confirm the record is genuinely untouched.
        $this->assertDatabaseHas('expert_experiences', [
            'id' => $experience->id,
            'job_title' => 'Senior Analyst',
        ]);
    }

    /** @test */
    public function an_expert_cannot_update_or_delete_another_experts_education(): void
    {
        $owner = ExpertUser::factory()->create();
        $ownerProfile = $owner->profile()->create([]);
        $education = $ownerProfile->education()->create([
            'institution' => 'University of Lagos',
            'qualification' => 'BSc Economics',
            'start_year' => 2010,
        ]);

        $intruder = ExpertUser::factory()->create();
        $intruder->profile()->create([]);
        $intruderToken = $intruder->createToken('expert-session')->plainTextToken;

        $this->withToken($intruderToken)
            ->patchJson("/api/expert-pool/education/{$education->id}", ['institution' => 'Hijacked'])
            ->assertStatus(404);

        $this->withToken($intruderToken)
            ->deleteJson("/api/expert-pool/education/{$education->id}")
            ->assertStatus(404);

        $this->assertDatabaseHas('expert_education', [
            'id' => $education->id,
            'institution' => 'University of Lagos',
        ]);
    }

    /** @test */
    public function an_expert_only_ever_sees_their_own_experiences_and_education_in_index(): void
    {
        $owner = ExpertUser::factory()->create();
        $ownerProfile = $owner->profile()->create([]);
        $ownerProfile->experiences()->create([
            'organization' => 'Owner Org',
            'job_title' => 'Owner Title',
            'start_date' => '2019-01-01',
        ]);

        $other = ExpertUser::factory()->create();
        $otherProfile = $other->profile()->create([]);
        $otherProfile->experiences()->create([
            'organization' => 'Other Org',
            'job_title' => 'Other Title',
            'start_date' => '2018-01-01',
        ]);

        $ownerToken = $owner->createToken('expert-session')->plainTextToken;
        $response = $this->withToken($ownerToken)->getJson('/api/expert-pool/experiences');

        $response->assertStatus(200)->assertJsonCount(1, 'data');
        $response->assertJsonFragment(['organization' => 'Owner Org']);
        $response->assertJsonMissing(['organization' => 'Other Org']);
    }
}
