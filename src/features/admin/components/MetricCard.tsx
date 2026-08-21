import { Card } from "@/components/ui/Card";

/**
 * Module 8 — one dashboard metric (spec §4/§12). Deliberately plain:
 * a label and a number, no trend arrows or comparisons — this is an
 * operational overview, not analytics (spec §1/§24).
 */
export function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card variant="bordered" className="gap-2 p-5 md:p-6">
      <span
        className="font-[var(--font-mono)] uppercase"
        style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}
      >
        {label}
      </span>
      <span className="font-[var(--font-display)]" style={{ fontSize: "var(--text-h2)", color: "var(--color-text-primary)" }}>
        {value}
      </span>
    </Card>
  );
}
