import React from "react";

/**
 * Extracts plain text from React nodes, preserving layout.
 * Converts block elements to newlines and handles special cases like lists and links.
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

    const children = React.Children.map(element.props.children, extractText)?.join(
      ""
    ) ?? "";

    // <br> => newline
    if (node.type === "br") return "\n";

    if (node.type === "button") return `${children}\n`;

    // <li> => bullet + newline
    if (node.type === "li") return `• ${children}\n`;

    // <a>
    if (node.type === "a") {
      const linkChildren = React.Children.map(element.props.children, extractText)?.join("") ?? "";
      return `${linkChildren} (${element.props.href})`;
    }

    // any other block element => newline at end
    if (typeof node.type === "string" && blockTags.has(node.type)) {
      return `${children}\n`;
    }

    // inline element => just return its children's text
    return children;
  }

  return "";
}
