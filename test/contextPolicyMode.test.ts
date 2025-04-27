import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Kotemari } from '../src/kotemari';
import fs from 'fs';
import path from 'path';

const tmpDir = path.join(__dirname, 'tmp_ctx_mode');

function setupFiles() {
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
  fs.writeFileSync(path.join(tmpDir, 'a.ts'), `export const A = '${'A'.repeat(1000)}';`);
}
function cleanupFiles() {
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

describe('Kotemari 利用モードごとのポリシー切り替え', () => {
  beforeEach(() => {
    cleanupFiles();
    setupFiles();
  });
  afterEach(() => {
    cleanupFiles();
  });

  it('localLLMモード時はmaxContextLength=4000がデフォルト', async () => {
    const k = new Kotemari({ projectRoot: tmpDir, mode: 'localLLM' as any });
    await k.analyzeProject();
    expect(k.maxContextLength).toBe(4000);
  });

  it('cloudLLMモード時はmaxContextLength=8000がデフォルト', async () => {
    const k = new Kotemari({ projectRoot: tmpDir, mode: 'cloudLLM' as any });
    await k.analyzeProject();
    expect(k.maxContextLength).toBe(8000);
  });

  it('明示的にmaxContextLengthを指定した場合は優先', async () => {
    const k = new Kotemari({ projectRoot: tmpDir, mode: 'cloudLLM' as any, maxContextLength: 1234 });
    await k.analyzeProject();
    expect(k.maxContextLength).toBe(1234);
  });
});
