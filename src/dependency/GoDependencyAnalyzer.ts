import fs from 'fs';
import path from 'path';
import { IDependencyAnalyzer } from './IDependencyAnalyzer';

export class GoDependencyAnalyzer implements IDependencyAnalyzer {
  analyze(projectRoot: string, exclude: string[] = []) {
    let files = fs.readdirSync(projectRoot).filter(f => f.endsWith('.go'));
    if (exclude.length > 0) {
      files = files.filter(f => !exclude.includes(f));
    }
    const fileInfos = files.map(f => ({ path: f }));
    const dependencies: Record<string, string[]> = {};
    const reverseDependencies: Record<string, string[]> = {};
    for (const file of files) {
      const content = fs.readFileSync(path.join(projectRoot, file), 'utf8');
      // Go: import "./b" or import (
      //  "./b"
      // )
      const deps: string[] = [];
      // 単一import文
      for (const m of content.matchAll(/import\s+"(\.\/([\w_]+))"/g)) {
        deps.push(m[2] + '.go');
      }
      // importブロック
      for (const block of content.matchAll(/import\s*\(([\s\S]*?)\)/g)) {
        for (const m of block[1].matchAll(/"(\.\/([\w_]+))"/g)) {
          deps.push(m[2] + '.go');
        }
      }
      dependencies[file] = deps;
      for (const dep of deps) {
        if (!reverseDependencies[dep]) reverseDependencies[dep] = [];
        reverseDependencies[dep].push(file);
      }
    }
    return { files: fileInfos, dependencies, reverseDependencies };
  }
}

export const goDependencyAnalyzer = new GoDependencyAnalyzer();
