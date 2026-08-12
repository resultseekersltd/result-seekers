import { Card } from "@/components/ui/Card";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

interface StatCardProps {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

/** For the homepage Trust Indicators section (Task 004) — only the 8 approved indicators should ever be passed in. */
export function StatCard({ value, prefix, suffix, label }: StatCardProps) {
  return (
    <Card className="border-l-4 border-l-primary text-center">
      <p className="text-hero text-primary font-bold">
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
      </p>
      <p className="text-body text-muted-foreground mt-2">{label}</p>
    </Card>
  );
}
