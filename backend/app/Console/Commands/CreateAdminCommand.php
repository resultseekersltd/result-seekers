<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

/**
 * Admin accounts are deliberately never self-registered — only trusted
 * staff should get admin access, so provisioning is a CLI-only action.
 */
class CreateAdminCommand extends Command
{
    protected $signature = 'admin:create';

    protected $description = 'Create a new admin (Central Admin Dashboard) account';

    public function handle(): int
    {
        $name = $this->ask('Name');
        $email = $this->ask('Email');
        $password = $this->secret('Password');
        $passwordConfirmation = $this->secret('Confirm password');

        $validator = Validator::make(
            compact('name', 'email', 'password', 'passwordConfirmation'),
            [
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'unique:users,email'],
                'password' => ['required', 'string', 'min:12', 'confirmed'],
            ],
            [],
            ['passwordConfirmation' => 'password confirmation'],
        );

        // Validator's `confirmed` rule expects `password_confirmation`.
        $validator->setData([
            'name' => $name,
            'email' => $email,
            'password' => $password,
            'password_confirmation' => $passwordConfirmation,
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => $password, // 'hashed' cast handles this
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->info("Admin account created: {$user->email}");
        $this->line('MFA is mandatory — this account will be prompted to set it up on first login.');

        return self::SUCCESS;
    }
}
