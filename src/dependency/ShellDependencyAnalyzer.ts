import fs from 'fs';
import path from 'path';
import { IDependencyAnalyzer } from './IDependencyAnalyzer';

export class ShellDependencyAnalyzer implements IDependencyAnalyzer {
  analyze(projectRoot: string, exclude: string[] = []) {
    let files = fs.readdirSync(projectRoot).filter(f => f.endsWith('.sh'));
    if (exclude.length > 0) {
      files = files.filter(f => !exclude.includes(f));
    }
    const fileInfos = files.map(f => ({ path: f }));
    const dependencies: Record<string, string[]> = {};
    const reverseDependencies: Record<string, string[]> = {};
    for (const file of files) {
      const content = fs.readFileSync(path.join(projectRoot, file), 'utf8');
      // Shell: source ./filename.sh or . ./filename.sh
      const deps = Array.from(content.matchAll(/(?:source|\.)\s+\.\/([\w_]+)\.sh/g)).map(m => m[1] + '.sh');
      dependencies[file] = deps;
      for (const dep of deps) {
        if (!reverseDependencies[dep]) reverseDependencies[dep] = [];
        reverseDependencies[dep].push(file);
      }
    }
    return { files: fileInfos, dependencies, reverseDependencies };
  }
}

export const shellDependencyAnalyzer = new ShellDependencyAnalyzer();
