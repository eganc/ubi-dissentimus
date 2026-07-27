import type { ReactNode } from "react";
import type { CruxBodyBlock } from "@/lib/types";

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const bold = match[1];
    const italic = match[2];
    if (bold !== undefined) {
      nodes.push(<strong key={key++}>{bold}</strong>);
    } else if (italic !== undefined) {
      nodes.push(<em key={key++}>{italic}</em>);
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export function CruxBody({ blocks }: { blocks: CruxBodyBlock[] }) {
  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-neutral-800">
      {blocks.map((block, index) => {
        if (block.kind === "blockquote") {
          return (
            <blockquote
              key={index}
              className="border-l-2 border-neutral-300 pl-4 italic text-neutral-700"
            >
              {renderInline(block.text)}
            </blockquote>
          );
        }

        if (block.kind === "list") {
          return (
            <ol key={index} className="list-decimal space-y-2 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </ol>
          );
        }

        return <p key={index}>{renderInline(block.text)}</p>;
      })}
    </div>
  );
}
