import React from "react";

interface FormattedMessageProps {
  content: string;
}

/**
 * Parses markdown-style formatted text (headers, tables, bold/italics, bullet/numbered lists, callouts, dividers)
 * into semantic React elements for structured reading.
 */
export function FormattedMessage({ content }: FormattedMessageProps) {
  if (!content) return null;

  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let currentList: string[] = [];
  let isNumberedList = false;
  let currentTableRows: string[][] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      if (isNumberedList) {
        blocks.push(
          <ol key={`list-${blocks.length}`} className="message-list-ol">
            {currentList.map((item, idx) => (
              <li key={idx}>{renderInline(item)}</li>
            ))}
          </ol>
        );
      } else {
        blocks.push(
          <ul key={`list-${blocks.length}`} className="message-list-ul">
            {currentList.map((item, idx) => (
              <li key={idx}>{renderInline(item)}</li>
            ))}
          </ul>
        );
      }
      currentList = [];
    }
  };

  const flushTable = () => {
    if (currentTableRows.length > 0) {
      const headerRow = currentTableRows[0];
      const dataRows = currentTableRows.slice(1);

      blocks.push(
        <div
          key={`table-${blocks.length}`}
          className="table-wrap"
          style={{ margin: "14px 0" }}
        >
          <table
            className="table"
            style={{
              background: "#FFFFFF",
              border: "1px solid var(--border-color)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <thead>
              <tr>
                {headerRow.map((cell, idx) => (
                  <th key={idx}>{renderInline(cell)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx}>{renderInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      currentTableRows = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushList();
      flushTable();
      continue;
    }

    // Markdown Table Row: | col 1 | col 2 |
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      flushList();
      // Check if this is a separator row like |---|---|
      const isSeparator = /^\|(\s*[-:]+[-| :]*)\|$/.test(trimmed);
      if (isSeparator) {
        // Skip separator row
        continue;
      }

      // Extract cells
      const rawCells = trimmed.slice(1, -1).split("|");
      const cells = rawCells.map((c) => c.trim());
      currentTableRows.push(cells);
      continue;
    } else {
      flushTable();
    }

    // Horizontal Rule / Divider: --- or ***
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      flushList();
      blocks.push(
        <hr
          key={`hr-${i}`}
          style={{
            border: "none",
            borderTop: "1px solid var(--border-color)",
            margin: "18px 0",
          }}
        />
      );
      continue;
    }

    // Heading: ### or ## or #
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      if (level === 1) {
        blocks.push(
          <h2
            key={`h-${i}`}
            className="page-title"
            style={{ fontSize: "1.35rem", margin: "14px 0 6px" }}
          >
            {renderInline(text)}
          </h2>
        );
      } else if (level === 2) {
        blocks.push(
          <h3
            key={`h-${i}`}
            className="message-heading-lg"
            style={{ fontSize: "1.15rem", margin: "12px 0 4px" }}
          >
            {renderInline(text)}
          </h3>
        );
      } else {
        blocks.push(
          <h4
            key={`h-${i}`}
            className="message-heading-md"
            style={{ fontSize: "1rem", margin: "8px 0 2px" }}
          >
            {renderInline(text)}
          </h4>
        );
      }
      continue;
    }

    // Unordered list item: * or -
    const bulletMatch = trimmed.match(/^[\*\-]\s+(.+)$/);
    if (bulletMatch) {
      if (isNumberedList) flushList();
      isNumberedList = false;
      currentList.push(bulletMatch[1]);
      continue;
    }

    // Ordered list item: 1. or 2.
    const numberMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (numberMatch) {
      if (!isNumberedList) flushList();
      isNumberedList = true;
      currentList.push(numberMatch[1]);
      continue;
    }

    // Blockquote or Disclaimer
    if (
      trimmed.startsWith("> ") ||
      (trimmed.startsWith("***") && trimmed.endsWith("***")) ||
      trimmed.toLowerCase().startsWith("*disclaimer:") ||
      trimmed.toLowerCase().startsWith("**disclaimer:")
    ) {
      flushList();
      const cleanText = trimmed
        .replace(/^>\s*/, "")
        .replace(/^\*\*\*|\*\*\*$/g, "");
      blocks.push(
        <div key={`quote-${i}`} className="message-callout">
          {renderInline(cleanText)}
        </div>
      );
      continue;
    }

    // Normal paragraph
    flushList();
    blocks.push(
      <p key={`p-${i}`} className="message-p" style={{ margin: "4px 0", lineHeight: 1.6 }}>
        {renderInline(trimmed)}
      </p>
    );
  }

  flushList();
  flushTable();

  return <div className="formatted-message">{blocks}</div>;
}

function renderInline(text: string): React.ReactNode {
  // Parse bold (**text**) and italics (*text*)
  const parts = text.split(/(\*\*[^\*]+\*\*|\*[^\*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}
