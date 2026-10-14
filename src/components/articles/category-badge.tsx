import { Globe2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ArticleCategory } from "@/core/articles/article";
import type { Dictionary } from "@/i18n/dictionaries/id";

export function CategoryBadge({
  category,
  dict,
  className,
}: {
  category: ArticleCategory;
  dict: Dictionary;
  className?: string;
}) {
  const isNational = category === "national";
  const Icon = isNational ? MapPin : Globe2;
  return (
    <Badge tone={isNational ? "moss" : "ocean"} className={className}>
      <Icon className="size-3" aria-hidden />
      {dict.categories[category]}
    </Badge>
  );
}
