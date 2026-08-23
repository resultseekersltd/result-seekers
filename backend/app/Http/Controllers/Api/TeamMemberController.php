<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TeamMemberResource;
use App\Models\TeamMember;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TeamMemberController extends Controller
{
    /** GET /api/team-members — active team members, for the About page's "Success Behind Result Seekers" section. */
    public function index(): AnonymousResourceCollection
    {
        $members = TeamMember::query()
            ->where('is_active', true)
            ->orderBy('order')
            ->get();

        return TeamMemberResource::collection($members);
    }
}
