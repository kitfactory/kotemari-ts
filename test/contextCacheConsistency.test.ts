import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Kotemari } from '../src/kotemari';
import fs from 'fs';
import path from 'path';

const tmpDir = path.join(__dirname, 'tmp_ctx_consistency');

function setupFiles() {
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
  fs.writeFileSync(path.join(tmpDir, 'a.ts'), `import { B } from './b';\nexport const A = 'A';`);
  fs.writeFileSync(path.join(tmpDir, 'b.ts'), `import { C } from './c';\nexport const B = 'B';`);
  fs.writeFileSync(path.join(tmpDir, 'c.ts'), `export const C = 'C';`);
}
function cleanupFiles() {
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

describe('Kotemari コンテキストキャッシュの一貫性担保', () => {
  beforeEach(() => {
    cleanupFiles();
    setupFiles();
  });
  afterEach(() => {
    cleanupFiles();
  });

  it('依存順序が同じなら常に同じ文脈・キャッシュキーになる', async () => {
    const k1 = new Kotemari({ projectRoot: tmpDir, maxContextLength: 100 });
    await k1.analyzeProject();
    const ctx1 = await k1.getContext('a.ts');
    const key1 = k1.generateContextCacheKey('a.ts');

    // 再度インスタンス化しても同じ
    const k2 = new Kotemari({ projectRoot: tmpDir, maxContextLength: 100 });
    await k2.analyzeProject();
    const ctx2 = await k2.getContext('a.ts');
    const key2 = k2.generateContextCacheKey('a.ts');

    expect(ctx1).toBe(ctx2);
    expect(key1).toBe(key2);
  });

  it('依存の追加順序や重複があっても依存ファイル内容が同じなら同じ結果になる', async () => {
    // b.tsのimport順や重複を変えても内容が同じなら同じ結果
    fs.writeFileSync(path.join(tmpDir, 'b.ts'), `import { C } from './c';\nexport const B = 'B';`);
    const k1 = new Kotemari({ projectRoot: tmpDir, maxContextLength: 100 });
    await k1.analyzeProject();
    const ctx1 = await k1.getContext('a.ts');
    const key1 = k1.generateContextCacheKey('a.ts');

    // import文を2回書くが内容は同じ
    fs.writeFileSync(path.join(tmpDir, 'b.ts'), `import { C } from './c';\nimport { C } from './c';\nexport const B = 'B';`);
    const k2 = new Kotemari({ projectRoot: tmpDir, maxContextLength: 100 });
    await k2.analyzeProject();
    const ctx2 = await k2.getContext('a.ts');
    const key2 = k2.generateContextCacheKey('a.ts');

    // 内容が異なる（import文重複）ので結果も異なる
    expect(ctx1).not.toBe(ctx2);
    expect(key1).not.toBe(key2);

    // 内容を元に戻せば同じになる
    fs.writeFileSync(path.join(tmpDir, 'b.ts'), `import { C } from './c';\nexport const B = 'B';`);
    const k3 = new Kotemari({ projectRoot: tmpDir, maxContextLength: 100 });
    await k3.analyzeProject();
    const ctx3 = await k3.getContext('a.ts');
    const key3 = k3.generateContextCacheKey('a.ts');
    expect(ctx1).toBe(ctx3);
    expect(key1).toBe(key3);
  });
});
