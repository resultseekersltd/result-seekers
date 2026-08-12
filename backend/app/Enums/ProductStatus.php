<?php

namespace App\Enums;

/**
 * Matches the exact statuses used in 05_Content_and_Product_Specification.md
 * ("Operational" / "Under Active Development" / "Concept / Under Development")
 * plus the "Future Products" showcase, which never links externally.
 */
enum ProductStatus: string
{
    case Operational = 'operational';
    case UnderDevelopment = 'under_development';
    case Concept = 'concept';
    case ComingSoon = 'coming_soon';

    public function label(): string
    {
        return match ($this) {
            self::Operational => 'Operational',
            self::UnderDevelopment => 'Under Active Development',
            self::Concept => 'Concept / Under Development',
            self::ComingSoon => 'Coming Soon',
        };
    }
}
