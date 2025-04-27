import path from "path";
import fs from "fs";

export interface FileInfo {
  path: string;
}

export interface KotemariOptions {
  projectRoot: string;
  configPath?: string;
  useCache?: boolean;
  logLevel?: "silent" | "error" | "warn" | "info" | "debug";
}

export class Kotemari {
  projectRoot: string;
  configPath?: string;
  useCache: boolean;
  logLevel: "silent" | "error" | "warn" | "info" | "debug";
  private _files: FileInfo[] = [];
  private _dependencies: Record<string, string[]> = {};
  private _reverseDependencies: Record<string, string[]> = {};

  constructor(options: KotemariOptions) {
    this.projectRoot = options.projectRoot;
    this.configPath = options.configPath;
    this.useCache = options.useCache ?? true;
    this.logLevel = options.logLevel ?? "warn";
  }

  async analyzeProject(): Promise<void> {
    const files = fs.readdirSync(this.projectRoot).filter(f => f.endsWith('.ts'));
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
}
