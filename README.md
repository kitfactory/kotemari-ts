# kotemari-ts

TypeScript製の依存関係解析＆文脈生成ライブラリです。

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

## サンプルコード

```ts
import { Kotemari } from './src/kotemari';

(async () => {
  const k = new Kotemari({ projectRoot: './sample_project' });
  await k.analyzeProject();

  for (const file of k.listFiles()) {
    console.log('ファイル:', file.path);
    console.log('依存:', k.getDependencies(file.path));
    console.log('逆依存:', k.getReverseDependencies(file.path));
    const ctx = await k.getContext(file.path);
    console.log('文脈:\n', ctx);
  }

  k.startWatching();
  // ...ファイル操作...
  k.stopWatching();
})();
```

---

## 詳細APIリファレンス
- docs/concept.md も参照してください。
- 型定義は src/kotemari.ts をご覧ください。
