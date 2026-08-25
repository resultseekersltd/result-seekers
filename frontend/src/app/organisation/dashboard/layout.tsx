"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { getMe, logout, getProfile } from "@/lib/api/organisation";
import type { OrganisationUser, Organisation } from "@/types/organisation";
import { LayoutDashboard, Building2, Users, ClipboardList, UserCheck, CalendarClock, Briefcase, Shield, LogOut, ChevronRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OrganisationDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<OrganisationUser | null>(null);
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    getMe()
      .then((res) => setUser(res.user))
      .catch(() => router.push("/organisation/login"));

    getProfile()
      .then((res) => setOrganisation(res.data))
      .catch(() => {});
  }, [router]);

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Ignore
    } finally {
      router.push("/organisation/login");
    }
  }

  const navItems = [
    { label: "Overview", href: "/organisation/dashboard", icon: LayoutDashboard },
    { label: "Organisation Profile", href: "/organisation/dashboard/profile", icon: Building2 },
    { label: "Team Members", href: "/organisation/dashboard/users", icon: Users },
    { label: "Talent Requests", href: "/organisation/dashboard/requests", icon: ClipboardList },
    { label: "Released Candidates", href: "/organisation/dashboard/released-candidates", icon: UserCheck },
    { label: "Interviews", href: "/organisation/dashboard/interviews", icon: CalendarClock },
    { label: "Placements", href: "/organisation/dashboard/placements", icon: Briefcase },
    { label: "Security & MFA", href: "/organisation/dashboard/security", icon: Shield },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden text-muted-foreground hover:text-foreground"
            >
              {mobileNavOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
            <Logo />
            <span className="hidden sm:inline-block text-small font-semibold text-muted-foreground border-l border-border pl-3">
              Organisation Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <Avatar name={user.name} size="md" />
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-small font-medium leading-none text-foreground">{user.name}</span>
                  <span className="text-xs text-muted-foreground leading-tight mt-0.5">
                    {organisation?.name ?? user.email}
                  </span>
                </div>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-danger">
              <LogOut className="size-4 mr-1.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 w-64 border-r border-border bg-card transition-transform duration-200 ease-in-out md:static md:translate-x-0 pt-16 md:pt-0",
            mobileNavOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex flex-col h-full p-4 space-y-6">
            {organisation && (
              <div className="rounded-card border border-border bg-muted/40 p-3">
                <div className="flex justify-between items-center text-xs mb-1 font-medium">
                  <span className="text-muted-foreground">Verification Status</span>
                </div>
                <span className="text-small font-semibold text-foreground">{organisation.status_label}</span>
              </div>
            )}

            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-card text-small font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="size-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="size-4 opacity-70" />}
                  </Link>
                );
              })}
            </nav>

            <div className="text-xs text-muted-foreground text-center border-t border-border pt-3">
              Result Seekers Talent &amp; Expert Network
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
