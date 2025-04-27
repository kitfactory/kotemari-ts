import { describe, it, expect } from 'vitest';
import { Kotemari } from '../src/kotemari';

describe('Kotemari クラス', () => {
  it('maxContextLengthがオプションで指定された場合、プロパティに正しくセットされる', () => {
    const k = new Kotemari({ projectRoot: '/my/project', maxContextLength: 1234 });
    expect(k.maxContextLength).toBe(1234);
  });

  it('maxContextLengthが設定ファイルで指定された場合、プロパティに正しくセットされる', () => {
    // 設定ファイルをモック
    const origReadFileSync = require('fs').readFileSync;
    const origExistsSync = require('fs').existsSync;
    require('fs').existsSync = (p: string) => p.endsWith('.kotemari.yml') ? true : origExistsSync(p);
    require('fs').readFileSync = (p: string) => p.endsWith('.kotemari.yml') ? 'maxContextLength: 5678' : origReadFileSync(p);
    const k = new Kotemari({ projectRoot: '/my/project', configPath: '/my/project/.kotemari.yml' });
    expect(k.maxContextLength).toBe(5678);
    require('fs').readFileSync = origReadFileSync;
    require('fs').existsSync = origExistsSync;
  });

  it('コンストラクタでプロパティが正しくセットされる', () => {
    const k = new Kotemari({
      projectRoot: '/my/project',
      configPath: '/my/project/.kotemari.yml',
      useCache: false,
      logLevel: 'info',
    });
    expect(k.projectRoot).toBe('/my/project');
    expect(k.configPath).toBe('/my/project/.kotemari.yml');
    expect(k.useCache).toBe(false);
    expect(k.logLevel).toBe('info');
  });

  it('オプション省略時はデフォルト値がセットされる', () => {
    const k = new Kotemari({ projectRoot: '/my/project' });
    expect(k.projectRoot).toBe('/my/project');
    expect(k.configPath).toBeUndefined();
    expect(k.useCache).toBe(true);
    expect(k.logLevel).toBe('warn');
  });
});
