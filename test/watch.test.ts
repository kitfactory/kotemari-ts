import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Kotemari } from '../src/kotemari';
class TestableKotemari extends Kotemari {
  public async _invokeAnalyzeProject() {
    return super._invokeAnalyzeProject();
  }
}

import fs from 'fs';
import path from 'path';

const tmpDir = path.join(__dirname, 'tmp_project_watch');

function setupFiles() {
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
  fs.writeFileSync(path.join(tmpDir, 'watch.ts'), "export const W = 1;");
}
function cleanupFiles() {
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

describe('Kotemari ウォッチ機能', () => {
  beforeEach(() => {
    cleanupFiles();
    setupFiles();
  });
  afterEach(() => {
    cleanupFiles();
  });

  it('ファイル追加時に自動でanalyzeProjectが呼ばれる', async () => {
    const k = new TestableKotemari({ projectRoot: tmpDir });
    let called = false;
    k._invokeAnalyzeProject = async () => { called = true; };
    k.startWatching();
    // chokidarの'ready'イベントを待ってからファイル追加
    await new Promise(res => {
      (k as any)._watcher.on('ready', res);
    });
    // addイベントを直接監視
    const filePath = path.join(tmpDir, 'newfile.ts');
    const addEventPromise = new Promise<void>(resolve => {
      (k as any)._watcher.on('add', () => resolve());
    });
    fs.writeFileSync(filePath, 'export const N = 2;');
    await addEventPromise;
    await new Promise(res => setTimeout(res, 200)); // analyzeProjectが呼ばれるのを待つ
    expect(called).toBe(true);
    k.stopWatching();
  }, 15000);

  it('stopWatchingで監視が停止する', async () => {
    const k = new TestableKotemari({ projectRoot: tmpDir });
    let called = false;
    k._invokeAnalyzeProject = async () => { called = true; };
    k.startWatching();
    k.stopWatching();
    fs.writeFileSync(path.join(tmpDir, 'shouldnot.ts'), 'export const S = 3;');
    await new Promise(res => setTimeout(res, 300));
    expect(called).toBe(false);
  });
});
