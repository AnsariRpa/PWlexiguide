/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { chunkDocumentText } from '../src/utils/chunker';

describe('chunkDocumentText utility', () => {
  it('returns empty array when text is empty or whitespace', () => {
    expect(chunkDocumentText('', 'doc-1')).toEqual([]);
    expect(chunkDocumentText('   \n  \t  ', 'doc-1')).toEqual([]);
  });

  it('chunks a single page document without page markers', () => {
    const text = `Section 1. Definitions
"Confidential Information" means all proprietary non-public data.

Section 2. Non-Disclosure Obligations
Recipient agrees to hold Disclosing Party's information in strict confidence.`;

    const chunks = chunkDocumentText(text, 'doc-100');
    expect(chunks.length).toBe(2);

    expect(chunks[0].id).toBe('doc-100-p1-c1');
    expect(chunks[0].pageNumber).toBe(1);
    expect(chunks[0].section).toBe('Section 1. Definitions');
    expect(chunks[0].text).toContain('Confidential Information');

    expect(chunks[1].id).toBe('doc-100-p1-c2');
    expect(chunks[1].pageNumber).toBe(1);
    expect(chunks[1].section).toBe('Section 2. Non-Disclosure Obligations');
    expect(chunks[1].text).toContain('strict confidence');
  });

  it('preserves multi-page markers and assigns accurate page numbers', () => {
    const multiPageText = `--- Page 1 ---
Section 1. Term of Lease
The lease term shall commence on October 1, 2026.

--- Page 2 ---
Section 2. Security Deposit
Tenant shall deposit with Landlord the sum of $2,500 as security.

Section 3. Utilities
Tenant shall be responsible for electric and water bills.`;

    const chunks = chunkDocumentText(multiPageText, 'lease-doc');
    expect(chunks.length).toBe(3);

    // Page 1 chunk
    expect(chunks[0].pageNumber).toBe(1);
    expect(chunks[0].section).toBe('Section 1. Term of Lease');
    expect(chunks[0].id).toBe('lease-doc-p1-c1');

    // Page 2 chunks
    expect(chunks[1].pageNumber).toBe(2);
    expect(chunks[1].section).toBe('Section 2. Security Deposit');
    expect(chunks[1].id).toBe('lease-doc-p2-c1');

    expect(chunks[2].pageNumber).toBe(2);
    expect(chunks[2].section).toBe('Section 3. Utilities');
    expect(chunks[2].id).toBe('lease-doc-p2-c2');
  });

  it('normalizes carriage returns and multiple newlines correctly', () => {
    const rawText = "--- Page 1 ---\r\n\r\nHeading 1\r\nLine A\r\nLine B\r\n\r\nHeading 2\r\nLine C";
    const chunks = chunkDocumentText(rawText, 'crlf-doc');

    expect(chunks.length).toBe(2);
    expect(chunks[0].section).toBe('Heading 1');
    expect(chunks[0].lineRange).toBe('1-3');
    expect(chunks[1].section).toBe('Heading 2');
    expect(chunks[1].lineRange).toBe('1-2');
  });
});
