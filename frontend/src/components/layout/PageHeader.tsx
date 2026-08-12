import { Section } from "@/components/layout/Section";
import { Breadcrumb, type BreadcrumbItem } from "@/components/layout/Breadcrumb";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: BreadcrumbItem[];
}

/** Consistent top-of-page header used by every interior page (About, Solutions, etc.). */
export function PageHeader({ title, description, breadcrumb }: PageHeaderProps) {
  return (
    <Section tone="muted" spacing="compact" className="border-t-[3px] border-primary">
      {breadcrumb && <Breadcrumb items={breadcrumb} className="mb-6" />}
      <h1 className="text-display text-foreground max-w-3xl">{title}</h1>
      {description && (
        <p className="text-body-lg text-muted-foreground mt-4 max-w-2xl">{description}</p>
      )}
    </Section>
  );
}
