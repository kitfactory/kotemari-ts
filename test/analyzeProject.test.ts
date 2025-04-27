import { describe, it, expect, beforeEach } from 'vitest';
import { Kotemari } from '../src/kotemari';
import fs from 'fs';
import path from 'path';

// テスト用に一時ディレクトリとファイルを作成
const tmpDir = path.join(__dirname, 'tmp_project_analyze');
const fileA = path.join(tmpDir, 'a.ts');
const fileB = path.join(tmpDir, 'b.ts');

function setupFiles() {
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
  fs.writeFileSync(fileA, "import { B } from './b';\nexport const A = 1;");
  fs.writeFileSync(fileB, "export const B = 2;");
}
function cleanupFiles() {
  if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
}

describe('Kotemari.analyzeProject', () => {
  beforeEach(() => {
    cleanupFiles();
    setupFiles();
  });

  it('プロジェクト全体の依存解析が行われる', async () => {
    const k = new Kotemari({ projectRoot: tmpDir });
    await k.analyzeProject();
    // listFilesで2ファイルが返ること
    const files = k.listFiles();
    expect(files.map(f => f.path).sort()).toEqual(['a.ts', 'b.ts']);
    // a.tsの依存先がb.tsであること
    expect(k.getDependencies('a.ts')).toEqual(['b.ts']);
    // b.tsの依存元がa.tsであること
    expect(k.getReverseDependencies('b.ts')).toEqual(['a.ts']);
  });
});
