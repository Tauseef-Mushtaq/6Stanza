import type { Metadata } from "next";
import Link from "next/link";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { TeamMemberForm } from "@/features/admin/components/TeamMemberForm";

export const metadata: Metadata = { title: "New Team Member" };

/** Module 9D — `/admin/team/new` (spec §7). Renders `TeamMemberForm` with no `member` prop, i.e. create mode. */
export default function NewTeamMemberPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/team"
          className="font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand)]"
          style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}
        >
          ← Team
        </Link>
        <div className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>New Team Member</TechnicalLabel>
        </div>
        <h1 className="font-[var(--font-display)]" style={{ fontSize: "var(--text-h2)", color: "var(--color-text-primary)" }}>
          Create Team Member
        </h1>
      </div>

      <TeamMemberForm />
    </div>
  );
}
