import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { frontmatterList, frontmatterString, parseBody, parseFrontmatter } from "@/lib/markdown";
import type { Crux, CruxType } from "@/lib/types";

const CRUXES_DIR = path.join(process.cwd(), "content", "cruxes");

function assertCruxType(value: string, filename: string): CruxType {
  if (value !== "evidence" && value !== "value") {
    throw new Error(`Crux ${filename} has an invalid type: "${value}"`);
  }
  return value;
}

function loadCrux(filename: string): Crux {
  const raw = readFileSync(path.join(CRUXES_DIR, filename), "utf-8");
  const { data, body } = parseFrontmatter(raw);

  return {
    id: frontmatterString(data, "id"),
    title: frontmatterString(data, "title"),
    type: assertCruxType(frontmatterString(data, "type"), filename),
    surfacesAs: frontmatterList(data, "surfaces_as"),
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
