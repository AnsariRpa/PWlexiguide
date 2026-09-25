/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DocumentChunk } from "../types";

/**
 * Splits extracted document text into evidence-friendly chunks.
 *
 * PDF page markers are expected in the following format:
 *
 * --- Page 1 ---
 * --- Page 2 ---
 *
 * Page boundaries are preserved so LexiGuide can provide
 * page-level evidence references.
 */
export function chunkDocumentText(
  text: string,
  documentId: string
): DocumentChunk[] {
  if (!text || !text.trim()) {
    return [];
  }

  const normalizedText = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  const pagePattern = /^---\s*Page\s+(\d+)\s*---\s*$/gim;
  const matches = [...normalizedText.matchAll(pagePattern)];

  const pages: Array<{
    pageNumber: number;
    text: string;
  }> = [];

  if (matches.length === 0) {
    pages.push({
      pageNumber: 1,
      text: normalizedText
    });
  } else {
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];

      const pageNumber = Number(match[1]);
      const start = (match.index ?? 0) + match[0].length;

      const end =
        i + 1 < matches.length
          ? matches[i + 1].index ?? normalizedText.length
          : normalizedText.length;

      const pageText = normalizedText
        .slice(start, end)
        .trim();

      pages.push({
        pageNumber,
        text: pageText
      });
    }
  }

  const chunks: DocumentChunk[] = [];

  for (const page of pages) {
    if (!page.text.trim()) {
      continue;
    }

    const paragraphs = page.text
      .split(/\n\s*\n+/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    if (paragraphs.length === 0) {
      continue;
    }

    paragraphs.forEach((paragraph, paragraphIndex) => {
      const lines = paragraph
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length === 0) {
        return;
      }

      const section =
        lines[0].length <= 200
          ? lines[0]
          : "Document Content";

      const chunkText = lines.join("\n");

      chunks.push({
        id: `${documentId}-p${page.pageNumber}-c${paragraphIndex + 1}`,
        documentId,
        documentName: "",
        pageNumber: page.pageNumber,
        section,
        paragraph: paragraphIndex + 1,
        lineRange:
          lines.length === 1
            ? "1"
            : `1-${lines.length}`,
        text: chunkText
      });
    });
  }

  return chunks;
}