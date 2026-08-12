<?php

namespace App\Notifications\ExpertPool;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

/**
 * Overrides Laravel's default VerifyEmail so the signed URL resolves to the
 * Next.js frontend (/expert-pool/verify-email?...) rather than the Laravel
 * web route, which does not exist in this project.
 *
 * The ExpertUser model calls $this->notify(new ExpertVerifyEmail) from its
 * sendEmailVerificationNotification() override.
 */
class ExpertVerifyEmail extends VerifyEmail
{
    /**
     * Build the signed verification URL pointed at the Next.js frontend.
     * Next.js will forward the parameters to the BFF /api/expert-pool/auth/verify-email
     * endpoint which then calls Laravel's /api/expert-pool/email/verify/{id}/{hash}.
     */
    protected function verificationUrl(mixed $notifiable): string
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');

        // Generate a time-limited, signed URL for Laravel's verification endpoint.
        $laravelUrl = URL::temporarySignedRoute(
            'expert-pool.verification.verify',
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );

        // Extract the query-string parameters from the signed URL so we can
        // pass them as query params to the Next.js frontend page.
        $parsed = parse_url($laravelUrl);
        parse_str($parsed['query'] ?? '', $params);

        $params['id'] = $notifiable->getKey();
        $params['hash'] = sha1($notifiable->getEmailForVerification());

        return $frontendUrl.'/expert-pool/verify-email?'.http_build_query($params);
    }

    public function toMail(mixed $notifiable): MailMessage
    {
        $url = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Verify your Expert Pool email')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('Click the button below to verify your email address and activate your Expert Pool account.')
            ->action('Verify Email Address', $url)
            ->line('This link expires in 60 minutes.')
            ->line('If you did not create an Expert Pool account, no further action is required.');
    }
}
