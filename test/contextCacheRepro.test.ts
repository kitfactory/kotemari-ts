import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Kotemari } from '../src/kotemari';
import fs from 'fs';
import path from 'path';

const tmpDir = path.join(__dirname, 'tmp_ctx_repro');

function setupFiles() {
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
  fs.writeFileSync(path.join(tmpDir, 'a.ts'), `import { B } from './b';\nexport const A = 'A';`);
  fs.writeFileSync(path.join(tmpDir, 'b.ts'), `export const B = 'B';`);
}
function cleanupFiles() {
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

describe('Kotemari キャッシュ再現性', () => {
  beforeEach(() => {
    cleanupFiles();
    setupFiles();
  });
  afterEach(() => {
    cleanupFiles();
  });

  it('同じプロジェクト状態でキャッシュキー・文脈内容が再現される', async () => {
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

  it('依存ファイル内容が変わるとキャッシュキー・文脈内容も変わる', async () => {
    const k1 = new Kotemari({ projectRoot: tmpDir, maxContextLength: 100 });
    await k1.analyzeProject();
    const key1 = k1.generateContextCacheKey('a.ts');
    const ctx1 = await k1.getContext('a.ts');

    // b.tsを書き換え
    fs.writeFileSync(path.join(tmpDir, 'b.ts'), `export const B = 'BB';`);
    const k2 = new Kotemari({ projectRoot: tmpDir, maxContextLength: 100 });
    await k2.analyzeProject();
    const key2 = k2.generateContextCacheKey('a.ts');
    const ctx2 = await k2.getContext('a.ts');

    expect(ctx1).not.toBe(ctx2);
    expect(key1).not.toBe(key2);
  });
});
