<?php

namespace App\Notifications\Organisation;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

/**
 * Mirrors App\Notifications\ExpertPool\ExpertVerifyEmail exactly, pointed
 * at the Organisation frontend route instead.
 */
class OrganisationVerifyEmail extends VerifyEmail
{
    protected function verificationUrl(mixed $notifiable): string
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');

        $laravelUrl = URL::temporarySignedRoute(
            'organisation.verification.verify',
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );

        $parsed = parse_url($laravelUrl);
        parse_str($parsed['query'] ?? '', $params);

        $params['id'] = $notifiable->getKey();
        $params['hash'] = sha1($notifiable->getEmailForVerification());

        return $frontendUrl.'/organisation/verify-email?'.http_build_query($params);
    }

    public function toMail(mixed $notifiable): MailMessage
    {
        $url = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Verify your Result Seekers organisation account email')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('Click the button below to verify your email address and continue your organisation\'s registration.')
            ->action('Verify Email Address', $url)
            ->line('This link expires in 60 minutes.')
            ->line('If you did not request this, no further action is required.');
    }
}
