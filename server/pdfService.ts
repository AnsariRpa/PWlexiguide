/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PDFParse } from "pdf-parse";

export async function parsePdfBuffer(
  buffer: Buffer
): Promise<{ text: string; numPages: number }> {
  let parser: PDFParse | undefined;

  try {
    if (!buffer || buffer.length === 0) {
      throw new Error("PDF buffer is empty.");
    }

    parser = new PDFParse({ data: buffer });

    /*
     * First read the document to determine the total page count.
     */
    const info = await parser.getInfo({
      parsePageInfo: true
    });

    const totalPages = info.total || 1;

    /*
     * Extract each page individually.
     *
     * pdf-parse v2 supports page-specific extraction through
     * getText({ partial: [...] }).
     *
     * We deliberately preserve page boundaries because LexiGuide
     * uses page numbers as part of its evidence references.
     */
    const pageTexts: string[] = [];

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      const pageResult = await parser.getText({
        partial: [pageNumber]
      });

      const pageText = (pageResult.text || "").trim();

      if (pageText) {
        pageTexts.push(
          `--- Page ${pageNumber} ---\n${pageText}`
        );
      } else {
        /*
         * Preserve the page marker even when a page contains
         * no extractable text. This keeps page numbering aligned
         * with the original PDF.
         */
        pageTexts.push(
          `--- Page ${pageNumber} ---`
        );
      }
    }

    const extractedText = pageTexts.join("\n\n").trim();

    if (!extractedText) {
      throw new Error(
        "No extractable text was found in the PDF."
      );
    }

    return {
      text: extractedText,
      numPages: totalPages
    };
  } catch (err: any) {
    console.error(
      "Error parsing PDF with pdf-parse:",
      err
    );

    throw new Error(
      `Could not parse PDF document${
        err?.message ? `: ${err.message}` : ""
      }`
    );
  } finally {
    if (parser) {
      await parser.destroy().catch(() => {});
    }
  }
}