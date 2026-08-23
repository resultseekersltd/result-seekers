"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import {
  Lightbulb,
  Package,
  Newspaper,
  GraduationCap,
  Gauge,
  Users,
  Handshake,
  Building2,
  Briefcase,
  UserSearch,
  Image as ImageIcon,
  ScrollText,
  Inbox,
} from "lucide-react";

const QUICK_LINKS = [
  { label: "Solutions", href: "/admin/dashboard/solutions", icon: Lightbulb, description: "The six solution areas" },
  { label: "Products", href: "/admin/dashboard/products", icon: Package, description: "The product catalogue" },
  { label: "Articles", href: "/admin/dashboard/articles", icon: Newspaper, description: "Knowledge Centre content" },
  { label: "Courses", href: "/admin/dashboard/courses", icon: GraduationCap, description: "Academy offerings" },
  { label: "Trust Indicators", href: "/admin/dashboard/trust-indicators", icon: Gauge, description: "Homepage/About stats" },
  { label: "Team Members", href: "/admin/dashboard/team-members", icon: Users, description: "About page showcase" },
  { label: "Leadership Partners", href: "/admin/dashboard/leadership-partners", icon: Handshake, description: "Strategic partners" },
  { label: "Offices", href: "/admin/dashboard/offices", icon: Building2, description: "Office locations" },
  { label: "Vacancies", href: "/admin/dashboard/vacancies", icon: Briefcase, description: "Careers listings" },
  { label: "Expert Pool", href: "/admin/dashboard/expert-pool", icon: UserSearch, description: "Review expert accounts" },
  { label: "Media Library", href: "/admin/dashboard/media", icon: ImageIcon, description: "Upload & manage images" },
  { label: "Audit Log", href: "/admin/dashboard/audit-log", icon: ScrollText, description: "Every admin action" },
  { label: "Submissions", href: "/admin/dashboard/submissions", icon: Inbox, description: "Contact & consultation queue" },
];

export default function AdminDashboardOverviewPage() {
  return (
    <div>
      <h1 className="text-h2 text-foreground">Welcome back</h1>
      <p className="text-body text-muted-foreground mt-2">
        Manage Result Seekers&apos; website content, the Expert Pool, and staff access from here.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <Card hoverable className="flex h-full flex-col">
                <span className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-full">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <p className="text-h4 text-foreground mt-4">{link.label}</p>
                <p className="text-small text-muted-foreground mt-1">{link.description}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
