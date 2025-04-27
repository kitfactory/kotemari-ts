import fs from 'fs';
import path from 'path';
import { IDependencyAnalyzer } from './IDependencyAnalyzer';

export class RubyDependencyAnalyzer implements IDependencyAnalyzer {
  analyze(projectRoot: string, exclude: string[] = []) {
    let files = fs.readdirSync(projectRoot).filter(f => f.endsWith('.rb'));
    if (exclude.length > 0) {
      files = files.filter(f => !exclude.includes(f));
    }
    const fileInfos = files.map(f => ({ path: f }));
    const dependencies: Record<string, string[]> = {};
    const reverseDependencies: Record<string, string[]> = {};
    for (const file of files) {
      const content = fs.readFileSync(path.join(projectRoot, file), 'utf8');
      // Ruby: require './filename' or require_relative 'filename'
      const deps = Array.from(content.matchAll(/require(?:_relative)?\s+["']\.\/?([\w_]+)["']/g)).map(m => m[1] + '.rb');
      dependencies[file] = deps;
      for (const dep of deps) {
        if (!reverseDependencies[dep]) reverseDependencies[dep] = [];
        reverseDependencies[dep].push(file);
      }
    }
    return { files: fileInfos, dependencies, reverseDependencies };
  }
}

export const rubyDependencyAnalyzer = new RubyDependencyAnalyzer();
