import { describe, it, expect, beforeEach } from 'vitest';
import { Kotemari } from '../src/kotemari';
import fs from 'fs';
import path from 'path';

const tmpDir = path.join(__dirname, 'tmp_ctx_project');

function setupFiles() {
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
  fs.writeFileSync(path.join(tmpDir, 'a.ts'), `import { B } from './b';\nexport const A = 1;`);
  fs.writeFileSync(path.join(tmpDir, 'b.ts'), `export const B = 2;`);
}
function cleanupFiles() {
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

describe('Kotemari getContext', () => {
  beforeEach(() => {
    cleanupFiles();
    setupFiles();
  });

  it('指定ファイルの内容＋依存ファイルの内容を連結した文脈文字列を返す', async () => {
    const k = new Kotemari({ projectRoot: tmpDir });
    await k.analyzeProject();
    const ctx = await k.getContext('a.ts');
    expect(ctx).toContain('export const A = 1;');
    expect(ctx).toContain('export const B = 2;');
    // 依存ファイルの内容も含まれる
    expect(ctx.indexOf('export const A = 1;')).toBeLessThan(ctx.indexOf('export const B = 2;'));
  });

  it('存在しないファイル名を指定した場合は空文字列', async () => {
    const k = new Kotemari({ projectRoot: tmpDir });
    await k.analyzeProject();
    const ctx = await k.getContext('notfound.ts');
    expect(ctx).toBe('');
  });
});
