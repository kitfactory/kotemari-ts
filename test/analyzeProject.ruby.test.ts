import { describe, it, expect, beforeEach } from 'vitest';
import { Kotemari } from '../src/kotemari';
import fs from 'fs';
import path from 'path';

const tmpDir = path.join(__dirname, 'tmp_project_ruby');
const fileA = path.join(tmpDir, 'a.rb');
const fileB = path.join(tmpDir, 'b.rb');

function setupFiles() {
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
  fs.writeFileSync(fileA, "require './b'\nA = 1");
  fs.writeFileSync(fileB, "B = 2");
}
function cleanupFiles() {
  if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
}

describe('Kotemari.analyzeProject (Ruby)', () => {
  beforeEach(() => {
    cleanupFiles();
    setupFiles();
  });

  it('Ruby依存関係解析が行われる', async () => {
    const k = new Kotemari({ projectRoot: tmpDir });
    await k.analyzeProject();
    const files = k.listFiles();
    expect(files.map(f => f.path).sort()).toEqual(['a.rb', 'b.rb']);
    expect(k.getDependencies('a.rb')).toEqual(['b.rb']);
    expect(k.getReverseDependencies('b.rb')).toEqual(['a.rb']);
  });
});
