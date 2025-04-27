# Python版→TypeScript版 クラス・関数構成マッピング

## 全体方針
- Python版kotemariの主要API・クラス構成をTypeScriptで忠実に再現
- TypeScript/Node.jsのエコシステムに最適化した設計・型定義を付与

---

## クラス・APIマッピング一覧

| Python (kotemari)         | TypeScript (kotemari-ts)           | 説明 |
|--------------------------|------------------------------------|------|
| Kotemari (class)         | Kotemari (class)                   | メイン分析クラス |
| __init__                 | constructor(options: KotemariOptions) | 初期化・設定管理 |
| analyze_project()        | analyzeProject(): Promise<void>    | プロジェクト全体の依存解析 |
| list_files()             | listFiles(): FileInfo[]            | 解析対象ファイル一覧取得 |
| get_dependencies(path)   | getDependencies(path: string): string[] | ファイルの依存先取得 |
| get_reverse_dependencies(path) | getReverseDependencies(path: string): string[] | ファイルの依存元取得 |
| get_context(path, ...)   | getContext(path: string, opts?): string | コンテキスト文字列生成 |
| start_watching()         | startWatching(): void              | ファイル監視開始 |
| stop_watching()          | stopWatching(): void               | ファイル監視停止 |
| clear_cache()            | clearCache(): void                 | キャッシュクリア |

---

## TypeScriptでの追加設計ポイント
- 各メソッドの型定義（例: FileInfo型、Promise型など）
- 設定ファイル（.kotemari.yml）読み込みはyamlパーサ利用
- ファイル監視はNode.jsのfs.watch等を活用
- import/export解析はTypeScriptパーサ利用を想定
- キャッシュはメモリ/ファイル両対応を検討

---

今後はこのマッピングに沿って各API・クラスを実装していきます。
