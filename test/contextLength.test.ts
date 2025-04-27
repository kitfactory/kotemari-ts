import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Kotemari } from '../src/kotemari';
import fs from 'fs';
import path from 'path';

const tmpDir = path.join(__dirname, 'tmp_ctx_project2');

function setupFiles() {
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
  fs.writeFileSync(path.join(tmpDir, 'a.ts'), `import { B } from './b';\nexport const A = "${'A'.repeat(100)}";`);
  fs.writeFileSync(path.join(tmpDir, 'b.ts'), `export const B = "${'B'.repeat(100)}";`);
}
function cleanupFiles() {
  if (fs.existsSync(tmpDir)) {
    const files = fs.readdirSync(tmpDir);
    if (files.length > 0) {
      console.log('[DEBUG] 削除前のtmp_ctx_project2内容:', files);
    }
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

describe('Kotemari context length policy', () => {
  beforeEach(() => {
    cleanupFiles();
    setupFiles();
  });
  afterEach(() => {
    cleanupFiles();
  });

  it('maxContextLengthを超える場合にトリミングされる', async () => {
    const k = new Kotemari({ projectRoot: tmpDir, maxContextLength: 150 });
    await k.analyzeProject();
    const ctx = await k.getContext('a.ts');
    // 150文字以内に収まっていること
    expect(ctx.length).toBeLessThanOrEqual(150);
    // 先頭はa.tsの内容
    expect(ctx.startsWith("import { B } from './b';")).toBe(true);
  });

  it('maxContextLength未指定なら全内容が返る', async () => {
    const k = new Kotemari({ projectRoot: tmpDir });
    await k.analyzeProject();
    const ctx = await k.getContext('a.ts');
    // 100 + 100 + import文などで200超
    expect(ctx.length).toBeGreaterThan(200);
  });
});
