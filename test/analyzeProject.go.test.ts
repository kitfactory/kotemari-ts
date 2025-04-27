import { describe, it, expect, beforeEach } from 'vitest';
import { Kotemari } from '../src/kotemari';
import fs from 'fs';
import path from 'path';

const tmpDir = path.join(__dirname, 'tmp_project_go');
const fileA = path.join(tmpDir, 'a.go');
const fileB = path.join(tmpDir, 'b.go');

function setupFiles() {
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
  fs.writeFileSync(fileA, 'import "./b"\nvar A = 1');
  fs.writeFileSync(fileB, 'var B = 2');
}
function cleanupFiles() {
  if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
}

describe('Kotemari.analyzeProject (Go)', () => {
  beforeEach(() => {
    cleanupFiles();
    setupFiles();
  });

  it('Go依存関係解析が行われる', async () => {
    const k = new Kotemari({ projectRoot: tmpDir });
    await k.analyzeProject();
    const files = k.listFiles();
    expect(files.map(f => f.path).sort()).toEqual(['a.go', 'b.go']);
    expect(k.getDependencies('a.go')).toEqual(['b.go']);
    expect(k.getReverseDependencies('b.go')).toEqual(['a.go']);
  });
});
