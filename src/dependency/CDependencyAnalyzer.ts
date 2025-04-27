import fs from 'fs';
import path from 'path';
import { IDependencyAnalyzer } from './IDependencyAnalyzer';

/**
 * C/C++ の #include 依存関係を抽出するアナライザー
 * #include "hoge.h" または #include <hoge.h> を検出し、同ディレクトリ内のファイルを依存とみなす
 */
export class CDependencyAnalyzer implements IDependencyAnalyzer {
  analyze(projectRoot: string, exclude: string[] = []) {
    let files = fs.readdirSync(projectRoot).filter(f => f.endsWith('.c') || f.endsWith('.cpp') || f.endsWith('.h') || f.endsWith('.hpp'));
    if (exclude.length > 0) {
      files = files.filter(f => !exclude.includes(f));
    }
    const fileInfos = files.map(f => ({ path: f }));
    const dependencies: Record<string, string[]> = {};
    const reverseDependencies: Record<string, string[]> = {};
    for (const file of files) {
      const content = fs.readFileSync(path.join(projectRoot, file), 'utf8');
      // #include "hoge.h" または #include <hoge.h>
      const deps = Array.from(content.matchAll(/#include\s+["<]([\w_\-\.]+)[">]/g)).map(m => m[1]).filter(dep => files.includes(dep));
      dependencies[file] = deps;
      for (const dep of deps) {
        if (!reverseDependencies[dep]) reverseDependencies[dep] = [];
        reverseDependencies[dep].push(file);
      }
    }
    return { files: fileInfos, dependencies, reverseDependencies };
  }
}

export const cDependencyAnalyzer = new CDependencyAnalyzer();
