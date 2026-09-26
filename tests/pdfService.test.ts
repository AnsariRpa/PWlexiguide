/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { parsePdfBuffer } from '../server/pdfService';

describe('PDF Service & Parsing Robustness', () => {
  it('throws an informative error if buffer is empty', async () => {
    await expect(parsePdfBuffer(Buffer.alloc(0))).rejects.toThrow('PDF buffer is empty');
  });

  it('correctly parses a minimal synthetic PDF buffer', async () => {
    // Standard minimal single-page PDF structure
    const minimalPdfBase64 =
      'JVBERi0xLjQKJcTl8uXrCjEgMCBvYmoKPDwgL0tpZHMgWyAyIDAgUiBdIC9Db3VudCAxIC9UeXBlIC9QYWdlcyA+PgplbmRvYmoKMiAwIG9iago8PCAvUGFyZW50IDEgMCBSIC9UeXBlIC9QYWdlIC9NZWRpYUJveCBbIDAgMCA2MTIgNzkyIF0gPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1BhZ2VzIDEgMCBSIC9UeXBlIC9DYXRhbG9nID4+CmVuZG9iagp4cmVmCjAgNAowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDA3NCAwMDAwMCBuIAowMDAwMDAwMTQzIDAwMDAwIG4gCnRyYWlsZXIKPDwgL1Jvb3QgMyAwIFIgL1NpemUgNCA+PgpzdGFydHhyZWYKMTkzCiUlRU9GCg==';

    const buffer = Buffer.from(minimalPdfBase64, 'base64');
    const result = await parsePdfBuffer(buffer);

    expect(result.numPages).toBe(1);
    expect(result.text).toContain('--- Page 1 ---');
  });
});
