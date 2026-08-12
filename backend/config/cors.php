<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Explicitly scoped to the Next.js frontend (FRONTEND_URL) rather than
    | the framework's wildcard "*" default — the wildcard also can't be
    | combined with supports_credentials, which Phase 3's Sanctum
    | SPA-cookie admin auth will need, so this is set up correctly now
    | rather than having to be revisited later.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
