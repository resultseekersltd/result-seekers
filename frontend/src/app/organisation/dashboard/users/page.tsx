"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { getUsers, addUser, removeUser, OrganisationApiError } from "@/lib/api/organisation";
import type { OrganisationUser } from "@/types/organisation";
import { Users, Plus, Loader2, Trash2 } from "lucide-react";

export default function OrganisationUsersPage() {
  const [users, setUsers] = useState<OrganisationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadUsers() {
    setLoading(true);
    getUsers()
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see admin/dashboard/audit-log/page.tsx's comment
    loadUsers();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await addUser({ name, email, password, password_confirmation: passwordConfirmation });
      setName("");
      setEmail("");
      setPassword("");
      setPasswordConfirmation("");
      setShowForm(false);
      loadUsers();
    } catch (err) {
      if (err instanceof OrganisationApiError) setError(err.message);
      else setError("Failed to add team member.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id: number) {
    await removeUser(id);
    loadUsers();
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="size-6 text-primary" />
            Team Members
          </h1>
          <p className="text-body text-muted-foreground mt-1">
            Everyone here is an Organisation Representative with access to your requests and shortlists.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="size-4 mr-1.5" />
          Add Team Member
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 max-w-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-input border border-danger/30 bg-danger/10 p-3 text-small text-danger">{error}</div>
            )}
            <FormField htmlFor="new-user-name" label="Full Name" required>
              <Input id="new-user-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </FormField>
            <FormField htmlFor="new-user-email" label="Email Address" required>
              <Input id="new-user-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </FormField>
            <FormField htmlFor="new-user-password" label="Temporary Password" required>
              <Input id="new-user-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </FormField>
            <FormField htmlFor="new-user-password-confirm" label="Confirm Password" required>
              <Input
                id="new-user-password-confirm"
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
              />
            </FormField>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Add Team Member"}
            </Button>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No team members yet" description="Add a colleague to help manage your organisation's talent requests." />
      ) : (
        <div className="space-y-3">
          {users.map((member) => (
            <Card key={member.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{member.name}</p>
                <p className="text-small text-muted-foreground">{member.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={member.is_active ? "success" : "outline"}>
                  {member.is_active ? "Active" : "Deactivated"}
                </Badge>
                {member.is_active && (
                  <button
                    type="button"
                    onClick={() => handleRemove(member.id)}
                    className="text-muted-foreground hover:text-danger"
                    aria-label={`Deactivate ${member.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
