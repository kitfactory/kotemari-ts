import path from "path";
import fs from "fs";
import yaml from "yaml";

export interface FileInfo {
  path: string;
}

export interface KotemariOptions {
  projectRoot: string;
  configPath?: string;
  useCache?: boolean;
  logLevel?: "silent" | "error" | "warn" | "info" | "debug";
}

export interface KotemariConfig {
  exclude?: string[];
}

import chokidar from "chokidar";

export class Kotemari {
  projectRoot: string;
  configPath?: string;
  useCache: boolean;
  logLevel: "silent" | "error" | "warn" | "info" | "debug";
  private _files: FileInfo[] = [];
  private _dependencies: Record<string, string[]> = {};
  private _reverseDependencies: Record<string, string[]> = {};
  private _config: KotemariConfig = {};
  private _cacheFilePath?: string;
  private _watcher?: chokidar.FSWatcher;

  constructor(options: KotemariOptions) {
    this.projectRoot = options.projectRoot;
    this.configPath = options.configPath;
    this.useCache = options.useCache ?? true;
    this.logLevel = options.logLevel ?? "warn";
    this.loadConfig();
  }

  private loadConfig() {
    const configPath = this.configPath || path.join(this.projectRoot, '.kotemari.yml');
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf8');
      this._config = yaml.parse(content) || {};
    } else {
      this._config = {};
    }
  }

  async analyzeProject(): Promise<void> {
    let files = fs.readdirSync(this.projectRoot).filter(f => f.endsWith('.ts'));
    if (this._config.exclude) {
      files = files.filter(f => !this._config.exclude!.includes(f));
    }
    this._files = files.map(f => ({ path: f }));
    this._dependencies = {};
    this._reverseDependencies = {};
    for (const file of files) {
      const content = fs.readFileSync(path.join(this.projectRoot, file), 'utf8');
      const deps = Array.from(content.matchAll(/import .* from ['"]\.\/([\w\-]+)\.?[\w]*['"]/g)).map(m => m[1] + '.ts');
      this._dependencies[file] = deps;
      for (const dep of deps) {
        if (!this._reverseDependencies[dep]) this._reverseDependencies[dep] = [];
        this._reverseDependencies[dep].push(file);
      }
    }
  }

  listFiles(): FileInfo[] {
    return this._files;
  }

  getDependencies(file: string): string[] {
    return this._dependencies[file] ?? [];
  }

  getReverseDependencies(file: string): string[] {
    return this._reverseDependencies[file] ?? [];
  }

  startWatching() {
    if (this._watcher) return;
    this._watcher = chokidar.watch(this.projectRoot, {
      persistent: true,
      ignoreInitial: true,
      depth: 0,
      awaitWriteFinish: true,
    });
    const handler = async () => {
      await this._invokeAnalyzeProject();
    };
    this._watcher.on('add', handler);
    this._watcher.on('change', handler);
    this._watcher.on('unlink', handler);
  }

  stopWatching() {
    if (this._watcher) {
      this._watcher.close();
      this._watcher = undefined;
    }
  }

  saveCache(cacheFilePath: string) {
    this._cacheFilePath = cacheFilePath;
    const cache = {
      files: this._files,
      dependencies: this._dependencies,
      reverseDependencies: this._reverseDependencies,
    };
    fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2), 'utf8');
  }

  clearCache() {
    this._files = [];
    this._dependencies = {};
    this._reverseDependencies = {};
    if (this._cacheFilePath && fs.existsSync(this._cacheFilePath)) {
      fs.unlinkSync(this._cacheFilePath);
    }
  }

  // テストで差し替えやすいanalyzeProject呼び出しラッパー
  protected async _invokeAnalyzeProject() {
    await this.analyzeProject();
  }
}
