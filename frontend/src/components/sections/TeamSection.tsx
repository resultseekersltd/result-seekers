import { Section } from "@/components/layout/Section";
import { EmptyState } from "@/components/ui/EmptyState";
import { TeamCard } from "@/components/cards/TeamCard";
import { getTeamMembers } from "@/lib/api/team-members";

/**
 * About page's "Success Behind Result Seekers" section (Task 014) — the
 * people/leadership showcase the previously-unused `team_members` table
 * and `TeamCard` component were built for. No names/bios are invented
 * here; if no team members have been added through the CMS yet, this
 * renders an honest EmptyState rather than fabricated people.
 */
export async function TeamSection() {
  const members = await getTeamMembers();

  return (
    // "Our Values" (the preceding section) is tone="muted" — default here keeps alternation clean.
    <Section>
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-small text-accent font-semibold tracking-wide uppercase">Our People</p>
        <h2 className="text-display text-foreground mt-3">Success Behind Result Seekers</h2>
        <p className="text-body-lg text-muted-foreground mt-4">
          The team driving our research, technology, and capacity development work.
        </p>
      </div>

      {members.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <TeamCard key={member.id} member={member} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Team profiles are coming soon"
          description="We're putting together introductions to the people behind Result Seekers."
          className="mt-8"
        />
      )}
    </Section>
  );
}
