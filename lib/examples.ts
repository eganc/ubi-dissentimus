import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { frontmatterString, parseBody, parseFrontmatter } from "@/lib/markdown";
import type { WorkedExample } from "@/lib/types";

const EXAMPLES_DIR = path.join(process.cwd(), "content", "examples");

function loadExample(filename: string): WorkedExample {
  const raw = readFileSync(path.join(EXAMPLES_DIR, filename), "utf-8");
  const { data, body } = parseFrontmatter(raw);
  const cruxId = frontmatterString(data, "crux");

  return {
    id: frontmatterString(data, "id"),
    title: frontmatterString(data, "title"),
    summary: frontmatterString(data, "summary"),
    cruxId: cruxId === "" ? null : cruxId,
    body: parseBody(body),
  };
}

export function getAllExamples(): WorkedExample[] {
  return readdirSync(EXAMPLES_DIR)
    .filter((file) => file.endsWith(".md"))
    .map(loadExample)
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function getExampleById(id: string): WorkedExample | undefined {
  return getAllExamples().find((example) => example.id === id);
}
