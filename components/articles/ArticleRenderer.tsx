'use client'
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  content: string;
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast({ title: "Kopierad!", description: "Koden har kopierats till clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-6 rounded-lg bg-muted border border-border overflow-hidden group">
      {lang && <span className="absolute top-2 left-3 text-[10px] text-tertiary uppercase tracking-wider font-mono">{lang}</span>}
      <button onClick={copy} className="absolute top-2 right-2 p-1.5 rounded-md bg-accent/50 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Kopiera kod">
        {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
      <pre className="p-4 pt-8 overflow-x-auto">
        <code className="text-sm font-mono text-foreground leading-relaxed">{code}</code>
      </pre>
    </div>
  );
}

function inlineFormat(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded bg-muted text-secondary text-sm font-mono">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary hover:text-secondary underline transition-colors" target="_blank" rel="noopener noreferrer">$1</a>');
}

const ArticleRenderer = ({ content }: Props) => {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Headings
    const h2 = line.match(/^## (.+)/);
    const h3 = line.match(/^### (.+)/);
    if (h2) {
      const id = h2[1].toLowerCase().replace(/[^\wåäö]/g, "-").replace(/-+/g, "-");
      elements.push(<h2 key={i} id={id} className="text-2xl font-bold text-foreground mt-10 mb-4 scroll-mt-24">{h2[1]}</h2>);
      i++; continue;
    }
    if (h3) {
      const id = h3[1].toLowerCase().replace(/[^\wåäö]/g, "-").replace(/-+/g, "-");
      elements.push(<h3 key={i} id={id} className="text-xl font-semibold text-foreground mt-8 mb-3 scroll-mt-24">{h3[1]}</h3>);
      i++; continue;
    }

    // Images
    const img = line.match(/^!\[(.+?)\]\((.+?)\)/);
    if (img) {
      elements.push(
        <figure key={i} className="my-8 rounded-lg overflow-hidden border border-border">
          <img src={img[2]} alt={img[1]} className="w-full aspect-video object-cover" loading="lazy" />
          <figcaption className="text-xs text-tertiary p-3 bg-card">{img[1]}</figcaption>
        </figure>
      );
      i++; continue;
    }

    // Code blocks
    if (line.startsWith("```")) {
      const lang = line.replace("```", "").trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(<CodeBlock key={`code-${i}`} lang={lang} code={codeLines.join("\n")} />);
      i++; continue;
    }

    // Blockquotes
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].replace(/^> /, ""));
        i++;
      }
      elements.push(
        <blockquote key={`bq-${i}`} className="my-6 border-l-4 border-primary bg-card p-4 rounded-r-lg italic text-muted-foreground">
          {quoteLines.join(" ")}
        </blockquote>
      );
      continue;
    }

    // Unordered lists
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].replace("- ", ""));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-4 space-y-2">
          {items.map((item, li) => (
            <li key={li} className="flex items-start gap-2.5 text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg mt-2 shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered lists
    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ""));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-4 space-y-2 list-decimal list-inside">
          {items.map((item, li) => (
            <li key={li} className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
          ))}
        </ol>
      );
      continue;
    }

    // Empty
    if (!line.trim()) { i++; continue; }

    // Paragraph
    elements.push(
      <p key={i} className="text-muted-foreground leading-relaxed my-3 text-base md:text-lg" dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />
    );
    i++;
  }

  return <article className="mb-12">{elements}</article>;
};

export default ArticleRenderer;
