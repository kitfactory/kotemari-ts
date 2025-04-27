import { describe, it, expect } from 'vitest';
import { Kotemari } from '../src/kotemari';

describe('Kotemari クラス', () => {
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
