/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { SAMPLE_DOCUMENT_BUNDLES } from '../src/data/sampleLegalDocs';

describe('Sample Legal Bundles & Schema Integrity', () => {
  it('contains pre-configured bundles for instant user onboarding', () => {
    expect(SAMPLE_DOCUMENT_BUNDLES.length).toBeGreaterThanOrEqual(3);

    const bundleIds = SAMPLE_DOCUMENT_BUNDLES.map(b => b.id);
    expect(bundleIds).toContain('bundle-employment-equity');
    expect(bundleIds).toContain('bundle-lease-residential');
    expect(bundleIds).toContain('bundle-saas-comparison');
  });

  it('each bundle contains valid documents with non-empty text and titles', () => {
    for (const bundle of SAMPLE_DOCUMENT_BUNDLES) {
      expect(bundle.name).toBeTruthy();
      expect(bundle.description).toBeTruthy();
      expect(bundle.documents.length).toBeGreaterThan(0);

      for (const doc of bundle.documents) {
        expect(doc.id).toBeTruthy();
        expect(doc.title).toBeTruthy();
        expect(doc.category).toBeTruthy();
        expect(doc.text.trim().length).toBeGreaterThan(100);
        expect(doc.totalPages).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('employment bundle contains key clauses for verification', () => {
    const empBundle = SAMPLE_DOCUMENT_BUNDLES.find(b => b.id === 'bundle-employment-equity');
    expect(empBundle).toBeDefined();

    const offerLetter = empBundle?.documents.find(d => d.title.includes('Offer'));
    expect(offerLetter).toBeDefined();
    expect(offerLetter?.text).toContain('Salary');
    expect(offerLetter?.text).toContain('Equity');
  });
});
