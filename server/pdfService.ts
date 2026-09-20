/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as pdfParseModule from 'pdf-parse';

// Handle potential ESM / CJS module export variations
const pdfParse: any = (pdfParseModule as any)?.default || pdfParseModule;

export async function parsePdfBuffer(buffer: Buffer): Promise<{ text: string; numPages: number }> {
  try {
    const data = await pdfParse(buffer);
    const numPages = data.numpages || 1;
    let text = data.text || '';

    // If pdf-parse didn't insert page markers, format with page markers
    if (!text.includes('--- Page')) {
      // Clean up common form feed characters (\f) which represent page breaks in PDF text
      if (text.includes('\f')) {
        const pages = text.split('\f');
        text = pages.map((pageText: string, idx: number) => `--- Page ${idx + 1} ---\n${pageText.trim()}`).join('\n\n');
      } else {
        text = `--- Page 1 ---\n${text.trim()}`;
      }
    }

    return {
      text,
      numPages
    };
  } catch (err) {
    console.error("Error parsing PDF with pdf-parse:", err);
    throw new Error("Could not parse PDF document. Please ensure it is a valid, unencrypted PDF text file.");
  }
}
