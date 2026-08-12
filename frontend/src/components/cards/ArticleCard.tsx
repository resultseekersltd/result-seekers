import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TextLink } from "@/components/ui/TextLink";
import { formatDate } from "@/lib/utils";
import type { Article } from "@/types/article";

interface ArticleCardProps {
  article: Pick<
    Article,
    "slug" | "title" | "summary" | "authorName" | "readingTimeMinutes" | "publishedAt" | "category"
  >;
}

/** "Insight Card" — design doc §28: category, title, summary, reading time, author, date. */
export function ArticleCard({ article }: ArticleCardProps) {
  const publishedDate = article.publishedAt ? formatDate(article.publishedAt) : null;

  return (
    <Card hoverable className="flex flex-col">
      {article.category && <Badge variant="accent">{article.category.name}</Badge>}
      <p className="text-h4 text-foreground mt-3">{article.title}</p>
      <p className="text-body text-muted-foreground mt-2 flex-1">{article.summary}</p>
      <div className="text-caption text-muted-foreground mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>{article.authorName}</span>
        {publishedDate && (
          <>
            <span aria-hidden="true">&middot;</span>
            <span>{publishedDate}</span>
          </>
        )}
        {article.readingTimeMinutes && (
          <>
            <span aria-hidden="true">&middot;</span>
            <span>{article.readingTimeMinutes} min read</span>
          </>
        )}
      </div>
      <TextLink href={`/knowledge-centre/${article.slug}`} withArrow className="mt-4">
        Read Article
      </TextLink>
    </Card>
  );
}
