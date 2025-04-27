import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Kotemari } from '../src/kotemari';
import fs from 'fs';
import path from 'path';

const tmpDir = path.join(__dirname, 'tmp_project');
const configPath = path.join(tmpDir, '.kotemari.yml');

function setupFiles() {
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
  fs.writeFileSync(configPath, `exclude:\n  - ignore.ts\n`);
  fs.writeFileSync(path.join(tmpDir, 'main.ts'), "import { X } from './x';\nexport const Main = 0;");
  fs.writeFileSync(path.join(tmpDir, 'x.ts'), "export const X = 1;");
  fs.writeFileSync(path.join(tmpDir, 'ignore.ts'), "export const IGNORE = true;");
}
function cleanupFiles() {
  if (fs.existsSync(tmpDir)) {
    fs.rmdirSync(tmpDir, { recursive: true });
  }
}

describe('Kotemari 設定ファイル読み込み', () => {
  beforeEach(() => {
    cleanupFiles();
    setupFiles();
  });
  afterEach(() => {
    cleanupFiles();
  });

  it('.kotemari.ymlのexcludeが適用される', async () => {
    const k = new Kotemari({ projectRoot: tmpDir, configPath });
    await k.analyzeProject();
    const files = k.listFiles();
    // ignore.tsが除外されていること
    expect(files.map(f => f.path)).not.toContain('ignore.ts');
  });
});
