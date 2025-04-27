<div align="center">
  <img src="docs/logo.png" alt="kotemari-ts logo" width="180" />
</div>

# kotemari-ts

A magical context management library for LLM applications, written in TypeScript.

## Overview

kotemari-ts helps you generate, cache, and manage stable contexts for LLM (Large Language Model) apps. It analyzes TypeScript project dependencies and generates consistent context strings, making prompt engineering and LLM integration easier, faster, and more reliable.

---

## Features
- **Stable Context Generation:** Always generates the same context if dependencies and code are unchanged.
- **Fast with Caching:** Reuses previously generated contexts for faster LLM responses.
- **Flexible Modes:** Automatically adjusts context length for local/cloud LLMs.
- **Multi-language Ready:** Designed for TypeScript, but extensible to Python and more.
- **Simple API:** Easy to use from small scripts to large apps.
- **Fun to Use:** Focuses on developer experience and productivity.

---

## Why Context Management Matters

Modern LLMs (Large Language Models) have a limited context window (token length), which restricts the amount of code and information that can be passed in a single prompt. kotemari-ts addresses this challenge by:

- Allowing you to set the maximum context length to fit the LLM you use (local/cloud, free/paid).
- Automatically generating concise and relevant context strings by including only the necessary files and dependencies.
- Supporting flexible context optimization policies: use longer contexts for local LLMs, or minimize context for paid APIs to reduce costs.
- Ensuring cache consistency: the same input always generates the same context string, making results reproducible and cacheable.

These features make kotemari-ts an essential companion for LLM-based code tools, ensuring efficiency, reliability, and cost-effectiveness.

---

## Main API (Usage Examples)


## 主なAPI

### Kotemari クラス
```ts
import { Kotemari } from './src/kotemari';
const k = new Kotemari({ projectRoot: './myproject' });
```

### analyzeProject()
プロジェクト内の.tsファイル依存関係を解析します。
```ts
await k.analyzeProject();
```

### listFiles()
解析対象となったファイル一覧を取得します。
```ts
const files = k.listFiles(); // [{ path: 'a.ts' }, ...]
```

### getDependencies(file: string)
ファイルの依存先ファイル名配列を取得します。
```ts
const deps = k.getDependencies('a.ts'); // ['b.ts', ...]
```

### getReverseDependencies(file: string)
指定ファイルをimportしているファイル名配列を取得します。
```ts
const revs = k.getReverseDependencies('b.ts'); // ['a.ts', ...]
```

### getContext(file: string)
指定ファイル＋依存ファイル内容を連結した文脈文字列を返します。
```ts
const ctx = await k.getContext('a.ts');
```

### startWatching()/stopWatching()
ファイル追加・変更・削除を監視し、自動でanalyzeProjectを再実行します。
```ts
k.startWatching();
// ...
k.stopWatching();
```

### clearCache()
キャッシュをクリアします。
```ts
k.clearCache();
```

---

## Example Usage

```ts
import { Kotemari } from 'kotemari-ts';

(async () => {
  const k = new Kotemari({ projectRoot: './sample_project' });
  await k.analyzeProject();

  for (const file of k.listFiles()) {
    console.log('File:', file.path);
    console.log('Dependencies:', k.getDependencies(file.path));
    console.log('Reverse Dependencies:', k.getReverseDependencies(file.path));
    const ctx = await k.getContext(file.path);
    console.log('Context:\n', ctx);
  }

  k.startWatching();
  // ...file operations...
  k.stopWatching();
})();
```

---

## Installation

```sh
npm install kotemari-ts
# or
yarn add kotemari-ts
# or
pnpm add kotemari-ts
```

### Requirements
- Node.js 18 or later recommended
- Works with TypeScript projects

---

## Directory Structure
- `src/` : Library source code
- `test/` : Test cases
- `docs/` : Documentation (API reference, concepts, usage examples)

---

## Development & Contribution
1. Clone this repo
2. Install dependencies with `pnpm install`
3. Run tests: `pnpm test`
4. Lint: `pnpm lint`
5. Build: `pnpm build`

Feel free to open issues or pull requests!

---

## FAQ
- **Q: Can I use this with non-TypeScript projects?**
  - A: Core features are TypeScript-centric, but the architecture allows for extension to other languages.
- **Q: How do I adjust context length for different LLMs?**
  - A: Use the `mode` option (`cloudLLM` or `localLLM`).
- **Q: What if my project is very large?**
  - A: kotemari-ts is optimized for performance and uses caching, but context length is ultimately limited by your target LLM.

---

## License
MIT

---

## References & Links
- [API Reference](./docs/api_reference.md)
- [Concepts](./docs/concept.md)
- [Usage Examples](./docs/usage_examples.md)

---

## Author
kotemari-ts contributors
