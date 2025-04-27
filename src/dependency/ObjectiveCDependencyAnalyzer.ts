import fs from 'fs';
import path from 'path';
import { IDependencyAnalyzer } from './IDependencyAnalyzer';

/**
 * Objective-C の #import/#include 依存関係を抽出するアナライザー
 * #import "hoge.h" / #import <hoge.h> / #include "hoge.h" / #include <hoge.h>
 */
export class ObjectiveCDependencyAnalyzer implements IDependencyAnalyzer {
  analyze(projectRoot: string, exclude: string[] = []) {
    let files = fs.readdirSync(projectRoot).filter(f => f.endsWith('.m') || f.endsWith('.mm') || f.endsWith('.h'));
    if (exclude.length > 0) {
      files = files.filter(f => !exclude.includes(f));
    }
    const fileInfos = files.map(f => ({ path: f }));
    const dependencies: Record<string, string[]> = {};
    const reverseDependencies: Record<string, string[]> = {};
    for (const file of files) {
      const content = fs.readFileSync(path.join(projectRoot, file), 'utf8');
      // #import "hoge.h" / #import <hoge.h> / #include "hoge.h" / #include <hoge.h>
      const deps = Array.from(content.matchAll(/#(?:import|include)\s+["<]([\w_\-\.]+)[">]/g)).map(m => m[1]).filter(dep => files.includes(dep));
      dependencies[file] = deps;
      for (const dep of deps) {
        if (!reverseDependencies[dep]) reverseDependencies[dep] = [];
        reverseDependencies[dep].push(file);
      }
    }
    return { files: fileInfos, dependencies, reverseDependencies };
  }
}

export const objectiveCDependencyAnalyzer = new ObjectiveCDependencyAnalyzer();
