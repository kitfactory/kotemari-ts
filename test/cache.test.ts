import { describe, it, expect, beforeEach } from 'vitest';
import { Kotemari } from '../src/kotemari';
import fs from 'fs';
import path from 'path';

const tmpDir = path.join(__dirname, 'tmp_project');
const cacheFile = path.join(tmpDir, '.kotemari.cache.json');

function setupFiles() {
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
  fs.writeFileSync(path.join(tmpDir, 'a.ts'), "export const A = 1;");
}
function cleanupFiles() {
  if (fs.existsSync(tmpDir)) {
    fs.rmdirSync(tmpDir, { recursive: true });
  }
}

describe('Kotemari キャッシュ機能', () => {
  beforeEach(() => {
    cleanupFiles();
    setupFiles();
  });

  it('キャッシュファイルを作成・削除できる', async () => {
    const k = new Kotemari({ projectRoot: tmpDir });
    await k.analyzeProject();
    // キャッシュをファイルに保存
    k.saveCache(cacheFile);
    expect(fs.existsSync(cacheFile)).toBe(true);
    // キャッシュをクリア
    k.clearCache();
    expect(k.listFiles().length).toBe(0);
    // キャッシュファイルも削除
    expect(fs.existsSync(cacheFile)).toBe(false);
  });
});
