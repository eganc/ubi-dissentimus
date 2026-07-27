import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import type { Crux, CruxBodyBlock, CruxType } from "@/lib/types";

const CRUXES_DIR = path.join(process.cwd(), "content", "cruxes");

interface Frontmatter {
  id: string;
  title: string;
  type: string;
  surfaces_as: string[];
}

function parseFrontmatter(raw: string): { frontmatter: Frontmatter; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error("Crux file is missing YAML frontmatter");
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

  return {
    frontmatter: {
      id: typeof data.id === "string" ? data.id : "",
      title: typeof data.title === "string" ? data.title : "",
      type: typeof data.type === "string" ? data.type : "",
      surfaces_as: Array.isArray(data.surfaces_as) ? data.surfaces_as : [],
    },
    body,
  };
}

function parseBody(raw: string): CruxBodyBlock[] {
  return raw
    .split(/\n\s*\n/)
    .filter((paragraph) => paragraph.trim() !== "")
    .map((paragraph): CruxBodyBlock => {
      const lines = paragraph.split("\n").map((line) => line.trim());

      if (lines.every((line) => line.startsWith("> "))) {
        return { kind: "blockquote", text: lines.map((line) => line.slice(2)).join(" ") };
      }

      if (lines.every((line) => /^\d+\.\s/.test(line))) {
        return { kind: "list", items: lines.map((line) => line.replace(/^\d+\.\s/, "")) };
      }

      return { kind: "paragraph", text: lines.join(" ") };
    });
}

function assertCruxType(value: string, filename: string): CruxType {
  if (value !== "evidence" && value !== "value") {
    throw new Error(`Crux ${filename} has an invalid type: "${value}"`);
  }
  return value;
}

function loadCrux(filename: string): Crux {
  const raw = readFileSync(path.join(CRUXES_DIR, filename), "utf-8");
  const { frontmatter, body } = parseFrontmatter(raw);

  return {
    id: frontmatter.id,
    title: frontmatter.title,
    type: assertCruxType(frontmatter.type, filename),
    surfacesAs: frontmatter.surfaces_as,
    body: parseBody(body),
  };
}

export function getAllCruxes(): Crux[] {
  return readdirSync(CRUXES_DIR)
    .filter((file) => file.endsWith(".md"))
    .map(loadCrux)
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function getCruxById(id: string): Crux | undefined {
  return getAllCruxes().find((crux) => crux.id === id);
}
