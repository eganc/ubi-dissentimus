export type CruxType = "evidence" | "value";

export type CruxBodyBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "blockquote"; text: string }
  | { kind: "list"; items: string[] };

export interface Crux {
  id: string;
  title: string;
  type: CruxType;
  surfacesAs: string[];
  body: CruxBodyBlock[];
}
