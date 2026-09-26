/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { createDemoToken, verifyDemoToken } from '../server/authMiddleware';

describe('Auth Middleware & Session Token Security', () => {
  it('generates a valid signed demo HMAC session token', () => {
    const token = createDemoToken('demo-user-123', 'Alice Reviewer');
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);
    expect(token.startsWith('demo.')).toBe(true);

    const parts = token.split('.');
    expect(parts.length).toBe(3);
  });

  it('successfully verifies a valid demo token and returns the user payload', () => {
    const uid = 'demo-user-456';
    const name = 'Bob Inspector';
    const token = createDemoToken(uid, name);

    const user = verifyDemoToken(token);
    expect(user).not.toBeNull();
    expect(user?.uid).toBe(uid);
    expect(user?.name).toBe(name);
  });

  it('rejects tampered or forged tokens', () => {
    const validToken = createDemoToken('user-1', 'User One');
    const [prefix, payload, signature] = validToken.split('.');

    // Tamper with payload
    const tamperedPayload = Buffer.from(
      JSON.stringify({ uid: 'admin-user', name: 'Hacker', iat: Date.now() })
    ).toString('base64url');

    const tamperedToken = `${prefix}.${tamperedPayload}.${signature}`;
    const result = verifyDemoToken(tamperedToken);
    expect(result).toBeNull();
  });

  it('rejects malformed token strings', () => {
    expect(verifyDemoToken('not-a-jwt')).toBeNull();
    expect(verifyDemoToken('')).toBeNull();
    expect(verifyDemoToken('demo.onlytwo.parts')).toBe(null);
    expect(verifyDemoToken('token.with.differentprefix')).toBeNull();
  });
});
