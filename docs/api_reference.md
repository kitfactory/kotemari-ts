# kotemari-ts APIリファレンス

## Kotemari クラス

### コンストラクタ
```
new Kotemari(options: KotemariOptions)
```
- `projectRoot: string` … 解析対象プロジェクトのルートパス
- `configPath?: string` … 設定ファイルパス（省略可）
- `useCache?: boolean` … キャッシュ利用（デフォルトtrue）
- `logLevel?: "silent" | "error" | "warn" | "info" | "debug"` … ログ出力レベル

### analyzeProject()
```
async analyzeProject(): Promise<void>
```
- プロジェクト内の.tsファイル依存関係を解析します。

### listFiles()
```
listFiles(): FileInfo[]
```
- 解析対象ファイル一覧を返します。
- `FileInfo`: `{ path: string }`

### getDependencies()
```
getDependencies(file: string): string[]
```
- 指定ファイルの依存先ファイル名配列を返します。

### getReverseDependencies()
```
getReverseDependencies(file: string): string[]
```
- 指定ファイルをimportしているファイル名配列を返します。

### getContext()
```
async getContext(file: string): Promise<string>
```
- 指定ファイル＋依存ファイル内容を連結した文脈文字列を返します。
- 存在しない場合は空文字列

### startWatching()
```
startWatching(): void
```
- ファイル追加・変更・削除を監視し、自動でanalyzeProjectを再実行します。

### stopWatching()
```
stopWatching(): void
```
- ファイル監視を停止します。

### saveCache()
```
saveCache(cacheFilePath: string): void
```
- 解析結果をキャッシュファイルに保存します。

### clearCache()
```
clearCache(): void
```
- メモリ上・キャッシュファイルをクリアします。

---

## 型定義
- `FileInfo`: `{ path: string }`
- `KotemariOptions`: `{ projectRoot: string; configPath?: string; useCache?: boolean; logLevel?: ... }`
- `KotemariConfig`: `{ exclude?: string[] }`

---

## 補足
- 詳細な設計思想や使い方は docs/concept.md も参照してください。
- サンプルコードは README.md を参照。
