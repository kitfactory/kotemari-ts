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
import { pythonDependencyAnalyzer } from "./dependency/PythonDependencyAnalyzer";
import { shellDependencyAnalyzer } from "./dependency/ShellDependencyAnalyzer";
import { goDependencyAnalyzer } from "./dependency/GoDependencyAnalyzer";
import { rubyDependencyAnalyzer } from "./dependency/RubyDependencyAnalyzer";
import { IDependencyAnalyzer } from "./dependency/IDependencyAnalyzer";
import { cDependencyAnalyzer } from "./dependency/CDependencyAnalyzer";
import { objectiveCDependencyAnalyzer } from "./dependency/ObjectiveCDependencyAnalyzer";

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

  private analyzers: { [ext: string]: IDependencyAnalyzer } = {
    ".ts": typeScriptDependencyAnalyzer,
    ".py": pythonDependencyAnalyzer,
    ".sh": shellDependencyAnalyzer,
    ".go": goDependencyAnalyzer,
    ".rb": rubyDependencyAnalyzer,
    ".c": cDependencyAnalyzer,
    ".cpp": cDependencyAnalyzer,
    ".h": cDependencyAnalyzer,
    ".hpp": cDependencyAnalyzer,
    ".m": objectiveCDependencyAnalyzer,
    ".mm": objectiveCDependencyAnalyzer
  };


  async analyzeProject(): Promise<void> {
    // 対応拡張子ごとにファイルをグループ化し、各アナライザーで解析
    const fileSet = new Set<string>();
    const allFiles: { path: string }[] = [];
    const allDependencies: Record<string, string[]> = {};
    const allReverseDependencies: Record<string, string[]> = {};
    const exclude = this._config.exclude ?? [];
    for (const [ext, analyzer] of Object.entries(this.analyzers)) {
      const { files, dependencies, reverseDependencies } = analyzer.analyze(this.projectRoot, exclude);
      for (const f of files) {
        if (!fileSet.has(f.path)) {
          fileSet.add(f.path);
          allFiles.push(f);
        }
      }
      for (const [k, v] of Object.entries(dependencies)) {
        if (!allDependencies[k]) allDependencies[k] = [];
        for (const dep of v) {
          if (!allDependencies[k].includes(dep)) allDependencies[k].push(dep);
        }
      }
      for (const [k, v] of Object.entries(reverseDependencies)) {
        if (!allReverseDependencies[k]) allReverseDependencies[k] = [];
        for (const dep of v) {
          if (!allReverseDependencies[k].includes(dep)) allReverseDependencies[k].push(dep);
        }
      }
    }
    this._files = allFiles;
    this._dependencies = allDependencies;
    this._reverseDependencies = allReverseDependencies;
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
