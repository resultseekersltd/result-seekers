<?php

namespace App\Notifications\ExpertPool;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * Overrides Laravel's default ResetPassword so the link resolves to the
 * Next.js frontend (/expert-pool/reset-password?token=...&email=...) rather
 * than the Laravel web route.
 *
 * The ExpertUser model calls $this->notify(new ExpertResetPassword($token))
 * from its sendPasswordResetNotification() override.
 */
class ExpertResetPassword extends ResetPassword
{
    /**
     * Build the mail representation of the notification.
     */
    public function toMail(mixed $notifiable): MailMessage
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');

        $url = $frontendUrl.'/expert-pool/reset-password?'.http_build_query([
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ]);

        return (new MailMessage)
            ->subject('Reset your Expert Pool password')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('You are receiving this email because we received a password reset request for your Expert Pool account.')
            ->action('Reset Password', $url)
            ->line('This password reset link expires in 60 minutes.')
            ->line('If you did not request a password reset, no further action is required.');
    }
}
