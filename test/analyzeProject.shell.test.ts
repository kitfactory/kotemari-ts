import { describe, it, expect, beforeEach } from 'vitest';
import { Kotemari } from '../src/kotemari';
import fs from 'fs';
import path from 'path';

const tmpDir = path.join(__dirname, 'tmp_project_shell');
const fileA = path.join(tmpDir, 'a.sh');
const fileB = path.join(tmpDir, 'b.sh');

function setupFiles() {
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
  fs.writeFileSync(fileA, ". ./b.sh\nA=1");
  fs.writeFileSync(fileB, "B=2");
}
function cleanupFiles() {
  if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
}

describe('Kotemari.analyzeProject (Shell)', () => {
  beforeEach(() => {
    cleanupFiles();
    setupFiles();
  });

  it('Shell依存関係解析が行われる', async () => {
    const k = new Kotemari({ projectRoot: tmpDir });
    await k.analyzeProject();
    const files = k.listFiles();
    expect(files.map(f => f.path).sort()).toEqual(['a.sh', 'b.sh']);
    expect(k.getDependencies('a.sh')).toEqual(['b.sh']);
    expect(k.getReverseDependencies('b.sh')).toEqual(['a.sh']);
  });
});
