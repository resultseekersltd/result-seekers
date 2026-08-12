<?php

namespace App\Enums;

/**
 * One `contact_submissions` table, scoped by type, covering the five
 * enquiry pathways from 03_Feature_Specification.md §14 (Consultation
 * Bookings and Newsletter are deliberately separate tables/models).
 */
enum ContactSubmissionType: string
{
    case General = 'general';
    case Proposal = 'proposal';
    case Partnership = 'partnership';
    case Product = 'product';
    case Training = 'training';
}
