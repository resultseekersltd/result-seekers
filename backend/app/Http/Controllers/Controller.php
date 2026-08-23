<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

/**
 * AuthorizesRequests adds $this->authorize() (Phase 1's Policy-based
 * checks — OrganisationPolicy, TalentRequestPolicy, VerificationCasePolicy)
 * without changing anything for existing controllers, none of which
 * previously called it.
 */
abstract class Controller
{
    use AuthorizesRequests;
}
