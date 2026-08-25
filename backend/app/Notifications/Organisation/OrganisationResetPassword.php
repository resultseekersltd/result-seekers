<?php

namespace App\Notifications\Organisation;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * Mirrors App\Notifications\ExpertPool\ExpertResetPassword exactly, pointed
 * at the Organisation frontend route instead.
 */
class OrganisationResetPassword extends ResetPassword
{
    public function toMail(mixed $notifiable): MailMessage
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');

        $url = $frontendUrl.'/organisation/reset-password?'.http_build_query([
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ]);

        return (new MailMessage)
            ->subject('Reset your Result Seekers organisation account password')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('You are receiving this email because we received a password reset request for your organisation account.')
            ->action('Reset Password', $url)
            ->line('This password reset link expires in 60 minutes.')
            ->line('If you did not request a password reset, no further action is required.');
    }
}
