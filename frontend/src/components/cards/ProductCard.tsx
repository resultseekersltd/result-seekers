import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TextLink } from "@/components/ui/TextLink";
import { Button } from "@/components/ui/Button";
import { PRODUCT_STATUS_BADGE_VARIANTS, PRODUCT_STATUS_LABELS } from "@/lib/product-status";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Pick<
    Product,
    "slug" | "name" | "category" | "shortDescription" | "status" | "externalUrl"
  >;
}

/** Design doc §26: name, category, short description, status badge, internal Learn More link, external Visit Platform button. */
export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card hoverable className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <p className="text-h4 text-foreground">{product.name}</p>
        <Badge variant={PRODUCT_STATUS_BADGE_VARIANTS[product.status]} className="shrink-0">
          {PRODUCT_STATUS_LABELS[product.status]}
        </Badge>
      </div>
      <p className="text-small text-muted-foreground mt-1">{product.category}</p>
      <p className="text-body text-muted-foreground mt-3 flex-1">{product.shortDescription}</p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <TextLink href={`/products/${product.slug}`} withArrow>
          Learn More
        </TextLink>
        {product.externalUrl && (
          <Button
            href={product.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="ghost"
            size="sm"
          >
            Visit Platform
            <ExternalLink className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </Card>
  );
}
