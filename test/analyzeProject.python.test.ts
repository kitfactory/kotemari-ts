import { describe, it, expect, beforeEach } from 'vitest';
import { Kotemari } from '../src/kotemari';
import fs from 'fs';
import path from 'path';

const tmpDir = path.join(__dirname, 'tmp_project_python');
const fileA = path.join(tmpDir, 'a.py');
const fileB = path.join(tmpDir, 'b.py');

function setupFiles() {
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
  fs.writeFileSync(fileA, "import b\nA = 1");
  fs.writeFileSync(fileB, "B = 2");
}
function cleanupFiles() {
  if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
}

describe('Kotemari.analyzeProject (Python)', () => {
  beforeEach(() => {
    cleanupFiles();
    setupFiles();
  });

  it('Python依存関係解析が行われる', async () => {
    const k = new Kotemari({ projectRoot: tmpDir });
    await k.analyzeProject();
    const files = k.listFiles();
    expect(files.map(f => f.path).sort()).toEqual(['a.py', 'b.py']);
    expect(k.getDependencies('a.py')).toEqual(['b.py']);
    expect(k.getReverseDependencies('b.py')).toEqual(['a.py']);
  });
});
