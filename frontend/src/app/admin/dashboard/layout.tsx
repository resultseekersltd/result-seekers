"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { me, logout, type AdminUser } from "@/lib/api/admin";
import {
  LayoutDashboard,
  Lightbulb,
  Package,
  Newspaper,
  FolderTree,
  Tags,
  GraduationCap,
  BookOpen,
  Gauge,
  Users,
  Handshake,
  Building2,
  Briefcase,
  UserSearch,
  Image as ImageIcon,
  ScrollText,
  Inbox,
  Shield,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ClipboardList,
  Search,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

interface NavGroup {
  heading: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    heading: "Overview",
    items: [{ label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }],
  },
  {
    heading: "Content",
    items: [
      { label: "Solutions", href: "/admin/dashboard/solutions", icon: Lightbulb },
      { label: "Products", href: "/admin/dashboard/products", icon: Package },
      { label: "Articles", href: "/admin/dashboard/articles", icon: Newspaper },
      { label: "Article Categories", href: "/admin/dashboard/article-categories", icon: FolderTree },
      { label: "Tags", href: "/admin/dashboard/tags", icon: Tags },
      { label: "Courses", href: "/admin/dashboard/courses", icon: GraduationCap },
      { label: "Course Categories", href: "/admin/dashboard/course-categories", icon: BookOpen },
      { label: "Trust Indicators", href: "/admin/dashboard/trust-indicators", icon: Gauge },
    ],
  },
  {
    heading: "People & Places",
    items: [
      { label: "Team Members", href: "/admin/dashboard/team-members", icon: Users },
      { label: "Leadership Partners", href: "/admin/dashboard/leadership-partners", icon: Handshake },
      { label: "Offices", href: "/admin/dashboard/offices", icon: Building2 },
      { label: "Vacancies", href: "/admin/dashboard/vacancies", icon: Briefcase },
      { label: "Expert Pool", href: "/admin/dashboard/expert-pool", icon: UserSearch },
    ],
  },
  {
    heading: "Talent Network",
    items: [
      { label: "Organisations", href: "/admin/dashboard/organisations", icon: Building2 },
      { label: "Talent Requests", href: "/admin/dashboard/talent-requests", icon: ClipboardList },
      { label: "Recruitment Assignments", href: "/admin/dashboard/recruitment-assignments", icon: Workflow },
      { label: "Recruiter Search", href: "/admin/dashboard/recruiter-search", icon: Search },
      { label: "Verification", href: "/admin/dashboard/verification", icon: ShieldCheck },
    ],
  },
  {
    heading: "System",
    items: [
      { label: "Media Library", href: "/admin/dashboard/media", icon: ImageIcon },
      { label: "Audit Log", href: "/admin/dashboard/audit-log", icon: ScrollText },
      { label: "Submissions", href: "/admin/dashboard/submissions", icon: Inbox },
      { label: "Security & MFA", href: "/admin/dashboard/security", icon: Shield },
    ],
  },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    me()
      .then((res) => setUser(res.user))
      .catch(() => router.push("/admin/login"));
  }, [router]);

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Ignore — cookie is cleared server-side regardless.
    } finally {
      router.push("/admin/login");
    }
  }

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <header className="border-border bg-background/95 sticky top-0 z-40 border-b backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="text-muted-foreground hover:text-foreground md:hidden"
              aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
            >
              {mobileNavOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
            <Logo />
            <span className="text-small text-muted-foreground border-border hidden border-l pl-3 font-semibold sm:inline-block">
              Admin Dashboard
            </span>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <Avatar name={user.name} size="md" />
                <div className="hidden flex-col text-left lg:flex">
                  <span className="text-small text-foreground leading-none font-medium">{user.name}</span>
                  <span className="text-muted-foreground mt-0.5 text-xs leading-tight">{user.email}</span>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-danger"
            >
              <LogOut className="mr-1.5 size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside
          className={cn(
            "border-border bg-card fixed inset-y-0 left-0 z-30 w-64 border-r pt-16 transition-transform duration-200 ease-in-out md:static md:translate-x-0 md:pt-0",
            mobileNavOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <nav className="flex h-full flex-col gap-6 overflow-y-auto p-4">
            {NAV_GROUPS.map((group) => (
              <div key={group.heading}>
                <p className="text-caption text-muted-foreground mb-2 px-3 font-semibold tracking-wide uppercase">
                  {group.heading}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className={cn(
                          "rounded-card text-small flex items-center justify-between px-3 py-2.5 font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-soft font-semibold"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="size-4 shrink-0" aria-hidden="true" />
                          <span>{item.label}</span>
                        </div>
                        {isActive && <ChevronRight className="size-4 opacity-70" aria-hidden="true" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="text-muted-foreground border-border mt-auto border-t pt-3 text-center text-xs">
              Result Seekers Admin
            </div>
          </nav>
        </aside>

        <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
