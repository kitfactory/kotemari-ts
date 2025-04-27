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
- `maxContextLength?: number` … 文脈最大長（文字数、未指定時はmode等で決定）
- `mode?: string` … 利用モード（'localLLM', 'cloudLLM' など。localLLMは4000字、cloudLLMは8000字がデフォルト）

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
- `maxContextLength` で指定された最大長を超えないように優先順位制御（呼び出し元→依存ファイル順）でトリミングされます。

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

### generateContextCacheKey()
```
generateContextCacheKey(file: string): string
```
- 指定ファイルの文脈内容・依存・maxContextLength・モード等をまとめてハッシュ化したキャッシュキーを返します。

### clearCache()
```
clearCache(): void
```
- メモリ上・キャッシュファイルをクリアします。

---

## 型定義
- `FileInfo`: `{ path: string }`
- `KotemariOptions`: `{ projectRoot: string; configPath?: string; useCache?: boolean; logLevel?: string; maxContextLength?: number; mode?: string }`
- `KotemariConfig`: `{ exclude?: string[] }`

---

## 補足
- 詳細な設計思想や使い方は docs/concept.md も参照してください。
- サンプルコードは README.md を参照。
