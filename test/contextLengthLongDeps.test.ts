import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Kotemari } from '../src/kotemari';
import fs from 'fs';
import path from 'path';

const tmpDir = path.join(__dirname, 'tmp_ctx_longdeps');

function setupFiles() {
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
  // a.ts → b.ts → c.ts → d.ts の依存（各100文字）
  fs.writeFileSync(path.join(tmpDir, 'a.ts'), `import { B } from './b';\nexport const A = "${'A'.repeat(100)}";`);
  fs.writeFileSync(path.join(tmpDir, 'b.ts'), `import { C } from './c';\nexport const B = "${'B'.repeat(100)}";`);
  fs.writeFileSync(path.join(tmpDir, 'c.ts'), `import { D } from './d';\nexport const C = "${'C'.repeat(100)}";`);
  fs.writeFileSync(path.join(tmpDir, 'd.ts'), `export const D = "${'D'.repeat(100)}";`);
}
function cleanupFiles() {
  if (fs.existsSync(tmpDir)) {
    const files = fs.readdirSync(tmpDir);
    if (files.length > 0) {
      console.log('[DEBUG] 削除前のtmp_ctx_longdeps内容:', files);
    }
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

describe('Kotemari 長い依存を持つ場合のコンテキスト長トリミング', () => {
  beforeEach(() => {
    cleanupFiles();
    setupFiles();
  });
  afterEach(() => {
    cleanupFiles();
  });

  it('maxContextLength=250でa.ts→b.ts→c.ts→d.tsの内容が優先順でトリミングされる', async () => {
    const k = new Kotemari({ projectRoot: tmpDir, maxContextLength: 250 });
    await k.analyzeProject();
    const ctx = await k.getContext('a.ts');
    // 250文字以内
    expect(ctx.length).toBeLessThanOrEqual(250);
    // a.ts, b.ts の内容は必ず含まれる（優先）
    expect(ctx).toContain('export const A =');
    expect(ctx).toContain('export const B =');
    // d.tsは含まれない可能性が高い
    // 先頭はa.tsのimport文
    expect(ctx.startsWith("import { B } from './b';")).toBe(true);
  });
});
