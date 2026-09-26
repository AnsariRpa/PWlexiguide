/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { docStore } from '../server/docStore';
import { DocumentItem } from '../src/types';

describe('FirestoreDocumentStore (User Isolation & Storage)', () => {
  const userA = 'test-user-a';
  const userB = 'test-user-b';

  it('provides strict tenant isolation between different users', async () => {
    // Clear both users first
    await docStore.clearDocuments(userA);
    await docStore.clearDocuments(userB);

    const docA: DocumentItem = {
      id: 'doc-user-a-1',
      userId: userA,
      title: 'User A Confidential Contract',
      category: 'nda',
      fileType: 'text',
      createdAt: new Date().toISOString(),
      totalPages: 1,
      rawText: 'Party A Agreement text...',
      chunks: []
    };

    await docStore.addDocument(userA, docA);

    const docsA = await docStore.getDocuments(userA);
    const docsB = await docStore.getDocuments(userB);

    expect(docsA.length).toBe(1);
    expect(docsA[0].id).toBe('doc-user-a-1');
    expect(docsB.length).toBe(0); // User B cannot see User A documents
  });

  it('allows loading sample document bundles for a user', async () => {
    await docStore.clearDocuments(userA);

    const bundleDocs = await docStore.loadSampleBundleForUser(userA, 'bundle-employment-equity');
    expect(bundleDocs.length).toBeGreaterThan(0);

    const retrievedDocs = await docStore.getDocuments(userA);
    expect(retrievedDocs.length).toBe(bundleDocs.length);

    // Verify chunking occurred for loaded documents
    expect(retrievedDocs[0].chunks.length).toBeGreaterThan(0);
    expect(retrievedDocs[0].chunks[0].documentName).toBe(retrievedDocs[0].title);
  });

  it('supports document deletion', async () => {
    const docToDelete: DocumentItem = {
      id: 'doc-to-delete-123',
      userId: userA,
      title: 'Temporary Agreement',
      category: 'general',
      fileType: 'text',
      createdAt: new Date().toISOString(),
      totalPages: 1,
      rawText: 'Temp',
      chunks: []
    };

    await docStore.addDocument(userA, docToDelete);
    expect(await docStore.getDocument(userA, 'doc-to-delete-123')).toBeDefined();

    const deleted = await docStore.deleteDocument(userA, 'doc-to-delete-123');
    expect(deleted).toBe(true);

    const check = await docStore.getDocument(userA, 'doc-to-delete-123');
    expect(check).toBeUndefined();
  });
});
