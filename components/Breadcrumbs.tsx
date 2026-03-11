'use client'
import Link from 'next/link'
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const SITE_URL = "https://utvecklare.ai";

const Breadcrumbs = ({ items, className = "" }: BreadcrumbsProps) => {
  const allItems: BreadcrumbItem[] = [{ name: "Hem", href: "/" }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script type="application/ld+json" data-seo-breadcrumb dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Brödsmulor" className={`text-xs text-muted-foreground ${className}`}>
        <ol className="flex items-center flex-wrap gap-y-1">
          {allItems.map((item, i) => (
            <li key={i} className="flex items-center">
              {i > 0 && <ChevronRight className="w-3 h-3 mx-1.5 shrink-0" />}
              {item.href && i < allItems.length - 1 ? (
                <Link href={item.href} className="hover:text-foreground transition-colors">
                  {item.name}
                </Link>
              ) : (
                <span className="text-foreground font-medium line-clamp-1">{item.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;
