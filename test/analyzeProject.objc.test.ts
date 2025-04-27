import { describe, it, expect, beforeEach } from 'vitest';
import { Kotemari } from '../src/kotemari';
import fs from 'fs';
import path from 'path';

const tmpDir = path.join(__dirname, 'tmp_project_objc');
const fileA = path.join(tmpDir, 'a.m');
const fileB = path.join(tmpDir, 'b.h');

function setupFiles() {
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
  fs.writeFileSync(fileA, '#import "b.h"\nint main() { return 0; }');
  fs.writeFileSync(fileB, 'void foo();');
}
function cleanupFiles() {
  if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
}

describe('Kotemari.analyzeProject (Objective-C)', () => {
  beforeEach(() => {
    cleanupFiles();
    setupFiles();
  });

  it('Objective-C依存関係解析が行われる', async () => {
    const k = new Kotemari({ projectRoot: tmpDir });
    await k.analyzeProject();
    const files = k.listFiles();
    expect(files.map(f => f.path).sort()).toEqual(['a.m', 'b.h']);
    expect(k.getDependencies('a.m')).toEqual(['b.h']);
    expect(k.getReverseDependencies('b.h')).toEqual(['a.m']);
  });
});
