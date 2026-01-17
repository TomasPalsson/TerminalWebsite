import React from "react";

/**
 * Extracts plain text from React nodes, preserving layout.
 * Converts block elements to newlines and handles special cases like lists and links.
 *
 * Handles:
 * - HTML block elements (div, p, h1-h6, li, ul, ol) → adds newlines
 * - HTML inline elements → extracts children text
 * - Custom React components → recursively extracts children
 * - lucide-react icons → skipped (SVG elements have no meaningful text)
 * - Tables → formats as rows with spacing
 * - Links → includes href in parentheses
 */
export function extractText(node: React.ReactNode): string {
  if (node == null) return "";

  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(extractText).join("");
  }

  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<any>;
    const blockTags = new Set([
      "div",
      "p",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "li",
      "ul",
      "ol",
    ]);

    // Skip SVG elements (icons) - they have no meaningful text
    if (node.type === "svg") {
      return "";
    }

    // Skip lucide-react icons (function components with icon-like names)
    if (typeof node.type === "function") {
      const name = (node.type as any).displayName || (node.type as any).name || "";
      if (name.includes('Icon') || /^(ChevronRight|HelpCircle|Terminal|AlertCircle|Monitor|Zap|ZapOff|ExternalLink|Github|Linkedin|Mail|MapPin|Building|Calendar|GraduationCap|Award|Briefcase|Code|Globe|Download|FileText|Star|GitFork|Eye|ChevronDown|ChevronUp|Search|X|Menu|Home|User|Folder|File|Settings|LogOut|Plus|Minus|Check|Copy|Clipboard|Edit|Trash|Save|RefreshCw|Upload|Play|Pause|Stop|SkipForward|SkipBack|Volume|VolumeX|Volume1|Volume2|Maximize|Minimize|ArrowLeft|ArrowRight|ArrowUp|ArrowDown)$/.test(name)) {
        return "";
      }
    }

    const children = React.Children.map(element.props.children, extractText)?.join(
      ""
    ) ?? "";

    // <br> => newline
    if (node.type === "br") return "\n";

    if (node.type === "button") return `${children}\n`;

    // <li> => bullet + newline
    if (node.type === "li") return `• ${children}\n`;

    // <a> - link with optional href display
    if (node.type === "a") {
      const linkChildren = React.Children.map(element.props.children, extractText)?.join("") ?? "";
      const href = element.props.href;
      // Only show href if it's different from the link text and is a URL
      if (href && href !== linkChildren && href.startsWith('http')) {
        return `${linkChildren} (${href})`;
      }
      return linkChildren;
    }

    // Table elements
    if (node.type === "table") return `${children}\n`;
    if (node.type === "thead" || node.type === "tbody") return children;
    if (node.type === "tr") return `${children}\n`;
    if (node.type === "th") return `${children}  `;
    if (node.type === "td") return `${children}  `;

    // Grid/flex containers - treat like block elements
    if (node.type === "section" || node.type === "article" || node.type === "header" || node.type === "footer" || node.type === "main" || node.type === "nav") {
      return `${children}\n`;
    }

    // any other block element => newline at end
    if (typeof node.type === "string" && blockTags.has(node.type)) {
      // Avoid double newlines by trimming trailing newlines from children
      const trimmed = children.replace(/\n+$/, "");
      return trimmed ? `${trimmed}\n` : "";
    }

    // Custom React components (function or class) - try to render and extract
    if (typeof node.type === "function") {
      // Try to call the component function to get its rendered output
      try {
        const rendered = (node.type as any)(element.props);
        if (rendered) {
          return extractText(rendered);
        }
      } catch {
        // If rendering fails, fall back to children
      }
      return children;
    }

    // Object types (like forwardRef, memo)
    if (typeof node.type === "object") {
      return children;
    }

    // inline element => just return its children's text
    return children;
  }

  return "";
}
