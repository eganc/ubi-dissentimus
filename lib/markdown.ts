import type { CruxBodyBlock } from "@/lib/types";

// Minimal build-time markdown for the content/ directory. Supports flat YAML
// frontmatter (strings and string lists), paragraphs, "## " headings,
// "> " blockquotes and numbered lists. Inline emphasis is rendered by CruxBody.

export function parseFrontmatter(raw: string): {
  data: Record<string, string | string[]>;
  body: string;
} {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error("Markdown file is missing YAML frontmatter");
  }

  const frontmatterBlock = match[1] ?? "";
  const body = (match[2] ?? "").trim();

  const data: Record<string, string | string[]> = {};
  let currentListKey: string | null = null;

  for (const line of frontmatterBlock.split("\n")) {
    if (line.trim() === "") continue;

    const listItem = line.match(/^\s+-\s+(.*)$/);
    if (listItem && currentListKey) {
      const item = listItem[1] ?? "";
      const list = data[currentListKey];
      if (Array.isArray(list)) {
        list.push(item.trim());
      }
      continue;
    }

    const pair = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (!pair) continue;
    const key = pair[1] ?? "";
    const rawValue = (pair[2] ?? "").trim();

    if (rawValue === "") {
      data[key] = [];
      currentListKey = key;
    } else {
      data[key] = rawValue.replace(/^"(.*)"$/, "$1");
      currentListKey = null;
    }
  }

  return { data, body };
}

export function frontmatterString(data: Record<string, string | string[]>, key: string): string {
  const value = data[key];
  return typeof value === "string" ? value : "";
}

export function frontmatterList(data: Record<string, string | string[]>, key: string): string[] {
  const value = data[key];
  return Array.isArray(value) ? value : [];
}

export function parseBody(raw: string): CruxBodyBlock[] {
  return raw
    .split(/\n\s*\n/)
    .filter((paragraph) => paragraph.trim() !== "")
    .map((paragraph): CruxBodyBlock => {
      const lines = paragraph.split("\n").map((line) => line.trim());

      if (lines.length === 1 && lines[0]?.startsWith("## ")) {
        return { kind: "heading", text: lines[0].slice(3) };
      }

      if (lines.every((line) => line.startsWith("> "))) {
        return { kind: "blockquote", text: lines.map((line) => line.slice(2)).join(" ") };
      }

      if (lines.every((line) => /^\d+\.\s/.test(line))) {
        return { kind: "list", items: lines.map((line) => line.replace(/^\d+\.\s/, "")) };
      }

      return { kind: "paragraph", text: lines.join(" ") };
    });
}
