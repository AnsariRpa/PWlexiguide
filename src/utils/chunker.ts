/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DocumentChunk } from '../types';

export function chunkDocumentText(docId: string, docName: string, rawText: string): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  
  // Check if text has page markers like '--- Page X ---'
  const pageRegex = /---\s*Page\s*(\d+)\s*---/gi;
  const hasPageMarkers = pageRegex.test(rawText);

  let pages: { pageNum: number; content: string }[] = [];

  if (hasPageMarkers) {
    const splitParts = rawText.split(/---\s*Page\s*(\d+)\s*---/gi);
    // splitParts will alternate: [preamble, pageNum1, content1, pageNum2, content2, ...]
    let currentPage = 1;
    for (let i = 1; i < splitParts.length; i += 2) {
      const pageNum = parseInt(splitParts[i], 10) || currentPage;
      const content = splitParts[i + 1] || '';
      pages.push({ pageNum, content });
      currentPage = pageNum + 1;
    }
  } else {
    // If no page markers, simulate ~45 lines or ~2500 chars per page
    const lines = rawText.split('\n');
    const linesPerPage = 45;
    for (let i = 0; i < lines.length; i += linesPerPage) {
      const pageLines = lines.slice(i, i + linesPerPage);
      pages.push({
        pageNum: Math.floor(i / linesPerPage) + 1,
        content: pageLines.join('\n')
      });
    }
  }

  if (pages.length === 0) {
    pages = [{ pageNum: 1, content: rawText }];
  }

  let chunkCounter = 1;
  let overallLineCounter = 1;

  for (const page of pages) {
    const rawParagraphs = page.content.split(/\n\s*\n+/);
    let currentSection = 'General Terms';
    let paraInPage = 1;

    for (const para of rawParagraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;

      const lines = trimmed.split('\n');
      const startLine = overallLineCounter;
      const endLine = overallLineCounter + lines.length - 1;
      overallLineCounter += lines.length;

      // Detect section header in first line
      const firstLine = lines[0].trim();
      const sectionMatch = firstLine.match(/^(?:Section|Article|Clause|Rule|Part)\s+([0-9A-Za-z\.\-_]+(?:\s+[-:–—]\s+[^\n]+)?)/i);
      if (sectionMatch) {
        currentSection = firstLine.slice(0, 80);
      } else if (firstLine.length < 60 && /^[A-Z0-9\s.,–—\-:]+$/.test(firstLine) && !firstLine.includes('.')) {
        // All-caps header
        currentSection = firstLine;
      }

      const chunkId = `${docId}-p${page.pageNum}-c${chunkCounter}`;
      chunks.push({
        id: chunkId,
        documentId: docId,
        documentName: docName,
        pageNumber: page.pageNum,
        section: currentSection,
        paragraph: paraInPage,
        lineRange: `Lines ${startLine}–${endLine}`,
        text: trimmed
      });

      chunkCounter++;
      paraInPage++;
    }
  }

  return chunks;
}
