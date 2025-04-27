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

import * as chokidar from "chokidar";
import { typeScriptDependencyAnalyzer } from "./dependency/TypeScriptDependencyAnalyzer";
import { IDependencyAnalyzer } from "./dependency/IDependencyAnalyzer";

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
  private _watcher?: import("chokidar").FSWatcher;

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

  private analyzer: IDependencyAnalyzer = typeScriptDependencyAnalyzer;

  async analyzeProject(): Promise<void> {
    // 今後の多言語対応のため、拡張子ごとにアナライザーを切り替える設計に備える
    // 現状はTypeScriptのみ対応
    const { files, dependencies, reverseDependencies } = this.analyzer.analyze(
      this.projectRoot,
      this._config.exclude ?? []
    );
    this._files = files;
    this._dependencies = dependencies;
    this._reverseDependencies = reverseDependencies;
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

  /**
   * 指定ファイルとその依存ファイルの内容を連結した文脈文字列を返す
   * @param file 対象ファイル名
   */
  async getContext(file: string): Promise<string> {
    if (!this._files.find(f => f.path === file)) return '';
    const visited = new Set<string>();
    const gather = (f: string): string => {
      if (visited.has(f)) return '';
      visited.add(f);
      const filePath = path.join(this.projectRoot, f);
      let content = '';
      if (fs.existsSync(filePath)) {
        content = fs.readFileSync(filePath, 'utf8');
      }
      const deps = this.getDependencies(f);
      for (const dep of deps) {
        content += '\n' + gather(dep);
      }
      return content;
    };
    return gather(file);
  }
}
