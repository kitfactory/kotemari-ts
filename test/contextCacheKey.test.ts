import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Kotemari } from '../src/kotemari';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const tmpDir = path.join(__dirname, 'tmp_ctx_cachekey');

function setupFiles() {
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
  fs.writeFileSync(path.join(tmpDir, 'a.ts'), `import { B } from './b';\nexport const A = 'A';`);
  fs.writeFileSync(path.join(tmpDir, 'b.ts'), `export const B = 'B';`);
}
function cleanupFiles() {
  if (fs.existsSync(tmpDir)) {
    const files = fs.readdirSync(tmpDir);
    if (files.length > 0) {
      console.log('[DEBUG] 削除前のtmp_ctx_cachekey内容:', files);
    }
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

describe('Kotemari キャッシュキー生成', () => {
  beforeEach(() => {
    cleanupFiles();
    setupFiles();
  });
  afterEach(() => {
    cleanupFiles();
  });

  it('同じ依存・内容・maxContextLengthでキャッシュキーが同じになる', async () => {
    const k1 = new Kotemari({ projectRoot: tmpDir, maxContextLength: 100 });
    await k1.analyzeProject();
    const ctx1 = await k1.getContext('a.ts');
    const key1 = k1.generateContextCacheKey('a.ts');

    const k2 = new Kotemari({ projectRoot: tmpDir, maxContextLength: 100 });
    await k2.analyzeProject();
    const ctx2 = await k2.getContext('a.ts');
    const key2 = k2.generateContextCacheKey('a.ts');

    expect(ctx1).toBe(ctx2);
    expect(key1).toBe(key2);
  });

  it('maxContextLengthが異なるとキャッシュキーも異なる', async () => {
    const k1 = new Kotemari({ projectRoot: tmpDir, maxContextLength: 100 });
    await k1.analyzeProject();
    const key1 = k1.generateContextCacheKey('a.ts');

    const k2 = new Kotemari({ projectRoot: tmpDir, maxContextLength: 50 });
    await k2.analyzeProject();
    const key2 = k2.generateContextCacheKey('a.ts');

    expect(key1).not.toBe(key2);
  });
});
