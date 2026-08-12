<?php

namespace App\Http\Controllers\Api;

use App\Enums\NewsletterStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNewsletterSubscriberRequest;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;

class NewsletterSubscriberController extends Controller
{
    public function store(StoreNewsletterSubscriberRequest $request): JsonResponse
    {
        $subscriber = NewsletterSubscriber::where('email', $request->validated('email'))->first();

        if ($subscriber) {
            if ($subscriber->status !== NewsletterStatus::Subscribed) {
                $subscriber->update([
                    'status' => NewsletterStatus::Subscribed,
                    'subscribed_at' => now(),
                    'unsubscribed_at' => null,
                ]);
            }

            return response()->json([
                'message' => 'Thank you! You are subscribed to our newsletter.',
            ], 200);
        }

        NewsletterSubscriber::create([
            'email' => $request->validated('email'),
            'status' => NewsletterStatus::Subscribed,
            'subscribed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Thank you for subscribing to the Result Seekers newsletter!',
        ], 201);
    }
}
