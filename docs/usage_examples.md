# kotemari-ts 使用例・サンプルコード

## 基本的な使い方

```typescript
import { Kotemari } from 'kotemari-ts';

const km = new Kotemari({
  projectRoot: '/path/to/your/project',
  mode: 'localLLM', // または 'cloudLLM'
});

await km.analyzeProject();

// 依存ファイルを含めた文脈取得
const context = await km.getContext('src/main.ts');
console.log(context);
```

## maxContextLength の指定

```typescript
const km = new Kotemari({
  projectRoot: '/path/to/your/project',
  maxContextLength: 1024, // 最大文脈長を明示的に指定
});
```

## キャッシュキーの利用

```typescript
const key = km.generateContextCacheKey('src/main.ts');
console.log('cache key:', key);
```

## 設定ファイル（YAML）を使う例

```yaml
# kotemari.config.yaml
maxContextLength: 2048
exclude:
  - node_modules
  - dist
```

```typescript
const km = new Kotemari({
  projectRoot: '/path/to/your/project',
  configPath: 'kotemari.config.yaml',
});
```

## ファイル監視の利用

```typescript
km.startWatching();
// ... ファイル追加・変更・削除を自動で検知して依存解析を再実行
// 停止したい場合
km.stopWatching();
```

---

より詳細な設計思想やAPI仕様は docs/concept.md, docs/api_reference.md を参照してください。
