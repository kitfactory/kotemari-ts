import { describe, it, expect } from 'vitest';
import { countTokens } from '../src/tokenCountUtil';

describe('countTokens ユーティリティ', () => {
  it('単純文字数カウント', () => {
    expect(countTokens('abc')).toBe(3);
    expect(countTokens('あいう')).toBe(3);
    expect(countTokens('')).toBe(0);
  });
  it('サロゲートペアや改行もカウント', () => {
    expect(countTokens('a\n\u{1F600}b')).toBe(4); // a + 改行 + 絵文字 + b
  });
});
